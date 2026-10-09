/**
 * Script: update_credentials_genz.js
 * Updates all staff, admin, accounts, HOD, director, and exam cell credentials
 * Setting emails to @genz domain and passwords to Ayush#@26.
 */

const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const db = require('../backend/config/db');
const bcrypt = require('../backend/node_modules/bcryptjs');

const updates = [
  { id: 1, email: 'admin@genz', role: 'ADMIN', name: 'Ayush Mallick' },
  { id: 2, email: 'account@genz', role: 'ACCOUNTS_HEAD', name: 'Harihara Parida' },
  { id: 3, email: 'staff@genz', role: 'ACCOUNTS_STAFF', name: 'Accounts Staff' },
  { id: 4, email: 'auditor@genz', role: 'AUDITOR_READ_ONLY', name: 'Statutory Auditor' },
  { id: 5, email: 'student@genz', role: 'STUDENT', name: 'Test Student' },
  { id: 10, email: 'hod.cse@genz', role: 'HOD', name: 'Anita Behera (HOD CSE & DS)' },
  { id: 11, email: 'hod.csd@genz', role: 'HOD', name: 'HOD CSD' },
  { id: 12, email: 'hod.mech@genz', role: 'HOD', name: 'Dr. Bishnu Prasad Mishra (HOD Mech)' },
  { id: 13, email: 'hod.aero@genz', role: 'HOD', name: 'Dr. Sangram Keshari Samal (HOD Aero)' },
  { id: 14, email: 'hod.civil@genz', role: 'HOD', name: 'Saswat Mohanty (HOD Civil)' },
  { id: 15, email: 'hod.eee@genz', role: 'HOD', name: 'Dr. Binaya Kumar Mallick (HOD EEE)' },
  { id: 16, email: 'hod.agri@genz', role: 'HOD', name: 'Ananyaa Mohanty (HOD Agri)' },
  { id: 17, email: 'hod.diploma@genz', role: 'HOD', name: 'HOD Diploma' },
  { id: 18, email: 'hod.mba@genz', role: 'HOD', name: 'Mr. Ashis Kumar Behera (HOD MBA)' },
  { id: 19, email: 'director@genz', role: 'DIRECTOR', name: 'Dr. B.N. Biswal (Director)' },
  { id: 20, email: 'exam@genz', role: 'EXAM_CELL', name: 'Mr. Manoj Kumar Pati (Exam Cell)' }
];

async function main() {
  console.log('Generating bcrypt hash for password "Ayush#@26"...');
  const passwordHash = await bcrypt.hash('Ayush#@26', 10);
  console.log('Hash generated successfully.');

  console.log('\n--- Updating users table on MySQL database ---');
  for (const u of updates) {
    await db.query(
      `UPDATE users 
       SET email = ?, 
           password_hash = ?, 
           must_change_password = 0, 
           is_active = 1, 
           updated_at = NOW() 
       WHERE id = ?`,
      [u.email, passwordHash, u.id]
    );
    console.log(`  ✓ Updated ID ${u.id}: email = ${u.email} (${u.name} / ${u.role})`);
  }

  console.log('\n--- Verification: Current Non-Student Users ---');
  const [rows] = await db.query(`
    SELECT u.id, u.email, r.name as role, u.must_change_password, u.is_active, u.updated_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id IN (${updates.map(u => u.id).join(',')})
    ORDER BY u.id ASC
  `);
  console.table(rows);

  // Test password verification
  const [testUser] = await db.query('SELECT password_hash FROM users WHERE email = ?', ['admin@genz']);
  if (testUser.length > 0) {
    const valid = await bcrypt.compare('Ayush#@26', testUser[0].password_hash);
    console.log(`\nPassword verification check for admin@genz: ${valid ? 'PASSED (MATCH)' : 'FAILED'}`);
  }

  console.log('\nAll user accounts successfully updated to @genz with password "Ayush#@26"!');
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
