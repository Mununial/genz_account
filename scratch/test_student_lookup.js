const mysql = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'srv1334.hstgr.io',
    user: 'u847513759_ERP_COLLEGE',
    password: 'Ayushtech@26',
    database: 'u847513759_ERP_COLLEGE',
    port: 3306
  });

  const target = 'bablubag';
  const cleanTarget = String(target).trim();
  const normTarget = cleanTarget.replace(/[\s\/\-_]/g, '').toUpperCase();

  const [rows] = await pool.query(
    `SELECT s.*,
            h.name as hostel_name,
            r.room_number,
            b.bed_number
     FROM students s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN hostels h ON s.hostel_id = h.id
     LEFT JOIN beds b ON s.bed_id = b.id
     LEFT JOIN rooms r ON b.room_id = r.id
     WHERE s.roll_number = ? 
        OR s.student_id = ? 
        OR s.id = ?
        OR s.user_id = ?
        OR u.id = ?
        OR s.email = ? 
        OR u.username = ? 
        OR u.email = ?
        OR s.email LIKE CONCAT(?, '@%')
        OR s.student_id = ?
        OR s.roll_number = ?
     LIMIT 1`,
    [cleanTarget, cleanTarget, cleanTarget, cleanTarget, cleanTarget, cleanTarget, cleanTarget, cleanTarget, cleanTarget, normTarget, normTarget]
  );

  console.log('Lookup with "bablubag": found', rows.length);
  if (rows.length > 0) {
    console.log('Found student:', rows[0].id, rows[0].full_name, rows[0].roll_number, rows[0].photo_url);
  }

  const [target2] = await pool.query(
    "SELECT id, full_name, roll_number, photo_url FROM students WHERE full_name LIKE '%bablu%' OR roll_number LIKE '%bablu%' OR email LIKE '%bablu%'"
  );
  console.log('Bablu in students:', target2);

  await pool.end();
}

test().catch(console.error);
