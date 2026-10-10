const fs = require('fs');

const f = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/services/allocationService.js';
const content = fs.readFileSync(f, 'utf8');

const idx = content.indexOf('getStudentAllocationHistory = async');
console.log(content.substring(idx, idx + 1000));
