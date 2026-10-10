const fs = require('fs');
const xlsx = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/node_modules/xlsx');

function checkExcel(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(filePath, 'does not exist');
    return;
  }
  console.log('Reading:', filePath);
  const workbook = xlsx.readFile(filePath);
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    for (const row of data) {
      const str = JSON.stringify(row);
      if (str.includes('2301316095') || str.toLowerCase().includes('jitendra')) {
        console.log('Found in', sheetName, ':', JSON.stringify(row, null, 2));
      }
    }
  }
}

checkExcel('c:/Users/munun/OneDrive/Desktop/genz_account/Complete_Student_Report_2026-09-24.xlsx');
checkExcel('c:/Users/munun/OneDrive/Desktop/genz_account/final 1st Year database from reporting.xlsx');
