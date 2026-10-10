const fs = require('fs');
const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/kiosk.html';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  '<h3 class="dob-label">Enter Password</h3>\n          <p class="dob-sublabel">Please enter your 8-digit access password</p>',
  '<h3 class="dob-label">Enter Date of Birth</h3>\n          <p class="dob-sublabel">Format: DDMMYYYY (e.g. 12052005 for 12 May 2005)</p>'
);

c = c.replace(
  '<h3 class="dob-label">Enter Password</h3>\r\n          <p class="dob-sublabel">Please enter your 8-digit access password</p>',
  '<h3 class="dob-label">Enter Date of Birth</h3>\r\n          <p class="dob-sublabel">Format: DDMMYYYY (e.g. 12052005 for 12 May 2005)</p>'
);

fs.writeFileSync(p, c, 'utf8');
console.log('Updated kiosk.html label and sublabel.');
