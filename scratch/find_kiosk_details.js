const fs = require('fs');

const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/kiosk.html';
const c = fs.readFileSync(p, 'utf8');

// Search for Jitendra or profile details in kiosk
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (
    l.includes('Nial') ||
    l.includes('Jitendra') ||
    l.includes('Birth') ||
    l.includes('birth') ||
    l.includes('DOB') ||
    l.includes('dob') ||
    l.includes('Date of')
  ) {
    console.log((i + 1) + ': ' + l.trim());
  }
});
