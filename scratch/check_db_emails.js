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

  const [tables] = await conn.query('SHOW TABLES');
  const tNames = tables.map(t => Object.values(t)[0]);
  console.log('Tables matching pass|gate|leave:', tNames.filter(t => /pass|gate|leave/i.test(t)));

  const [becStudents] = await conn.query('SELECT COUNT(*) as cnt FROM students WHERE email LIKE ?', ['%@bec%']);
  console.log('Students with @bec in email:', becStudents[0].cnt);

  const [sampleStudents] = await conn.query('SELECT id, roll_number, email FROM students WHERE email LIKE ? LIMIT 5', ['%@bec%']);
  console.log('Sample @bec students:', sampleStudents);

  const [becUsers] = await conn.query('SELECT COUNT(*) as cnt FROM users WHERE email LIKE ?', ['%@bec%']);
  console.log('Users with @bec in email:', becUsers[0].cnt);

  const [sampleUsers] = await conn.query('SELECT id, email, role FROM users WHERE email LIKE ? LIMIT 5', ['%@bec%']);
  console.log('Sample @bec users:', sampleUsers);

  // Check gate passes in the actual table
  if (tNames.includes('gate_passes')) {
    const [gp] = await conn.query('SELECT * FROM gate_passes ORDER BY id DESC LIMIT 2');
    console.log('Recent gate_passes:', gp);
  }

  // Check hostel_passes
  if (tNames.includes('hostel_passes')) {
    const [hp] = await conn.query('SELECT * FROM hostel_passes ORDER BY id DESC LIMIT 2');
    console.log('Recent hostel_passes:', hp);
  }

  // Check student_leaves
  if (tNames.includes('student_leaves')) {
    const [sl] = await conn.query('SELECT * FROM student_leaves ORDER BY id DESC LIMIT 2');
    console.log('Recent student_leaves:', sl);
  }

  await conn.end();
}

run().catch(console.error);
