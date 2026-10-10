const path = require('path');
const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function testKioskLogin() {
  console.log('Testing authentication for 2301316095 with DOB 12052005...');
  
  // 1. Test student profile API logic
  const [rows] = await db.pool.query(
    'SELECT * FROM students WHERE roll_number = ?',
    ['2301316095']
  );
  const s = rows[0];
  const cleanRealDob = String(s.dob || '').replace(/[^0-9]/g, '');
  let yyyymmdd = '';
  let ddmmyyyy = '';
  if (cleanRealDob.length === 8) {
    if (cleanRealDob.startsWith('19') || cleanRealDob.startsWith('20')) {
      yyyymmdd = cleanRealDob;
      ddmmyyyy = cleanRealDob.substring(6, 8) + cleanRealDob.substring(4, 6) + cleanRealDob.substring(0, 4);
    } else {
      ddmmyyyy = cleanRealDob;
      yyyymmdd = cleanRealDob.substring(4, 8) + cleanRealDob.substring(2, 4) + cleanRealDob.substring(0, 2);
    }
  }

  const userInputs = ['12052005', '20050512'];
  for (const input of userInputs) {
    const normInput = input.replace(/[^0-9]/g, '');
    const isMatch = (normInput === cleanRealDob || normInput === yyyymmdd || normInput === ddmmyyyy);
    console.log(`Input "${input}": Match result =`, isMatch, `(DB clean: ${cleanRealDob}, YMD: ${yyyymmdd}, DMY: ${ddmmyyyy})`);
  }

  process.exit(0);
}

testKioskLogin().catch(e => { console.error(e); process.exit(1); });
