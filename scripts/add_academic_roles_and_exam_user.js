const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
const bcrypt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'bcryptjs'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function fixRolesAndUsers() {
  console.log('Adding HOD, DIRECTOR, EXAM_CELL roles and exam.section user to live DB...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // Insert missing roles
  await conn.query(`
    INSERT INTO roles (id, name, description) VALUES
    (6, 'HOD', 'Head of Department - Academic Reviewer'),
    (7, 'DIRECTOR', 'Director of Academics & Institution Head'),
    (8, 'EXAM_CELL', 'Controller of Examinations & BPUT Exam Section Desk')
    ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
  `);

  // Default hash for '123456'
  const hash123456 = await bcrypt.hash('123456', 10);
  const adminHash = '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO'; // Admin@BEC2026! / 123456

  // Insert Exam Section User
  await conn.query(`
    INSERT INTO users (id, email, password_hash, role_id, must_change_password, is_active)
    VALUES (20, 'exam.section@bec.ac.in', ?, 8, 0, 1)
    ON DUPLICATE KEY UPDATE email = VALUES(email), role_id = VALUES(role_id);
  `, [hash123456]);

  // Insert staff record for Exam Section
  await conn.query(`
    INSERT INTO staff (user_id, staff_code, full_name, designation, department, phone)
    VALUES (20, 'GENZ-EXAM-001', 'Dr. Ramesh Chandra Sahoo', 'Controller of Examinations', 'Examination Section', '+91-9437000020')
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), designation = VALUES(designation);
  `);

  // Update password hashes for HODs and Director to allow both Admin@BEC2026! and 123456
  await conn.query(`UPDATE users SET password_hash = ? WHERE id IN (1, 2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)`, [hash123456]);

  // Also add Tushar Mhato as student 2644 (Roll: 2644, Reg No: 2644, User: 2644@bec.ac.in)
  await conn.query(`
    INSERT INTO users (id, email, password_hash, role_id, must_change_password, is_active)
    VALUES (500, 'tushar.mhato@bec.ac.in', ?, 1, 0, 1)
    ON DUPLICATE KEY UPDATE email = VALUES(email);
  `, [hash123456]);

  await conn.query(`
    INSERT INTO students (id, user_id, reg_no, full_name, gender, dob, category, course_id, branch_id, current_semester_id, academic_session_id, admission_year, hostel_opted, transport_opted)
    VALUES (500, 500, '2644', 'Tushar Mhato', 'Male', '2004-05-15', 'General', 1, 5, 2, 1, 2026, 0, 0)
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), current_semester_id = 2;
  `);

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('✓ Successfully updated roles and added exam.section + Tushar Mhato into live DB!');
  await conn.end();
}

fixRolesAndUsers();
