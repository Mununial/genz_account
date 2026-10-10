const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/student-portal.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Desktop Language & SOS trigger buttons
const desktopPattern = /\s*<!-- Universal Language Switcher -->[\s\S]*?<!-- Food Menu Quick Trigger -->/;
if (desktopPattern.test(content)) {
  content = content.replace(desktopPattern, '\n          <!-- Food Menu Quick Trigger -->');
  console.log('Successfully removed desktop language and SOS triggers.');
} else {
  console.log('WARNING: Desktop pattern not matched!');
}

// 2. Remove Mobile Language & SOS action buttons
const mobilePattern = /\s*<button class="mobile-action-btn" onclick="window\.i18n && window\.i18n\.openLanguageModal\(\)"[\s\S]*?<button class="mobile-action-btn" onclick="window\.location\.href='\/sos'"[\s\S]*?<\/button>/;
if (mobilePattern.test(content)) {
  content = content.replace(mobilePattern, '');
  console.log('Successfully removed mobile language and SOS triggers.');
} else {
  console.log('WARNING: Mobile pattern not matched!');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');
