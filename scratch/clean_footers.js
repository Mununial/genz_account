const fs = require('fs');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned footers in:', filePath);
  }
}

replaceInFile(
  'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server/templates/smsTemplates.js',
  [
    ['- BEC Support', '- GenZ Support'],
    ['- BEC Emergency Desk', '- GenZ Emergency Desk'],
    ['- BEC Dean Academics', '- GenZ Dean Academics'],
    ['- BEC Chief Warden', '- GenZ Chief Warden'],
    ['- BEC Accounts', '- GenZ Accounts'],
    ['- BEC Admissions', '- GenZ Admissions'],
    ['- Office of Registrar, BEC', '- Office of Registrar, GenZ University'],
    ['- Student Services Desk, BEC', '- Student Services Desk, GenZ University'],
    ['- Examination Cell, BEC', '- Examination Cell, GenZ University'],
    ['- BEC Documentation Desk', '- GenZ Documentation Desk'],
    ['help@becbbsr.ac.in', 'support@genzuniversity.in'],
    ['CERT-BEC-2026', 'CERT-GZU-2026']
  ]
);
