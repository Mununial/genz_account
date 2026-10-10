const path = require('path');
const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function testAuth() {
  const [users] = await db.pool.query("SELECT * FROM users WHERE username = '2301316095' OR id = 816");
  console.log('User in DB:', users);

  const [student] = await db.pool.query("SELECT id, roll_number, student_id, full_name, dob, personal_json FROM students WHERE roll_number = '2301316095'");
  console.log('Student in DB:', student);

  // Check authGateway logic for student login
  const authGateway = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/server/authGateway');
  console.log('authGateway loaded');

  process.exit(0);
}

testAuth().catch(e => { console.error(e); process.exit(1); });
