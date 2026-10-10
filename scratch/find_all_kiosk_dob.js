const fs = require('fs');

const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/kiosk.html';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');

lines.forEach((l, i) => {
  if (l.toLowerCase().includes('dob') || l.toLowerCase().includes('birth')) {
    console.log((i + 1) + ': ' + l.trim());
  }
});
