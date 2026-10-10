const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'C:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/.env' });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  console.log('Connected to DB');

  // 1. Check all columns in students containing 'bec'
  const [students] = await conn.query('SELECT id, user_id, roll_number, email FROM students WHERE email LIKE "%bec%"');
  console.log('Students with "bec" in email:', students);

  // 2. Check all columns in users containing 'bec'
  const [users] = await conn.query('SELECT id, email, role FROM users WHERE email LIKE "%bec%"');
  console.log('Users with "bec" in email:', users);

  // 3. Update Bablu Bag in students table
  const [uRes1] = await conn.query('UPDATE students SET email = "bablubag@genz.edu.in" WHERE email = "bablubag@bec.ac.in" OR user_id = 180');
  console.log('Updated Bablu Bag in students:', uRes1.affectedRows);

  // 4. Update any other @bec.ac.in student emails to @genzuniversity.in
  const [uRes2] = await conn.query('UPDATE students SET email = REPLACE(email, "@bec.ac.in", "@genzuniversity.in") WHERE email LIKE "%@bec.ac.in"');
  console.log('Replaced @bec.ac.in in students:', uRes2.affectedRows);

  const [uRes3] = await conn.query('UPDATE users SET email = REPLACE(email, "@bec.ac.in", "@genzuniversity.in") WHERE email LIKE "%@bec.ac.in"');
  console.log('Replaced @bec.ac.in in users:', uRes3.affectedRows);

  // 5. Replace in gate_passes
  const [uRes4] = await conn.query('UPDATE gate_passes SET student_email = REPLACE(student_email, "@bec.ac.in", "@genzuniversity.in") WHERE student_email LIKE "%@bec.ac.in"');
  console.log('Replaced @bec.ac.in in gate_passes:', uRes4.affectedRows);

  // 6. Check if any 'bec' in college name or settings in database
  const [tables] = await conn.query('SHOW TABLES');
  const tNames = tables.map(t => Object.values(t)[0]);
  for (const t of ['system_settings', 'institution_settings', 'settings', 'config']) {
    if (tNames.includes(t)) {
      const [rows] = await conn.query(`SELECT * FROM ${t}`);
      console.log(`Table ${t}:`, rows);
    }
  }

  await conn.end();
}

run().catch(console.error);
