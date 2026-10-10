const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayCurfewAlerts.js';
let s = fs.readFileSync(filePath, 'utf8');

const oldCode = `    // Record in sms_logs
    await pool.query(\`
      INSERT INTO sms_logs (phone, recipient_name, roll_number, message, status, template, channel, created_at) VALUES (?, ?, ?, ?, 'DELIVERED', 'PARENT_CURFEW_ALERT', 'SMS', NOW())
    \`, [targetPhone, message]);`;

const newCode = `    // Record in sms_logs
    await pool.query(\`
      INSERT INTO sms_logs (phone, recipient_name, roll_number, message, status, template, channel, created_at) VALUES (?, ?, ?, ?, 'DELIVERED', 'PARENT_CURFEW_ALERT', 'SMS', NOW())
    \`, [targetPhone, studentName || 'Student', rollNumber || 'N/A', message]);`;

s = s.replace(oldCode, newCode);
fs.writeFileSync(filePath, s, 'utf8');
console.log('Fixed query params in gatewayCurfewAlerts.js');
