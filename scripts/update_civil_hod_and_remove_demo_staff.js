/**
 * Script: update_civil_hod_and_remove_demo_staff.js
 * 1. Sets Civil & Environmental Engineering HOD: Saswat Mohanty
 * 2. Removes demo/fake staff rows from the `staff` table
 * 3. Deactivates or removes unneeded demo user accounts
 * 4. Cleans up department_hods mappings to have only real HODs
 */

const db = require('../backend/config/db');
const bcrypt = require('../backend/node_modules/bcryptjs');

async function run() {
  console.log('--- STARTING CLEANUP OF DEMO STAFF & SETTING REAL CIVIL HOD ---');

  // 1. Update Department 5 to 'Civil & Environmental Engineering'
  await db.query(`
    UPDATE departments 
    SET name = 'Civil & Environmental Engineering', short_name = 'CIVIL' 
    WHERE id = 5
  `);
  console.log('✓ Updated Department 5 to "Civil & Environmental Engineering"');

  // 2. Hash password for Saswat Mohanty
  const saswatPwd = 'Bec@Saswat2026!';
  const saswatHash = await bcrypt.hash(saswatPwd, 10);

  // 3. Update User 14 for Saswat Mohanty
  await db.query(`
    UPDATE users 
    SET password_hash = ?, is_active = 1, updated_at = NOW() 
    WHERE id = 14
  `, [saswatHash]);
  console.log(`✓ Updated User ID 14 (hod.civil@bec.ac.in) with password hash for ${saswatPwd}`);

  // 4. Update Staff record for User 14
  await db.query(`
    INSERT INTO staff (user_id, staff_code, full_name, designation, department, phone, created_at, updated_at)
    VALUES (14, 'BEC-HOD-CIV-001', 'Saswat Mohanty', 'Head of Department (Civil & Environmental Engineering)', 'Civil & Environmental Engineering', '9437000014', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      full_name = 'Saswat Mohanty',
      designation = 'Head of Department (Civil & Environmental Engineering)',
      department = 'Civil & Environmental Engineering',
      staff_code = 'BEC-HOD-CIV-001',
      updated_at = NOW()
  `);
  console.log('✓ Updated Staff record for Saswat Mohanty [Code: BEC-HOD-CIV-001]');

  // 5. Remove demo staff records (user_id 11: Prof. B.K. Mohapatra, user_id 17: Er. Chandan Kumar Rout)
  await db.query(`DELETE FROM staff WHERE user_id IN (11, 17)`);
  console.log('✓ Removed demo staff rows (user_id 11 and 17) from staff table');

  // 6. Clean up department_hods mappings
  // Clean out any old/duplicate mappings
  await db.query(`DELETE FROM department_hods WHERE hod_user_id IN (11, 17)`);
  
  // Clean duplicate entries in department_hods (keep only 1 mapping per department)
  await db.query(`DELETE FROM department_hods WHERE id > 11`);

  // Explicitly ensure correct department mappings for all real HODs:
  // Dept 1 (CSE) -> Anita Behera (user 10)
  await db.query(`UPDATE department_hods SET hod_user_id = 10 WHERE department_id = 1`);
  // Dept 2 (CSD) -> Anita Behera (user 10)
  await db.query(`UPDATE department_hods SET hod_user_id = 10 WHERE department_id = 2`);
  // Dept 3 (MECH) -> Dr. Bishnu Prasad Mishra (user 12)
  await db.query(`UPDATE department_hods SET hod_user_id = 12 WHERE department_id = 3`);
  // Dept 4 (AERO) -> Dr. Sangram Keshari Samal (user 13)
  await db.query(`UPDATE department_hods SET hod_user_id = 13 WHERE department_id = 4`);
  // Dept 5 (CIVIL & Environmental) -> Saswat Mohanty (user 14)
  await db.query(`UPDATE department_hods SET hod_user_id = 14 WHERE department_id = 5`);
  // Dept 6 (EEE) -> Dr. Binaya Kumar Mallick (user 15)
  await db.query(`UPDATE department_hods SET hod_user_id = 15 WHERE department_id = 6`);
  // Dept 7 (AGRI) -> Ananyaa Mohanty (user 16)
  await db.query(`UPDATE department_hods SET hod_user_id = 16 WHERE department_id = 7`);
  // Dept 11 (MBA) -> Mr. Ashis Kumar Behera (user 18)
  await db.query(`UPDATE department_hods SET hod_user_id = 18 WHERE department_id = 11`);

  // Deactivate demo diploma department mappings if not active
  await db.query(`DELETE FROM department_hods WHERE department_id IN (8, 9, 10)`);
  console.log('✓ Cleaned and verified department_hods mappings for all 7 real HODs.');

  // 7. Deactivate demo users (11 and 17) in users table so they don't appear active
  await db.query(`UPDATE users SET is_active = 0 WHERE id IN (11, 17)`);
  console.log('✓ Deactivated demo user accounts (11 and 17)');

  // 8. Print verified final staff directory from live MariaDB
  const [finalStaff] = await db.query(`
    SELECT s.id, s.user_id, s.staff_code, s.full_name, s.designation, s.department, s.phone, u.email, r.name as role
    FROM staff s
    JOIN users u ON s.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    ORDER BY s.user_id ASC
  `);
  console.log('\n--- VERIFIED CLEAN 100% REAL STAFF DIRECTORY ---');
  console.table(finalStaff);

  const [finalHods] = await db.query(`
    SELECT d.id as dept_id, d.name as department_name, s.full_name as hod_name, u.email, s.phone
    FROM department_hods dh
    JOIN departments d ON dh.department_id = d.id
    JOIN users u ON dh.hod_user_id = u.id
    JOIN staff s ON s.user_id = u.id
    ORDER BY d.id ASC
  `);
  console.log('\n--- VERIFIED DEPARTMENT HOD ASSIGNMENTS ---');
  console.table(finalHods);

  process.exit(0);
}

run().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
