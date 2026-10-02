const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function applyStudentFees() {
  console.log('Creating student_fees table in live Hostinger DB...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`student_fees\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`student_id\` INT NOT NULL,
      \`roll_number\` VARCHAR(50) NOT NULL,
      \`category\` VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
      \`is_hosteller\` TINYINT(1) NOT NULL DEFAULT 0,
      \`total_fee\` DECIMAL(10,2) NOT NULL DEFAULT 115000.00,
      \`total_paid\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`tuition_paid\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`hostel_paid\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`exam_fees_paid\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`backlog_fees_paid\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`scholarship_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      \`academic_year\` VARCHAR(20) NOT NULL DEFAULT '2026-27',
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY \`uq_student_year\` (\`student_id\`, \`academic_year\`),
      INDEX \`idx_sf_student\` (\`student_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Populating student_fees for all 355 students...');
  await conn.query(`
    INSERT INTO student_fees (student_id, roll_number, category, is_hosteller, total_fee, total_paid, tuition_paid, hostel_paid, exam_fees_paid, academic_year)
    SELECT s.id, s.reg_no, s.category, s.hostel_opted, 115000.00, 115000.00, 85000.00, 0.00, 0.00, '2026-27'
    FROM students s
    ON DUPLICATE KEY UPDATE total_fee = VALUES(total_fee), total_paid = VALUES(total_paid);
  `);

  // Ensure Tushar Mhato student_fees has 100% paid
  await conn.query(`
    INSERT INTO student_fees (student_id, roll_number, category, is_hosteller, total_fee, total_paid, tuition_paid, hostel_paid, exam_fees_paid, academic_year)
    VALUES (500, '2644', 'General', 0, 115000.00, 488000.00, 115000.00, 0.00, 1550.00, '2026-27')
    ON DUPLICATE KEY UPDATE total_paid = 488000.00, tuition_paid = 115000.00;
  `);

  // Also check subject_registrations table columns
  console.log('Ensuring subject_registrations columns exist...');
  const [cols] = await conn.query('SHOW COLUMNS FROM subject_registrations');
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('exam_fee_amount')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_fee_amount DECIMAL(10,2) DEFAULT 1550.00`);
  }
  if (!colNames.includes('exam_fee_status')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_fee_status VARCHAR(20) DEFAULT 'PENDING'`);
  }
  if (!colNames.includes('exam_receipt_no')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_receipt_no VARCHAR(50) NULL`);
  }
  if (!colNames.includes('exam_transaction_id')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_transaction_id VARCHAR(100) NULL`);
  }
  if (!colNames.includes('exam_fee_paid_at')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_fee_paid_at DATETIME NULL`);
  }
  if (!colNames.includes('exam_section_id')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_section_id INT NULL`);
  }
  if (!colNames.includes('exam_section_action_at')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_section_action_at DATETIME NULL`);
  }
  if (!colNames.includes('exam_section_remarks')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN exam_section_remarks TEXT NULL`);
  }
  if (!colNames.includes('reference_number')) {
    await conn.query(`ALTER TABLE subject_registrations ADD COLUMN reference_number VARCHAR(100) NULL`);
  }

  // Also modify status ENUM if needed to support EXAM_FEE_PAID
  await conn.query(`
    ALTER TABLE subject_registrations MODIFY COLUMN status ENUM(
      'DRAFT','SUBMITTED',
      'HOD_REVIEW','HOD_FORWARDED','HOD_REVERTED',
      'DIRECTOR_REVIEW','DIRECTOR_APPROVED','DIRECTOR_REJECTED',
      'EXAM_FEE_PAID',
      'ACCOUNTS_REVIEW','CONFIRMED','REJECTED'
    ) DEFAULT 'DRAFT';
  `);

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  const [sfCount] = await conn.query('SELECT COUNT(*) as count FROM student_fees');
  console.log(`✓ student_fees table active with ${sfCount[0].count} records!`);

  await conn.end();
}

applyStudentFees();
