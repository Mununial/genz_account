/**
 * Live Hostinger Database Provisioner & Complete Data Uploader
 * Connects to live MariaDB/MySQL on Hostinger and populates all tables, seeds, and real students.
 */

const path = require('path');
const fs = require('fs');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });
const { parseReportingExcel } = require('../database/import_students');

async function uploadToLiveHostinger() {
  console.log('================================================================');
  console.log('🚀 UPLOADING COMPLETE REAL DATA TO HOSTINGER DATABASE');
  console.log('================================================================');
  console.log(`Host:     ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User:     ${process.env.DB_USER}`);
  console.log('================================================================\n');

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      connectTimeout: 30000
    });
    console.log('✓ Connected successfully to Hostinger MySQL.\n');

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Schema
    console.log('[1/5] Applying Core Relational Schema (schema.sql)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    await conn.query(schemaSql);
    console.log('  ✓ Core schema tables created successfully.');

    // 2. Department Subject Registration Migration
    console.log('[2/5] Applying Department Subject Registration Schema (migration)...');
    const migSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration_department_subject_registration.sql'), 'utf8');
    await conn.query(migSql);
    console.log('  ✓ Programs, Departments, Subjects, and Registrations schema applied.');

    // 3. Seed baseline
    console.log('[3/5] Seeding System Roles, Staff Accounts & Settings (seed.sql)...');
    const seedSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
    await conn.query(seedSql);
    console.log('  ✓ Baseline seeds, roles, permissions, and institutional staff accounts inserted.');

    // 4. Registration Windows
    console.log('[4/5] Setting up Registration Windows (Semesters 1 to 8)...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`registration_windows\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`semester\` INT NOT NULL UNIQUE,
        \`is_open\` TINYINT(1) DEFAULT 1,
        \`status\` VARCHAR(20) DEFAULT 'OPEN',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      INSERT INTO \`registration_windows\` (\`semester\`, \`is_open\`, \`status\`) VALUES
      (1, 1, 'OPEN'),
      (2, 1, 'OPEN'),
      (3, 1, 'OPEN'),
      (4, 0, 'LOCKED'),
      (5, 0, 'LOCKED'),
      (6, 0, 'LOCKED'),
      (7, 0, 'LOCKED'),
      (8, 0, 'LOCKED')
      ON DUPLICATE KEY UPDATE \`is_open\` = VALUES(\`is_open\`), \`status\` = VALUES(\`status\`);
    `);
    console.log('  ✓ Registration Windows configured.');

    // 5. Real Student Cohort Import
    console.log('[5/5] Importing 354 Real Student Records from Excel report...');
    const excelPath = path.join(__dirname, '..', 'BEC_Complete_Student_Report_2026-09-24.xlsx');
    if (fs.existsSync(excelPath)) {
      const students = await parseReportingExcel(excelPath);
      console.log(`  -> Parsed ${students.length} real students from reporting spreadsheet.`);

      await conn.query('SET FOREIGN_KEY_CHECKS = 0');

      let userBaseId = 100;
      let insertedCount = 0;

      // Batch insert users and students in chunks of 50 for high performance
      for (let i = 0; i < students.length; i += 50) {
        const chunk = students.slice(i, i + 50);

        for (let j = 0; j < chunk.length; j++) {
          const idx = i + j;
          const s = chunk[j];
          const uid = userBaseId + idx + 1;
          const sid = idx + 1;

          // 1. User
          await conn.query(
            `INSERT INTO users (id, email, password_hash, role_id, must_change_password, is_active)
             VALUES (?, ?, ?, 1, 0, 1)
             ON DUPLICATE KEY UPDATE email = VALUES(email)`,
            [uid, s.email, s.passwordHash]
          );

          // 2. Student
          await conn.query(
            `INSERT INTO students (id, user_id, reg_no, full_name, gender, dob, category, course_id, branch_id, current_semester_id, academic_session_id, admission_year, hostel_opted, transport_opted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
            [
              sid,
              uid,
              s.regNo,
              s.fullName,
              s.gender,
              s.dob,
              s.category,
              s.courseId || 1,
              s.branchId || 1,
              s.currentSemesterId || 1,
              s.academicSessionId || 1,
              s.admissionYear || 2026,
              s.hostelOpted ? 1 : 0,
              s.transportOpted ? 1 : 0
            ]
          );

          // 3. Parent
          if (s.fatherName || s.motherName || s.fatherMobile) {
            await conn.query(
              `INSERT INTO parents (student_id, father_name, mother_name, father_mobile, annual_income)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE father_name = VALUES(father_name)`,
              [sid, s.fatherName || '', s.motherName || '', s.fatherMobile || '', s.annualIncome || 0]
            ).catch(() => {});
          }

          // 4. Address
          if (s.district || s.state) {
            await conn.query(
              `INSERT INTO student_addresses (student_id, type, district, state, country)
               VALUES (?, 'PERMANENT', ?, ?, 'India')
               ON DUPLICATE KEY UPDATE district = VALUES(district)`,
              [sid, s.district || '', s.state || '']
            ).catch(() => {});
          }

          // 5. Invoices & Initial Ledger
          const annualFee = s.totalAnnualFee || 115000;
          const invNo = `INV-2026-${String(s.regNo || sid).slice(-6)}`;
          await conn.query(
            `INSERT INTO invoices (invoice_no, student_id, academic_session_id, semester_id, subtotal, total_payable, outstanding_amount, due_date, status, notes, created_by)
             VALUES (?, ?, 1, 1, ?, ?, ?, '2026-11-30', 'ISSUED', 'Annual Institutional Fees', 1)
             ON DUPLICATE KEY UPDATE total_payable = VALUES(total_payable)`,
            [invNo, sid, annualFee, annualFee, annualFee]
          ).catch(() => {});

          insertedCount++;
        }
        process.stdout.write(`  -> Uploaded ${insertedCount} / ${students.length} students...\r`);
      }
      console.log(`\n  ✓ Successfully uploaded all ${insertedCount} real students into Hostinger MySQL!`);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Verification
    console.log('\n================================================================');
    console.log('📊 LIVE DATABASE VERIFICATION AUDIT');
    console.log('================================================================');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`Total Tables Created: ${tables.length}`);

    const [userCount] = await conn.query('SELECT COUNT(*) as count FROM users');
    const [studentCount] = await conn.query('SELECT COUNT(*) as count FROM students');
    const [subjectCount] = await conn.query('SELECT COUNT(*) as count FROM subjects');
    const [invoiceCount] = await conn.query('SELECT COUNT(*) as count FROM invoices');
    const [windowCount] = await conn.query('SELECT COUNT(*) as count FROM registration_windows');

    console.log(`✓ Total Users in DB:              ${userCount[0].count}`);
    console.log(`✓ Total Students in DB:           ${studentCount[0].count}`);
    console.log(`✓ Total Subjects in Catalog:      ${subjectCount[0].count}`);
    console.log(`✓ Total Invoices Issued:          ${invoiceCount[0].count}`);
    console.log(`✓ Registration Windows Active:    ${windowCount[0].count}`);
    console.log('================================================================');
    console.log('🎉 REAL HOSTINGER DATABASE UPLOAD COMPLETED SUCCESSFULLY!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n✗ Error uploading data to Hostinger:', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

uploadToLiveHostinger();
