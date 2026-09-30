const fs = require('fs');

const html = fs.readFileSync('frontend/student-fee.html', 'utf8');
const js = fs.readFileSync('frontend/js/becRealFee.js', 'utf8');

console.log('--- HTML CHECK ---');
console.log('HTML has sfdDropdownResults:', html.includes('id="sfdDropdownResults"'));
console.log('HTML sfdStudentName has oninput:', html.includes('oninput="becRealFee.onStudentFeeSearchInput(event)"'));
console.log('HTML sfdStudentName has onfocus:', html.includes('onfocus="becRealFee.onStudentFeeInputFocus(event)"'));
console.log('HTML sfdStudentName has onclick:', html.includes('onclick="becRealFee.onStudentFeeInputClick(event)"'));
console.log('HTML sfdStudentName is readonly:', html.includes('id="sfdStudentName" class="form-control" placeholder="Select student via [...]" readonly'));

console.log('\n--- JS CHECK ---');
console.log('JS has onStudentFeeSearchInput:', js.includes('onStudentFeeSearchInput'));
console.log('JS has onStudentFeeInputFocus:', js.includes('onStudentFeeInputFocus'));
console.log('JS has selectStudentFromDropdown:', js.includes('selectStudentFromDropdown'));
console.log('JS has openStudentPickerModal:', js.includes('openStudentPickerModal'));
console.log('JS has filterStudentPicker alias:', js.includes('filterStudentPicker()'));
