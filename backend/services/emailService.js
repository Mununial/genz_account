/**
 * Email Notification Service (Gmail SMTP)
 * Gen-Z University Accounts & ERP System
 */

const nodemailer = require('nodemailer');
const path = require('path');
const pdfService = require('./pdfService');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const gmailUser = process.env.GMAIL_USER || 'genzsupportbbsr@gmail.com';
const gmailPass = (process.env.GMAIL_PASS || 'gnbt ufoa qgah usyq').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

/**
 * Verify SMTP Connection
 */
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('[EmailService] SMTP Connection to Gmail successful (' + gmailUser + ')');
    return { success: true, user: gmailUser };
  } catch (error) {
    console.error('[EmailService] SMTP Connection error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send General Email
 */
async function sendEmail({ to, subject, text, html, attachments }) {
  try {
    const mailOptions = {
      from: `"GenZ University Digital Campus" <${gmailUser}>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Email sent successfully to', to, '| MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Failed to send email to', to, ':', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Payment Receipt Email to Student
 */
async function sendPaymentReceiptEmail({ to, studentName, receiptNo, amount, paymentMethod, transactionId, date }) {
  const subject = `Fee Payment Receipt - ${receiptNo} | Gen-Z University`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3B82F6;">
        <h2 style="color: #1E293B; margin: 0;">GEN-Z UNIVERSITY</h2>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">Official Accounts & Finance Management System</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 16px; color: #1E293B;">Dear <strong>${studentName || 'Student'}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for your payment. Your official digital receipt has been generated successfully.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Receipt Number:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0F172A;">${receiptNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Amount Paid:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669; font-size: 16px;">₹${Number(amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Payment Mode:</td>
              <td style="padding: 6px 0; text-align: right;">${paymentMethod || 'Online'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Transaction Ref:</td>
              <td style="padding: 6px 0; text-align: right; font-family: monospace;">${transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Date:</td>
              <td style="padding: 6px 0; text-align: right;">${date || new Date().toLocaleDateString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
          You can also download this receipt anytime directly from your 
          <a href="https://cms.genzuniversity.in/student-portal" style="color: #2563EB; text-decoration: none; font-weight: bold;">Student ERP Portal</a>.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8;">
        <p style="margin: 0;">Gen-Z University Accounts Office | Contact: accounts@genz.edu.in</p>
        <p style="margin: 4px 0 0 0;">This is an automated institutional notification.</p>
      </div>
    </div>
  `;

  let attachments = [];
  try {
    const pdf = await pdfService.generateReceiptPdf({ studentName, receiptNo, amount, paymentMethod, transactionId, date });
    attachments.push({
      filename: `Receipt_${(receiptNo || 'REC').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('[EmailService] Receipt PDF generation error:', err.message);
  }

  return sendEmail({ to, subject, html, attachments });
}

/**
 * Send Document / Certificate Issued Email
 */
async function sendCertificateEmail({ to, studentName, rollNo, certificateType, issueDate, certificateNo }) {
  const subject = `🎓 Certificate Issued: ${certificateType || 'Bonafide Certificate'} - ${studentName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 22px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 18px; border-bottom: 2px solid #8B5CF6;">
        <h2 style="color: #1E293B; margin: 0; letter-spacing: 0.5px;">GEN-Z UNIVERSITY</h2>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">Office of the Registrar & Academic Certifications</p>
      </div>

      <div style="padding: 24px 0;">
        <div style="display: inline-block; padding: 6px 12px; background: #EDE9FE; color: #7C3AED; font-weight: bold; border-radius: 20px; font-size: 12px; margin-bottom: 15px;">
          DOCUMENT DISPATCH NOTIFICATION
        </div>
        <h3 style="color: #0F172A; margin: 0 0 10px 0;">Official Document Released</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Dear <strong>${studentName || 'Student'}</strong> (Roll No: <strong>${rollNo || 'GENZ-2026-081'}</strong>),<br/>
          Your requested <strong>${certificateType || 'Bonafide Certificate / Character Certificate'}</strong> has been digitally verified, signed, and issued by the academic registrar office.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 18px 0;">
          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Certificate ID:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0F172A; font-family: monospace;">${certificateNo || 'GZU-CERT-9042'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Document Type:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #7C3AED;">${certificateType || 'Bonafide Certificate'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Date of Issue:</td>
              <td style="padding: 6px 0; text-align: right;">${issueDate || new Date().toLocaleDateString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B;">Digital Signature:</td>
              <td style="padding: 6px 0; text-align: right; color: #16A34A; font-weight: bold;">Verified by Registrar</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
          You can download and verify the digital PDF copy from the <a href="https://cms.genzuniversity.in" style="color: #7C3AED; font-weight: bold; text-decoration: none;">Student Portal Document Desk</a>.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8;">
        <p style="margin: 0;">Gen-Z University Academic Office | support: genzsupportbbsr@gmail.com</p>
      </div>
    </div>
  `;
  let attachments = [];
  try {
    const pdf = await pdfService.generateCertificatePdf({ studentName, rollNo, certificateType, issueDate, certificateNo });
    attachments.push({
      filename: `Certificate_${(rollNo || 'GENZ').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('[EmailService] Certificate PDF generation error:', err.message);
  }

  return sendEmail({ to, subject, html, attachments });
}

/**
 * Send Campus Gate Pass Approved Email
 */
async function sendGatePassEmail({ to, studentName, rollNo, passType, reason, validFrom, validTo, passId, wardenApproval }) {
  const subject = `🟢 Gate Pass Approved: #${passId || 'GP-8831'} - Gen-Z University Campus Security`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 22px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 18px; border-bottom: 2px solid #10B981;">
        <h2 style="color: #1E293B; margin: 0;">GEN-Z UNIVERSITY</h2>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">Campus Security & Hostel Administration</p>
      </div>

      <div style="padding: 24px 0;">
        <div style="display: inline-block; padding: 6px 12px; background: #D1FAE5; color: #059669; font-weight: bold; border-radius: 20px; font-size: 12px; margin-bottom: 15px;">
          GATE PASS ACTIVE & VERIFIED
        </div>
        <h3 style="color: #0F172A; margin: 0 0 10px 0;">Hostel Gate Pass Clearance</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Dear <strong>${studentName || 'Student'}</strong> (Roll No: <strong>${rollNo || 'GENZ-2026-081'}</strong>),<br/>
          Your gate pass application has been reviewed and approved by Chief Warden & Campus Security.
        </p>

        <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; margin: 18px 0;">
          <table style="width: 100%; font-size: 14px; color: #166534;">
            <tr>
              <td style="padding: 6px 0;">Pass ID:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; font-family: monospace;">${passId || 'GP-8831'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Category:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right;">${passType || 'Day Outing / Curfew Pass'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Valid From:</td>
              <td style="padding: 6px 0; text-align: right;">${validFrom || 'Today, 04:00 PM'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Reporting Deadline:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #DC2626; text-align: right;">${validTo || 'Today, 08:30 PM'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Warden Status:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803D;">${wardenApproval || 'Approved (OTP Verified)'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #475569; background: #FFFBEB; border: 1px solid #FDE68A; padding: 10px; border-radius: 6px;">
          ⚠️ <strong>Security Instruction:</strong> Present this email or QR badge at Gate No. 1 & 2 scanner while exiting and re-entering the campus.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8;">
        <p style="margin: 0;">Campus Security Control Room: +91-674-2970000 | emergency: genzsupportbbsr@gmail.com</p>
      </div>
    </div>
  `;
  let attachments = [];
  try {
    const pdf = await pdfService.generateGatePassPdf({ studentName, rollNo, passType, reason, validFrom, validTo, passId, wardenApproval });
    attachments.push({
      filename: `GatePass_${(passId || 'GP').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('[EmailService] GatePass PDF generation error:', err.message);
  }

  return sendEmail({ to, subject, html, attachments });
}

/**
 * Send Technician Work Order / Maintenance Ticket Email
 */
async function sendTechnicianTicketEmail({ to, technicianName, ticketId, roomOrLab, issueDescription, priority, reportedBy }) {
  const subject = `🛠️ Maintenance Work Order: #${ticketId || 'TKT-1049'} [${priority || 'HIGH'}] - Gen-Z University`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 22px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 18px; border-bottom: 2px solid #F59E0B;">
        <h2 style="color: #1E293B; margin: 0;">GEN-Z UNIVERSITY</h2>
        <p style="color: #64748B; font-size: 13px; margin: 4px 0 0 0;">Campus Maintenance & Technical Support Department</p>
      </div>

      <div style="padding: 24px 0;">
        <div style="display: inline-block; padding: 6px 12px; background: #FEF3C7; color: #D97706; font-weight: bold; border-radius: 20px; font-size: 12px; margin-bottom: 15px;">
          ACTION REQUIRED: ASSIGNED TICKET
        </div>
        <h3 style="color: #0F172A; margin: 0 0 10px 0;">Campus Technician Dispatch</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Hello <strong>${technicianName || 'Technical Team'}</strong>,<br/>
          A new service maintenance ticket has been assigned to your department for prompt resolution.
        </p>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; margin: 18px 0;">
          <table style="width: 100%; font-size: 14px; color: #92400E;">
            <tr>
              <td style="padding: 6px 0;">Ticket Number:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; font-family: monospace;">${ticketId || 'TKT-1049'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Location:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0F172A;">${roomOrLab || 'Computer Lab 3 / Block B, 2nd Floor'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Priority:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #DC2626;">${priority || 'High'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Reported By:</td>
              <td style="padding: 6px 0; text-align: right;">${reportedBy || 'Lab Assistant / Staff'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Issue Summary:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 500;">${issueDescription || 'Network switch port failure & LAN cable check'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
          Please update the ticket status on the <a href="https://cms.genzuniversity.in" style="color: #D97706; font-weight: bold; text-decoration: none;">ERP Maintenance Desk</a> after on-site inspection.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8;">
        <p style="margin: 0;">Gen-Z Campus Operations & Facilities Desk | genzsupportbbsr@gmail.com</p>
      </div>
    </div>
  `;
  let attachments = [];
  try {
    const pdf = await pdfService.generateTechnicianTicketPdf({ technicianName, ticketId, roomOrLab, issueDescription, priority, reportedBy });
    attachments.push({
      filename: `WorkOrder_${(ticketId || 'TKT').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('[EmailService] Technician Ticket PDF generation error:', err.message);
  }

  return sendEmail({ to, subject, html, attachments });
}

/**
 * Send Director Executive Daily Summary Report Email
 */
async function sendDirectorReportEmail({ to, directorName, date, totalCollections, activeStudents, pendingApprovals, systemHealth }) {
  const subject = `📊 Director's Daily Executive Overview - Gen-Z University (${date || new Date().toLocaleDateString('en-IN')})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 22px; border: 1px solid #CBD5E1; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 18px; border-bottom: 2px solid #0EA5E9; background: #0F172A; border-radius: 8px 8px 0 0; padding: 20px;">
        <h2 style="color: #38BDF8; margin: 0; letter-spacing: 1px;">GEN-Z UNIVERSITY</h2>
        <p style="color: #94A3B8; font-size: 13px; margin: 4px 0 0 0;">Board of Governors & Office of the Director</p>
      </div>

      <div style="padding: 24px 10px;">
        <h3 style="color: #0F172A; margin: 0 0 8px 0;">Respected ${directorName || 'Director'},</h3>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Here is your automated daily executive briefing summarizing campus finance, academic operations, and administrative health for <strong>${date || new Date().toLocaleDateString('en-IN')}</strong>.
        </p>

        <!-- KPI Grid -->
        <div style="display: flex; gap: 10px; margin: 20px 0;">
          <div style="flex: 1; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 12px; color: #166534; text-transform: uppercase;">Fee Collections</div>
            <div style="font-size: 18px; font-weight: bold; color: #15803D; margin-top: 4px;">${totalCollections || '₹4,85,000'}</div>
          </div>
          <div style="flex: 1; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 12px; color: #1E40AF; text-transform: uppercase;">Active Students</div>
            <div style="font-size: 18px; font-weight: bold; color: #1D4ED8; margin-top: 4px;">${activeStudents || '1,420'}</div>
          </div>
          <div style="flex: 1; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px; text-align: center;">
            <div style="font-size: 12px; color: #92400E; text-transform: uppercase;">Pending Approvals</div>
            <div style="font-size: 18px; font-weight: bold; color: #B45309; margin-top: 4px;">${pendingApprovals || '3'}</div>
          </div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 18px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1E293B; font-size: 14px;">Campus Operational Highlights:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
            <li>All Cloud Infrastructure & Databases online (${systemHealth || '99.98% uptime'}).</li>
            <li>Examination portal hall tickets generated for upcoming semester.</li>
            <li>Hostel security check-in compliance recorded at 98.4%.</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #64748B;">
          For full analytics charts and live audit trails, access the <a href="https://cms.genzuniversity.in" style="color: #0284C7; font-weight: bold; text-decoration: none;">Director's Analytics Dashboard</a>.
        </p>
      </div>

      <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8;">
        <p style="margin: 0;">Automated System Dispatch | Confidential Executive Report | genzsupportbbsr@gmail.com</p>
      </div>
    </div>
  `;

  let attachments = [];
  try {
    const pdf = await pdfService.generateDirectorReportPdf({ directorName, date, totalCollections, activeStudents, pendingApprovals, systemHealth });
    attachments.push({
      filename: `Director_Daily_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      content: pdf,
      contentType: 'application/pdf'
    });
  } catch (err) {
    console.error('[EmailService] Director Report PDF generation error:', err.message);
  }

  return sendEmail({ to, subject, html, attachments });
}

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  sendPaymentReceiptEmail,
  sendCertificateEmail,
  sendGatePassEmail,
  sendTechnicianTicketEmail,
  sendDirectorReportEmail
};

