const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedBalancedVisitors() {
  try {
    const [students] = await db.pool.query('SELECT id FROM students LIMIT 5');

    await db.pool.query('DELETE FROM visits');

    // 1. Critical Overstay: In 2 hours ago, expected out 45 mins ago
    await db.pool.query(`
      INSERT INTO visits 
      (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
      VALUES (?, 1, 'Pradeep Rout', '+91-9853221100', 'VENDOR', 'Mess dairy logistics & refrigeration inspection', 'DRIVING_LICENSE', '7721', CURDATE(), DATE_SUB(NOW(), INTERVAL 120 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 120 MINUTE), NULL, 'CHECKED_IN', 1, NOW(), NOW())
    `, [students[0].id]);

    // 2. Amber Warning: In 90 mins ago, expected out 18 mins ago
    await db.pool.query(`
      INSERT INTO visits 
      (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
      VALUES (?, 1, 'Rajesh Mishra', '+91-9861011223', 'PARENT', 'Hostel accommodation & fee clearance meeting', 'AADHAAR', '4892', CURDATE(), DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 18 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE), NULL, 'CHECKED_IN', 1, NOW(), NOW())
    `, [students[1].id]);

    // 3. Safe / On-time: In 20 mins ago, expected out in 45 mins
    await db.pool.query(`
      INSERT INTO visits 
      (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
      VALUES (?, 2, 'Dr. Debabrata Samantaray', '+91-9437199880', 'GUEST_FACULTY', 'Invited Keynote: Emerging Cloud Topologies', 'PAN', '3341', CURDATE(), DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_ADD(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 'CHECKED_IN', 1, NOW(), NOW())
    `, [students[2].id]);

    // 4. Completed: Checked in 3 hours ago, checked out 1 hour ago
    await db.pool.query(`
      INSERT INTO visits 
      (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
      VALUES (?, 1, 'Sunita Mohapatra', '+91-9437889900', 'GUARDIAN', 'Semester medical supplies handover', 'VOTER_ID', '9012', CURDATE(), DATE_SUB(NOW(), INTERVAL 180 MINUTE), DATE_SUB(NOW(), INTERVAL 60 MINUTE), DATE_SUB(NOW(), INTERVAL 180 MINUTE), DATE_SUB(NOW(), INTERVAL 65 MINUTE), 'CHECKED_OUT', 1, NOW(), NOW())
    `, [students[3].id]);

    console.log('Seeded balanced visitor telemetry successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedBalancedVisitors();
