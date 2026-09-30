/**
 * Bhubaneswar Engineering College (BEC) Accounts & Finance System
 * Firebase Cloud Firestore Integration
 * Project: becaccount
 */

const https = require('https');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCduVYcPTGfeCdu0a5J2VMwYnVx-YI3OL8",
  authDomain: "becaccount.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "becaccount",
  storageBucket: "becaccount.firebasestorage.app",
  messagingSenderId: "344226455152",
  appId: "1:344226455152:web:936d5348782772df5fdeb5"
};

/**
 * Format a JavaScript object into Firestore REST API fields format
 */
function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'object') {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}

/**
 * Sync Payment & Receipt Record to Cloud Firestore
 * @param {Object} paymentData
 */
async function syncPaymentToFirestore(paymentData) {
  try {
    const docData = {
      payment_no: paymentData.paymentNo || paymentData.payment_no || `PAY-${Date.now()}`,
      receipt_no: paymentData.receiptNo || paymentData.receipt_no || '',
      student_id: paymentData.studentId || paymentData.student_id || 0,
      student_name: paymentData.studentName || paymentData.student_name || 'Student',
      reg_no: paymentData.regNo || paymentData.reg_no || '',
      roll_no: paymentData.rollNo || paymentData.roll_no || '',
      branch: paymentData.branch || paymentData.branch_code || 'Engineering',
      amount: parseFloat(paymentData.amount || 0),
      payment_method: paymentData.paymentMethod || paymentData.payment_method || 'CASH',
      transaction_id: paymentData.transactionId || paymentData.transaction_id || '',
      fee_category: paymentData.feeCategory || paymentData.fee_category || 'Academic Fee',
      status: paymentData.status || 'SUCCESS',
      source: paymentData.source || 'PORTAL',
      created_at: new Date().toISOString(),
      timestamp: Date.now()
    };

    const payload = JSON.stringify({ fields: toFirestoreFields(docData) });

    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/payments?key=${firebaseConfig.apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Firebase] Payment ${docData.payment_no} (${docData.receipt_no}) synced to Cloud Firestore.`);
            resolve({ success: true, docId: docData.payment_no });
          } else {
            console.warn(`[Firebase Sync Notice] HTTP ${res.statusCode}:`, responseBody.slice(0, 150));
            resolve({ success: false, error: responseBody });
          }
        });
      });

      req.on('error', (err) => {
        console.warn('[Firebase Sync Notice] Network warning:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.write(payload);
      req.end();
    });
  } catch (err) {
    console.warn('[Firebase Sync Notice] Error during sync:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  firebaseConfig,
  syncPaymentToFirestore
};
