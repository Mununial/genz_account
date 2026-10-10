/**
 * Email Notification Service (Gmail SMTP)
 * Gen-Z University Accounts & ERP System
 */

const nodemailer = require('nodemailer');
const path = require('path');
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
async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: `"Gen-Z University Support" <${gmailUser}>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`
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

  return sendEmail({ to, subject, html });
}

module.exports = {
  transporter,
  verifyConnection,
  sendEmail,
  sendPaymentReceiptEmail
};
