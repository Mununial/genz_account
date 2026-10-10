const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified:', filePath);
  }
}

// 1. documentService.js
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/services/documentService.js',
  [
    ['BEC DIGITAL CAMPUS', 'GEN-Z DIGITAL CAMPUS'],
    ['BEC ERP:', 'GenZ Univ:']
  ]
);

// 2. Hostel Management documentService.js
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/services/documentService.js',
  [
    ['BEC DIGITAL CAMPUS', 'GEN-Z DIGITAL CAMPUS'],
    ['BEC ERP:', 'GenZ Univ:']
  ]
);

// 3. smsTemplates.js
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server/templates/smsTemplates.js',
  [
    ['[BEC ERP]', '[GenZ Univ]'],
    ['BEC ERP:', '[GenZ Univ]:'],
    ['https://bec.ac.in', 'https://genzuniversity.in']
  ]
);

// 4. admin.html
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html',
  [
    ['BEC Bus Fleet', 'GenZ Bus Fleet']
  ]
);

// 5. warden-visitors.html
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/warden-visitors.html',
  [
    ["'BEC')", "'GZU')"]
  ]
);

// 6. setup_welcome_email_template.js
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/scripts/setup_welcome_email_template.js',
  [
    ['Welcome to BEC Digital Campus', 'Welcome to GenZ Digital Campus']
  ]
);

// 7. campus-portal .env
replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/.env',
  [
    [',superadmin@bec.ac.in', ''],
    [',admin@college.ac.in', ''],
    ['@becbbsr.ac.in,', ''],
    ['@becbbsr.in,', ''],
    ['@bec.edu.in,', ''],
    ['@bec.ac.in', '']
  ]
);

console.log('Replacements completed successfully.');
