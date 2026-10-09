/**
 * Script: update_real_institutional_staff.js
 * Updates the live Hostinger MariaDB database with real institutional data for:
 * - 6 HODs (CSE&DS, Agri, Mech, EEE/ECE, Aero, MBA)
 * - Director (Dr. B.N. Biswal)
 * - Super Admin (Ayush Mallick)
 * - Accountant (Harihara Parida)
 * - Examiner (Mr. Manoj Kumar Pati)
 */

const db = require('../backend/config/db');
const bcrypt = require('../backend/node_modules/bcryptjs');

const staffData = [
  {
    userId: 1,
    role: 'ADMIN',
    email: 'admin@bec.ac.in',
    aliasEmail: 'ayush.mallick@bec.ac.in',
    name: 'Ayush Mallick',
    code: 'GENZ-ADM-001',
    designation: 'Super Administrator & System Lead',
    department: 'Central IT & Administration',
    phone: '7008407876',
    password: 'Ayushtech@26'
  },
  {
    userId: 2,
    role: 'ACCOUNTS_HEAD',
    email: 'accounts.head@bec.ac.in',
    aliasEmail: 'harihara.parida@bec.ac.in',
    name: 'Harihara Parida',
    code: 'GENZ-ACC-001',
    designation: 'Senior Accountant & Accounts Head',
    department: 'Finance & Accounts Department',
    phone: '9437000002',
    password: 'Bec@Harihara2026!'
  },
  {
    userId: 19,
    role: 'DIRECTOR',
    email: 'director@bec.ac.in',
    aliasEmail: 'bn.biswal@bec.ac.in',
    name: 'Dr. B.N. Biswal',
    code: 'GENZ-DIR-001',
    designation: 'Director, Gen-Z University',
    department: 'Directorate / Executive Office',
    phone: '9861142627',
    password: 'Bec@Biswal2026!'
  },
  {
    userId: 20,
    role: 'EXAM_CELL',
    email: 'exam.section@bec.ac.in',
    aliasEmail: 'manoj.pati@bec.ac.in',
    name: 'Mr. Manoj Kumar Pati',
    code: 'GENZ-EXAM-001',
    designation: 'Controller of Examinations / Examiner',
    department: 'Examination Section',
    phone: '9437000020',
    password: 'Bec@Manoj2026!'
  },
  {
    userId: 10,
    role: 'HOD',
    email: 'hod.cse@bec.ac.in',
    aliasEmail: 'anita.behera@bec.ac.in',
    name: 'Anita Behera',
    code: 'GENZ-HOD-CSE-001',
    designation: 'Head of Department (CSE & DS)',
    department: 'Computer Science & Engineering and Data Science',
    phone: '7008407876',
    password: 'Bec@Anita2026!'
  },
  {
    userId: 16,
    role: 'HOD',
    email: 'hod.agri@bec.ac.in',
    aliasEmail: 'ananyaa.mohanty@bec.ac.in',
    name: 'Ananyaa Mohanty',
    code: 'GENZ-HOD-AGR-001',
    designation: 'Head of Department (Agriculture)',
    department: 'Agriculture Engineering',
    phone: '7978282332',
    password: 'Bec@Ananyaa2026!'
  },
  {
    userId: 12,
    role: 'HOD',
    email: 'hod.mech@bec.ac.in',
    aliasEmail: 'bishnu.mishra@bec.ac.in',
    name: 'Dr. Bishnu Prasad Mishra',
    code: 'GENZ-HOD-MEC-001',
    designation: 'Head of Department (Mechanical & Mechatronics)',
    department: 'Mechanical & Mechatronics Engineering',
    phone: '9438009384',
    password: 'Bec@Bishnu2026!'
  },
  {
    userId: 15,
    role: 'HOD',
    email: 'hod.eee@bec.ac.in',
    aliasEmail: 'binaya.malika@bec.ac.in',
    name: 'Dr. Binaya Kumar Mallick',
    code: 'GENZ-HOD-EEE-001',
    designation: 'Head of Department (EE & ECE)',
    department: 'Electrical & Electronics Engineering / ECE',
    phone: '7789948853',
    password: 'Bec@Binaya2026!'
  },
  {
    userId: 13,
    role: 'HOD',
    email: 'hod.aero@bec.ac.in',
    aliasEmail: 'sangram.samal@bec.ac.in',
    name: 'Dr. Sangram Keshari Samal',
    code: 'GENZ-HOD-AER-001',
    designation: 'Head of Department (Aero & AME)',
    department: 'Aeronautical & Aerospace Engineering / AME',
    phone: '7008323684',
    password: 'Bec@Sangram2026!'
  },
  {
    userId: 18,
    role: 'HOD',
    email: 'hod.mba@bec.ac.in',
    aliasEmail: 'ashis.behera@bec.ac.in',
    name: 'Mr. Ashis Kumar Behera',
    code: 'GENZ-HOD-MBA-001',
    designation: 'Head of Department (MBA)',
    department: 'Master of Business Administration',
    phone: '9040514865',
    password: 'Bec@Ashis2026!'
  }
];

