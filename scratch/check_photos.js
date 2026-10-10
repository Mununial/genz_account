const mysql = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/mysql2/promise');
require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/dotenv').config({ path: 'c:/Users/munun/OneDrive/Desktop/genz_account/backend/.env' });

async function check() {
  const conn = await mysql.createConnection({
    host: 'srv1334.hstgr.io',
    user: 'u847513759_ERP_COLLEGE',
    password: 'Ayushtech@26',
    database: 'u847513759_ERP_COLLEGE',
    port: 3306
  });

  const [users] = await conn.query("SELECT id, username, email, photo_url FROM users WHERE username LIKE '%bablu%' OR email LIKE '%bablu%'");
  console.log('USERS in ERP_COLLEGE:', users);

  const [students] = await conn.query("SELECT id, user_id, full_name, roll_number, student_id, photo_url FROM students WHERE full_name LIKE '%bablu%' OR roll_number LIKE '%bablu%' OR email LIKE '%bablu%'");
  console.log('STUDENTS in ERP_COLLEGE:', students);

  const [sampleStudents] = await conn.query("SELECT id, roll_number, full_name, photo_url FROM students WHERE photo_url IS NOT NULL LIMIT 5");
  console.log('SAMPLE STUDENTS in ERP_COLLEGE with photo_url:', sampleStudents);

  const [nullPhotos] = await conn.query("SELECT count(*) as total, count(photo_url) as with_photo FROM students");
  console.log('STUDENT PHOTO STATS in ERP_COLLEGE:', nullPhotos);

  // Also check u847513759_acccount
  const connAcc = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'u847513759_acccount',
    port: process.env.DB_PORT || 3306
  });

  const [accStudents] = await connAcc.query("SELECT id, full_name, roll_no, photo_url FROM students WHERE full_name LIKE '%bablu%' OR roll_no LIKE '%bablu%'");
  console.log('STUDENTS in acccount DB:', accStudents);

  const [accNullPhotos] = await connAcc.query("SELECT count(*) as total, count(photo_url) as with_photo FROM students");
  console.log('STUDENT PHOTO STATS in acccount DB:', accNullPhotos);

  await conn.end();
  await connAcc.end();
}

check().catch(console.error);
