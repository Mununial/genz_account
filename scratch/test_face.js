const mysql = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/mysql2/promise');

async function testFace() {
  const pool = mysql.createPool({
    host: 'srv1334.hstgr.io',
    user: 'u847513759_ERP_COLLEGE',
    password: 'Ayushtech@26',
    database: 'u847513759_ERP_COLLEGE',
    port: 3306
  });

  const [face] = await pool.query(
    "SELECT * FROM student_face_data WHERE roll_number = 'GZU26081' OR student_id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1' OR student_id = 'GZU26081'"
  );
  console.log('Bablu in student_face_data:', face);

  await pool.end();
}

testFace().catch(console.error);
