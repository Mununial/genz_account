/**
 * Create Education Loan Requests Table
 * Gen-Z University
 */
const { query } = require('../backend/config/db');

async function runMigration() {
  console.log('Running migration for education_loan_requests table...');
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS education_loan_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        reg_no VARCHAR(50),
        student_name VARCHAR(150),
        father_name VARCHAR(150),
        course_name VARCHAR(100),
        branch_name VARCHAR(100),
        current_semester VARCHAR(50),
        academic_year VARCHAR(50) DEFAULT '2026-2027',
        bank_name VARCHAR(150) NOT NULL,
        bank_branch VARCHAR(150),
        bank_ifsc VARCHAR(50),
        loan_amount DECIMAL(12,2) NOT NULL,
        loan_purpose VARCHAR(150) DEFAULT 'Tuition & Academic Fees',
        co_applicant_name VARCHAR(150),
        co_applicant_relation VARCHAR(50),
        co_applicant_phone VARCHAR(50),
        co_applicant_income DECIMAL(12,2),
        student_remarks TEXT,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        reference_no VARCHAR(100) NULL,
        director_remarks TEXT,
        approved_by INT NULL,
        approved_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Successfully created/verified education_loan_requests table on MySQL!');
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

runMigration();