async function run() {
  console.log('--- STARTING REAL INSTITUTIONAL STAFF DATA UPDATE ---');

  for (const s of staffData) {
    console.log(`\nProcessing: ${s.name} (${s.designation})...`);

    // 1. Hash the password
    const hashed = await bcrypt.hash(s.password, 10);

    // 2. Update user password and ensure active
    await db.query(
      `UPDATE users 
       SET password_hash = ?, is_active = 1, updated_at = NOW() 
       WHERE id = ?`,
      [hashed, s.userId]
    );
    console.log(`  ✓ Updated users table for ID ${s.userId} with bcrypt hash for password`);

    // 3. Upsert into staff table
    await db.query(
      `INSERT INTO staff (user_id, staff_code, full_name, designation, department, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         designation = VALUES(designation),
         department = VALUES(department),
         phone = VALUES(phone),
         updated_at = NOW()`,
      [s.userId, s.code, s.name, s.designation, s.department, s.phone]
    );
    console.log(`  ✓ Upserted staff record for ${s.name} [Code: ${s.code}, Phone: ${s.phone}]`);
  }

  // 4. Ensure HOD assignments in department_hods table
  // Anita Behera -> CSE (Dept 1) & CSD (Dept 2)
  await db.query(`UPDATE department_hods SET hod_user_id = 10 WHERE department_id IN (1, 2)`);
  // Ananyaa Mohanty -> AGRI (Dept 7)
  await db.query(`UPDATE department_hods SET hod_user_id = 16 WHERE department_id = 7`);
  // Dr. Bishnu Prasad Mishra -> MECH (Dept 3)
  await db.query(`UPDATE department_hods SET hod_user_id = 12 WHERE department_id = 3`);
  // Dr. Binaya Kumar Mallick -> EEE (Dept 6)
  await db.query(`UPDATE department_hods SET hod_user_id = 15 WHERE department_id = 6`);
  // Dr. Sangram Keshari Samal -> AERO (Dept 4)
  await db.query(`UPDATE department_hods SET hod_user_id = 13 WHERE department_id = 4`);
  // Mr. Ashis Kumar Behera -> MBA (Dept 11)
  await db.query(`UPDATE department_hods SET hod_user_id = 18 WHERE department_id = 11`);
  console.log('\n✓ Updated department_hods table for all 6 HODs.');

  // 5. Verification Print
  const [verifiedStaff] = await db.query(`
    SELECT s.user_id, u.email, s.full_name, s.designation, s.department, s.phone, r.name as role
    FROM staff s
    JOIN users u ON s.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    ORDER BY s.user_id ASC
  `);
  console.log('\n--- VERIFIED STAFF TABLE ON LIVE MARIADB ---');
  console.table(verifiedStaff);

  console.log('\n--- COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error updating staff data:', err);
  process.exit(1);
});
