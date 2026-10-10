const fs = require('fs');

// 1. Patch gatewayStudent.js
const gwPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayStudent.js';
if (fs.existsSync(gwPath)) {
  let gw = fs.readFileSync(gwPath, 'utf8');
  gw = gw.replace(/\|\| '2301316095'/g, "|| ''");
  fs.writeFileSync(gwPath, gw, 'utf8');
  console.log('gatewayStudent.js patched.');
}

// 2. Patch student-portal.html
const spPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/student-portal.html';
if (fs.existsSync(spPath)) {
  let sp = fs.readFileSync(spPath, 'utf8');
  
  // Fix getStudentRollNumber
  const oldGetRoll = `    function getStudentRollNumber() {
      try {
        const raw = localStorage.getItem('user') || localStorage.getItem('college_erp_user') || localStorage.getItem('bec_session_user') || localStorage.getItem('portalUser');
        if (raw) {
          const u = JSON.parse(raw);
          const r = u.rollNo || u.student_id || u.roll_number || u.tempId || u.id;
          if (r) return String(r).replace(/^STU_[^_]+_/, '').trim();
        }
      } catch (e) {}
      return '2301316095';
    }`;

  const newGetRoll = `    function getStudentRollNumber() {
      try {
        const raw = localStorage.getItem('user') || localStorage.getItem('college_erp_user') || localStorage.getItem('bec_session_user') || localStorage.getItem('portalUser') || localStorage.getItem('bec_portal_user');
        if (raw) {
          const u = JSON.parse(raw);
          const r = u.rollNo || u.student_id || u.roll_number || u.username || u.tempId || u.id;
          if (r && !String(r).includes('object')) return String(r).replace(/^STU_[^_]+_/, '').trim();
        }
      } catch (e) {}
      return '';
    }`;

  if (sp.includes(oldGetRoll)) {
    sp = sp.replace(oldGetRoll, newGetRoll);
    console.log('Patched getStudentRollNumber in student-portal.html');
  }

  // Guard loadStudentFaceStatus when roll is empty
  sp = sp.replace(
    'const rollNo = getStudentRollNumber();',
    'const rollNo = getStudentRollNumber();\n        if (!rollNo) return;'
  );

  // Fix other 2301316095 fallbacks
  sp = sp.replace("|| 'STU_JITENDRA_2301316095'", "|| ''");
  sp = sp.replace("|| '2301316095'", "|| ''");

  fs.writeFileSync(spPath, sp, 'utf8');
  console.log('student-portal.html patched.');
}
