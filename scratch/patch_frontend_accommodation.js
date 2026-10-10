const fs = require('fs');

// 1. api.js
const apiPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/frontend/src/services/api.js';
let apiCode = fs.readFileSync(apiPath, 'utf8');

const oldCheck = "if (u.hostel_required === 'No' || u.isDayScholar) {";
const newCheck = "if ((u.hostel_required === 'No' || u.isDayScholar) && !u.isHosteller && !u.is_hosteller && u.hostelStatus !== 'Hosteller') {";

if (apiCode.includes(oldCheck)) {
  apiCode = apiCode.replace(oldCheck, newCheck);
  fs.writeFileSync(apiPath, apiCode, 'utf8');
  console.log('Patched api.js getMyAllocation check.');
} else {
  console.log('oldCheck not found in api.js');
}

// 2. StudentAccommodationPage.jsx
const sapPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/frontend/src/pages/StudentAccommodationPage.jsx';
let sapCode = fs.readFileSync(sapPath, 'utf8');

const oldSapErr = "if (err.response?.data?.isDayScholar || err.response?.status === 403) {";
const newSapErr = "if (err.response?.data?.isDayScholar === true) {";

if (sapCode.includes(oldSapErr)) {
  sapCode = sapCode.replace(oldSapErr, newSapErr);
  fs.writeFileSync(sapPath, sapCode, 'utf8');
  console.log('Patched StudentAccommodationPage.jsx error handler.');
} else {
  console.log('oldSapErr not found in StudentAccommodationPage.jsx');
}
