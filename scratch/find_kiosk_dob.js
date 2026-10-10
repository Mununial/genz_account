const fs = require('fs');

const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/kiosk.html';
const c = fs.readFileSync(p, 'utf8');
const lines = c.split('\n');

console.log('--- Screen comments in kiosk.html ---');
lines.forEach((l, i) => {
  if (l.includes('SCREEN') || l.includes('screen-')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
