/**
 * Fast2SMS Compact Notification Service
 * Gen-Z University Accounts & Campus ERP
 * 
 * DESIGN PRINCIPLE:
 * All SMS templates are strictly optimized under 140 GSM-7 characters to ensure:
 * 1. Single SMS credit (1 credit = Rs.0.25) per transmission (kam paisa kharch hoga).
 * 2. Instant cellular deliverability across all Indian telecom operators.
 * 3. Clear institutional branding: "[GenZ Univ]" prefix.
 */

const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || '3lqdhCpj5nMYyeBZ9UJgrQ8oIN4Ls7Gf0i2PETHVxAK1O6XFbz9jWsIHG7LcPtdNZTEJrzawloFgkeKR';

/**
 * Low-level Fast2SMS Dispatcher
 */
function sendFast2Sms({ numbers, message, route = 'q' }) {
  return new Promise((resolve, reject) => {
    // Sanitize phone number to 10 digits
    const cleanNumbers = String(numbers || '')
      .split(',')
      .map(n => n.replace(/[^0-9]/g, '').slice(-10))
      .filter(n => n.length === 10)
      .join(',');

    if (!cleanNumbers) {
      console.warn('[Fast2SMS] No valid 10-digit Indian mobile numbers provided:', numbers);
      return resolve({ success: false, error: 'INVALID_NUMBERS' });
    }

    // Ensure message does not exceed 155 characters (safe threshold for 1 SMS credit)
    const truncatedMessage = String(message || '').slice(0, 155);

    const postData = JSON.stringify({
      route,
      message: truncatedMessage,
      language: 'english',
      flash: 0,
      numbers: cleanNumbers
    });

    const options = {
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return === true || parsed.status_code === 200) {
            console.log(`[Fast2SMS] Delivered to ${cleanNumbers} | RequestID: ${parsed.request_id || 'OK'}`);
            resolve({ success: true, data: parsed, charCount: truncatedMessage.length });
          } else {
            console.warn(`[Fast2SMS] Provider Notice [${parsed.status_code || res.statusCode}]: ${parsed.message || data}`);
            resolve({ success: false, data: parsed, message: parsed.message, charCount: truncatedMessage.length });
          }
        } catch (e) {
          resolve({ success: false, raw: data, status: res.statusCode, charCount: truncatedMessage.length });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Fast2SMS] Network connection error:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      console.warn('[Fast2SMS] Request timed out after 8s');
      resolve({ success: false, error: 'TIMEOUT' });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 1. Technician Maintenance Work Order SMS (< 130 chars)
 */
async function sendTechnicianSms({ phone, ticketId, room, priority }) {
  const cleanId = String(ticketId || 'TKT-1049').replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanRoom = (room || 'Lab 3/Block-B').slice(0, 25);
  const cleanPri = (priority || 'HIGH').toUpperCase();
  const msg = `[GenZ Univ] Ticket #${cleanId} assigned: ${cleanRoom}. Priority: ${cleanPri}. Action required on ERP desk.`;
  return sendFast2Sms({ numbers: phone, message: msg });
}

/**
 * 2. Fees & Payment Receipt SMS (< 130 chars)
 */
async function sendFeeReceiptSms({ phone, studentName, receiptNo, amount }) {
  const cleanName = (studentName || 'Student').split(' ')[0].slice(0, 15);
  const cleanRec = String(receiptNo || 'REC-8941').slice(0, 14);
  const cleanAmt = Number(amount || 0).toLocaleString('en-IN');
  const msg = `[GenZ Univ] Fee receipt #${cleanRec} of Rs.${cleanAmt} received for ${cleanName}. Download at cms.genzuniversity.in`;
  return sendFast2Sms({ numbers: phone, message: msg });
}

/**
 * 3. Daily Cafeteria / Mess Dining Menu SMS (< 135 chars)
 */
async function sendMessMenuSms({ phone, mealType = 'Lunch', items = 'Paneer Curry, Dal, Rice' }) {
  const cleanType = (mealType || 'Lunch').slice(0, 10);
  const cleanItems = (items || 'Paneer Curry, Dal, Rice').slice(0, 50);
  const msg = `[GenZ Univ] Today ${cleanType}: ${cleanItems}. Full menu on portal: genzuniversity.in/hostel`;
  return sendFast2Sms({ numbers: phone, message: msg });
}

/**
 * 4. Emergency SOS & Security Advisory SMS (< 130 chars)
 */
async function sendEmergencySms({ phone, alertTitle = 'Urgent Notice', location = 'Campus Block-A' }) {
  const cleanTitle = (alertTitle || 'Urgent Notice').slice(0, 30);
  const cleanLoc = (location || 'Block-A').slice(0, 20);
  const msg = `[GenZ Univ ALERT] ${cleanTitle} at ${cleanLoc}. Follow security advisory. Helpline: 0674-2970000.`;
  return sendFast2Sms({ numbers: phone, message: msg });
}

/**
 * 5. Document Request & Certificate Issued SMS (< 135 chars)
 */
async function sendCertificateSms({ phone, studentName, certType = 'Bonafide Certificate', certNo = 'GZU-CERT-9042' }) {
  const cleanName = (studentName || 'Student').split(' ')[0].slice(0, 15);
  const cleanType = (certType || 'Bonafide Certificate').slice(0, 20);
  const cleanNo = String(certNo || 'GZU-9042').slice(0, 14);
  const msg = `[GenZ Univ] ${cleanType} #${cleanNo} for ${cleanName} is APPROVED & issued. Download at cms.genzuniversity.in`;
  return sendFast2Sms({ numbers: phone, message: msg });
}

module.exports = {
  sendFast2Sms,
  sendTechnicianSms,
  sendFeeReceiptSms,
  sendMessMenuSms,
  sendEmergencySms,
  sendCertificateSms,
  FAST2SMS_API_KEY
};
