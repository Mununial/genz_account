const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayCurfewAlerts.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the notify-parents SQL block cleanly
const targetBlock = `    // Record in sms_logs
    await pool.query(\`
      INSERT INTO sms_logs (phone, recipient_name, roll_number, message, status, template, channel, created_at) VALUES (?, ?, ?, ?, 'DELIVERED', 'PARENT_CURFEW_ALERT', 'SMS', NOW())
    \`, [targetPhone, studentName, rollNumber, message]);`;

const cleanBlock = `    // Record in sms_logs
    await pool.query(
      'INSERT INTO sms_logs (phone, recipient_name, roll_number, message, status, template, channel, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [targetPhone, studentName || 'Student', rollNumber || 'N/A', message, 'DELIVERED', 'PARENT_CURFEW_ALERT', 'SMS']
    );`;

content = content.replace(/await pool\.query\(\`\s*INSERT INTO sms_logs[\s\S]*?\[targetPhone, studentName, rollNumber, message\]\);/, cleanBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned SQL successfully in gatewayCurfewAlerts.js');
