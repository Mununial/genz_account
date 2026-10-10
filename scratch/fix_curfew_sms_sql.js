const fs = require('fs');
const path = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayCurfewAlerts.js';
let s = fs.readFileSync(path, 'utf8');

// Replace warden insert
s = s.replace(
  /INSERT INTO sms_logs \(recipient, message, status, trigger_type, created_at\)\s*VALUES \(\?, \?, 'DELIVERED', 'WARDEN_CURFEW_ALERT', NOW\(\)\)/,
  "INSERT INTO sms_logs (phone, recipient_name, message, status, template, channel, created_at) VALUES (?, 'GENZ Chief Warden', ?, 'DELIVERED', 'WARDEN_CURFEW_ALERT', 'SMS', NOW())"
);

// Replace parent insert
s = s.replace(
  /INSERT INTO sms_logs \(recipient, message, status, trigger_type, created_at\)\s*VALUES \(\?, \?, 'DELIVERED', 'PARENT_CURFEW_ALERT', NOW\(\)\)/,
  "INSERT INTO sms_logs (phone, recipient_name, roll_number, message, status, template, channel, created_at) VALUES (?, ?, ?, ?, 'DELIVERED', 'PARENT_CURFEW_ALERT', 'SMS', NOW())"
);

// Also update parameters for parent insert
s = s.replace(
  /\], \[targetPhone, message\]\);/,
  "], [targetPhone, studentName, rollNumber, message]);"
);

fs.writeFileSync(path, s, 'utf8');
console.log('gatewayCurfewAlerts.js updated with valid sms_logs columns!');
