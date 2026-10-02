/**
 * Production MySQL Database Dump Generator for Hostinger
 * Generates database/u847513759_acccount_complete_dump.sql
 * Includes full schema, baseline seeds, 354 real students, and BPUT subject catalogs.
 */

const fs = require('fs');
const path = require('path');
const { parseReportingExcel } = require('../database/import_students');

async function generateHostingerDump() {
  console.log('Generating complete Hostinger production database SQL dump...');

  const outputPath = path.join(__dirname, '..', 'database', 'u847513759_acccount_complete_dump.sql');
  const outStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

  function write(str) {
    outStream.write(str + '\n');
  }

  write(`-- ==============================================================================`);
  write(`-- BHUBANESWAR ENGINEERING COLLEGE (BEC) & BPUT REGISTRATION`);
  write(`-- Target Database: u847513759_acccount`);
  write(`-- Target User:     u847513759_erp_account`);
  write(`-- Generated:       ${new Date().toISOString()}`);
  write(`-- ==============================================================================\n`);

  write(`SET NAMES utf8mb4;`);
  write(`SET FOREIGN_KEY_CHECKS = 0;\n`);

  // 1. Schema
  console.log('Adding core schema.sql...');
  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  write(`-- ------------------------------------------------------`);
  write(`-- 1. CORE SCHEMA (28 RELATIONAL TABLES)`);
  write(`-- ------------------------------------------------------\n`);
  write(schemaSql);
  write('\n');

  // 2. Department Subject Registration Migration Schema
  console.log('Adding subject registration schema...');
  const migSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration_department_subject_registration.sql'), 'utf8');
  write(`-- ------------------------------------------------------`);
  write(`-- 2. SUBJECT REGISTRATION SCHEMA & METADATA`);
  write(`-- ------------------------------------------------------\n`);
  write(migSql);
  write('\n');

  // 3. Seed baseline
  console.log('Adding baseline seed.sql...');
  const seedSql = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
  write(`-- ------------------------------------------------------`);
  write(`-- 3. CORE SEED DATA (ROLES, STAFF, SYSTEM DEFAULTS)`);
  write(`-- ------------------------------------------------------\n`);
  write(seedSql);
  write('\n');

  // 4. Windows Table if not exists
  write(`-- ------------------------------------------------------`);
  write(`-- 4. REGISTRATION WINDOWS & SEMESTER CONTROLS`);
  write(`-- ------------------------------------------------------\n`);
  write(`CREATE TABLE IF NOT EXISTS \`registration_windows\` (
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
\n`);

  // 5. 354 Real Students Import
  console.log('Parsing and inserting 354 real students from Excel...');
  const excelPath = path.join(__dirname, '..', 'BEC_Complete_Student_Report_2026-09-24.xlsx');
  if (fs.existsSync(excelPath)) {
    const students = await parseReportingExcel(excelPath);
    console.log(`Parsed ${students.length} real students.`);

    write(`-- ------------------------------------------------------`);
    write(`-- 5. REAL STUDENT COHORT (${students.length} STUDENTS)`);
    write(`-- ------------------------------------------------------\n`);

    // Assign IDs starting from 101 to not collide with test users 1-20
    let userBaseId = 100;
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const uid = userBaseId + i + 1;
      const sid = i + 1;

      function esc(val) {
        if (val === null || val === undefined) return 'NULL';
        return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
      }

      // Insert User
      write(`INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`role_id\`, \`must_change_password\`, \`is_active\`) VALUES (${uid}, ${esc(s.email)}, ${esc(s.passwordHash)}, 1, 0, 1) ON DUPLICATE KEY UPDATE \`email\`=VALUES(\`email\`);`);

      // Insert Student
      write(`INSERT INTO \`students\` (\`id\`, \`user_id\`, \`reg_no\`, \`full_name\`, \`gender\`, \`dob\`, \`category\`, \`course_id\`, \`branch_id\`, \`current_semester_id\`, \`academic_session_id\`, \`admission_year\`, \`hostel_opted\`, \`transport_opted\`) VALUES (${sid}, ${uid}, ${esc(s.regNo)}, ${esc(s.fullName)}, ${esc(s.gender)}, ${esc(s.dob)}, ${esc(s.category)}, ${s.courseId || 1}, ${s.branchId || 1}, ${s.currentSemesterId || 1}, ${s.academicSessionId || 1}, ${s.admissionYear || 2026}, ${s.hostelOpted ? 1 : 0}, ${s.transportOpted ? 1 : 0}) ON DUPLICATE KEY UPDATE \`full_name\`=VALUES(\`full_name\`);`);

      // Insert Parent if present
      if (s.fatherName || s.motherName || s.fatherMobile) {
        write(`INSERT INTO \`parents\` (\`student_id\`, \`father_name\`, \`mother_name\`, \`father_mobile\`, \`annual_income\`) VALUES (${sid}, ${esc(s.fatherName)}, ${esc(s.motherName)}, ${esc(s.fatherMobile)}, ${s.annualIncome || 0}) ON DUPLICATE KEY UPDATE \`father_name\`=VALUES(\`father_name\`);`);
      }

      // Insert Address if present
      if (s.district || s.state) {
        write(`INSERT INTO \`student_addresses\` (\`student_id\`, \`type\`, \`district\`, \`state\`, \`country\`) VALUES (${sid}, 'PERMANENT', ${esc(s.district)}, ${esc(s.state)}, 'India') ON DUPLICATE KEY UPDATE \`district\`=VALUES(\`district\`);`);
      }

      // Insert Initial Academic Fee Structure & Invoice
      const annualFee = s.totalAnnualFee || 115000;
      const invNo = `INV-2026-${String(s.regNo || sid).slice(-6)}`;
      write(`INSERT INTO \`invoices\` (\`invoice_no\`, \`student_id\`, \`academic_session_id\`, \`semester_id\`, \`subtotal\`, \`total_payable\`, \`outstanding_amount\`, \`due_date\`, \`status\`, \`notes\`, \`created_by\`) VALUES (${esc(invNo)}, ${sid}, 1, 1, ${annualFee}, ${annualFee}, ${annualFee}, '2026-11-30', 'ISSUED', 'Annual Institutional & Academic Fees', 1) ON DUPLICATE KEY UPDATE \`total_payable\`=VALUES(\`total_payable\`);`);
    }
  }

  write(`\nSET FOREIGN_KEY_CHECKS = 1;\n`);
  write(`-- End of Hostinger Database Dump for u847513759_acccount`);

  outStream.end();
  console.log(`\n✓ SUCCESS! Generated Hostinger Production SQL Dump: ${outputPath}`);
}

generateHostingerDump();
