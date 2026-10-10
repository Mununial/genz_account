const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function test() {
  try {
    const [rows] = await db.pool.query(`
      SELECT la.id, la.leave_number, la.leave_type, la.start_date, la.end_date, la.reason, la.destination_address, la.emergency_phone, la.status, s.full_name, s.roll_number, s.branch, h.name as hostel_name
      FROM leave_applications la
      LEFT JOIN students s ON (
        la.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON la.hostel_id = h.id
      ORDER BY la.id DESC
    `);
    console.log('LEAVES IN DB:', rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
