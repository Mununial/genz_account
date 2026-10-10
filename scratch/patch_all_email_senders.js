const fs = require('fs');

// 1. campus-portal/.env
const envPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/.env';
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(/EMAIL_FROM_NAME=.*/g, 'EMAIL_FROM_NAME="GenZ University Digital Campus"');
  fs.writeFileSync(envPath, env, 'utf8');
  console.log('Updated campus-portal/.env');
}

// 2. campus-portal/services/directorMonthlyReportService.js
const dirReportPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/services/directorMonthlyReportService.js';
if (fs.existsSync(dirReportPath)) {
  let code = fs.readFileSync(dirReportPath, 'utf8');
  code = code.replace(/from:\s*`"\$\{process\.env\.EMAIL_FROM_NAME[^`]+`/g, 'from: `"${process.env.EMAIL_FROM_NAME || "GenZ University Digital Campus"}" <${senderEmail}>`');
  fs.writeFileSync(dirReportPath, code, 'utf8');
  console.log('Updated directorMonthlyReportService.js');
}

// 3. campus-portal/services/documentDispatchService.js
const docDispatchPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/services/documentDispatchService.js';
if (fs.existsSync(docDispatchPath)) {
  let code = fs.readFileSync(docDispatchPath, 'utf8');
  code = code.replace(/from:\s*`"\$\{process\.env\.EMAIL_FROM_NAME[^`]+`/g, 'from: `"${process.env.EMAIL_FROM_NAME || "GenZ University Digital Campus"}" <${senderEmail}>`');
  fs.writeFileSync(docDispatchPath, code, 'utf8');
  console.log('Updated documentDispatchService.js');
}

// 4. campus-portal/services/emailService.js
const emailServicePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/services/emailService.js';
if (fs.existsSync(emailServicePath)) {
  let code = fs.readFileSync(emailServicePath, 'utf8');
  code = code.replace(/from:\s*`"\$\{process\.env\.EMAIL_FROM_NAME[^`]+`/g, 'from: `"${process.env.EMAIL_FROM_NAME || "GenZ University Digital Campus"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER}>`');
  fs.writeFileSync(emailServicePath, code, 'utf8');
  console.log('Updated emailService.js');
}

// 5. passNotificationService.js in both locations
const passPaths = [
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/services/passNotificationService.js',
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/services/passNotificationService.js'
];
passPaths.forEach(p => {
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    code = code.replace(/from:\s*`"GenZ Security & Hostel Desk"/g, 'from: `"GenZ University Digital Campus"');
    code = code.replace(/from:\s*`"GenZ Campus Security & Hostel Desk"/g, 'from: `"GenZ University Digital Campus"');
    code = code.replace(/from:\s*`"GenZ Campus Security"/g, 'from: `"GenZ University Digital Campus"');
    code = code.replace(/from:\s*`"GenZ University Campus Security"/g, 'from: `"GenZ University Digital Campus"');
    code = code.replace(/from:\s*`"GenZ Academic & Hostel Administration"/g, 'from: `"GenZ University Digital Campus"');
    fs.writeFileSync(p, code, 'utf8');
    console.log('Updated passNotificationService in', p);
  }
});

// 6. gatewaySupport.js
const supportPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewaySupport.js';
if (fs.existsSync(supportPath)) {
  let code = fs.readFileSync(supportPath, 'utf8');
  code = code.replace(/from:\s*`"GenZ University Campus Support"/g, 'from: `"GenZ University Digital Campus"');
  code = code.replace(/from:\s*`"GenZ Maintenance Dispatch"/g, 'from: `"GenZ University Digital Campus"');
  fs.writeFileSync(supportPath, code, 'utf8');
  console.log('Updated gatewaySupport.js');
}
