-- ==============================================================================
-- GENZ ACCOUNTS SYSTEM — SUBJECT REGISTRATION MODULE MIGRATION
-- Run AFTER base schema.sql and seed.sql. DO NOT modify existing tables.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- STEP 1: ADD HOD AND DIRECTOR ROLES
INSERT INTO `roles` (`name`, `description`) VALUES
  ('HOD', 'Head of Department — reviews and forwards subject registration requests'),
  ('DIRECTOR', 'College Director — final academic approval authority before accounts')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- STEP 2: ADD PERMISSIONS FOR NEW ROLES
INSERT INTO `permissions` (`code`, `description`, `module`) VALUES
  ('registration.submit', 'Submit subject registration request', 'REGISTRATION'),
  ('registration.hod.review', 'HOD: Forward or revert registration', 'REGISTRATION'),
  ('registration.director.review', 'Director: Approve or reject registration', 'REGISTRATION'),
  ('registration.accounts.finalize', 'Accounts: Finalize confirmed registrations', 'REGISTRATION'),
  ('registration.admin.manage', 'Admin: Manage subjects catalog', 'REGISTRATION'),
  ('registration.view', 'View own registration status', 'REGISTRATION')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.submit' WHERE r.name = 'STUDENT';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.view' WHERE r.name = 'STUDENT';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.hod.review' WHERE r.name = 'HOD';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.view' WHERE r.name = 'HOD';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.director.review' WHERE r.name = 'DIRECTOR';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.view' WHERE r.name = 'DIRECTOR';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.accounts.finalize' WHERE r.name = 'ACCOUNTS_HEAD';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.accounts.finalize' WHERE r.name = 'ACCOUNTS_STAFF';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.admin.manage' WHERE r.name = 'ADMIN';
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id FROM `roles` r JOIN `permissions` p ON p.code = 'registration.view' WHERE r.name = 'ADMIN';

-- STEP 3: ADD HOD AND DIRECTOR USERS (Password: Admin@BEC2026!)
INSERT INTO `users` (`email`, `password_hash`, `role_id`, `must_change_password`, `is_active`)
SELECT 'hod.cse@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', r.id, 0, 1
FROM `roles` r WHERE r.name = 'HOD'
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);

INSERT INTO `users` (`email`, `password_hash`, `role_id`, `must_change_password`, `is_active`)
SELECT 'director@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', r.id, 0, 1
FROM `roles` r WHERE r.name = 'DIRECTOR'
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);

INSERT INTO `staff` (`user_id`, `staff_code`, `full_name`, `designation`, `department`, `phone`)
SELECT u.id, 'GENZ-HOD-CSE-001', 'Dr. Rajesh Kumar Mohanty', 'Head of Department', 'Computer Science & Engineering', '+91-9437000010'
FROM `users` u WHERE u.email = 'hod.cse@bec.ac.in'
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `staff` (`user_id`, `staff_code`, `full_name`, `designation`, `department`, `phone`)
SELECT u.id, 'GENZ-DIR-001', 'Prof. S. K. Rath', 'Director', 'Administration', '+91-9437000011'
FROM `users` u WHERE u.email = 'director@bec.ac.in'
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- STEP 4: NEW TABLE subjects
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `branch` VARCHAR(50) NOT NULL DEFAULT 'ALL',
  `semester` INT NOT NULL,
  `year` INT NOT NULL,
  `credits` INT NOT NULL DEFAULT 3,
  `type` ENUM('CORE','ELECTIVE','LAB','BACKLOG') NOT NULL DEFAULT 'CORE',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 5: NEW TABLE student_fees
CREATE TABLE IF NOT EXISTS `student_fees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `roll_number` VARCHAR(50) NOT NULL,
  `category` VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
  `is_hosteller` TINYINT(1) NOT NULL DEFAULT 0,
  `total_fee` DECIMAL(10,2) NOT NULL DEFAULT 115000.00,
  `total_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tuition_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `hostel_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `exam_fees_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `backlog_fees_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `scholarship_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `academic_year` VARCHAR(20) NOT NULL DEFAULT '2026-27',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_student_year` (`student_id`, `academic_year`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  INDEX `idx_sf_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 6: NEW TABLE subject_registrations
CREATE TABLE IF NOT EXISTS `subject_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `roll_number` VARCHAR(50) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL DEFAULT '2026-27',
  `semester` INT NOT NULL,
  `registration_type` ENUM('REGULAR','BACKLOG') NOT NULL DEFAULT 'REGULAR',
  `total_credits` INT NOT NULL DEFAULT 0,
  `status` ENUM(
    'DRAFT','SUBMITTED','HOD_REVIEW','HOD_FORWARDED','HOD_REVERTED',
    'DIRECTOR_REVIEW','DIRECTOR_APPROVED','DIRECTOR_REJECTED',
    'ACCOUNTS_REVIEW','CONFIRMED','REJECTED'
  ) NOT NULL DEFAULT 'DRAFT',
  `submitted_at` TIMESTAMP NULL,
  `hod_id` INT NULL,
  `hod_action_at` TIMESTAMP NULL,
  `hod_remarks` TEXT NULL,
  `director_id` INT NULL,
  `director_action_at` TIMESTAMP NULL,
  `director_remarks` TEXT NULL,
  `accounts_id` INT NULL,
  `accounts_action_at` TIMESTAMP NULL,
  `accounts_remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`hod_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`director_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`accounts_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_sr_student` (`student_id`),
  INDEX `idx_sr_status` (`status`),
  INDEX `idx_sr_year_sem` (`academic_year`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 7: NEW TABLE registration_subjects
CREATE TABLE IF NOT EXISTS `registration_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `is_backlog` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_reg_subject` (`registration_id`, `subject_id`),
  FOREIGN KEY (`registration_id`) REFERENCES `subject_registrations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 8: SEED SUBJECTS
INSERT INTO `subjects` (`code`, `name`, `branch`, `semester`, `year`, `credits`, `type`) VALUES
('BPUT-M101', 'Engineering Mathematics - I', 'ALL', 1, 1, 4, 'CORE'),
('BPUT-PH101', 'Engineering Physics', 'ALL', 1, 1, 3, 'CORE'),
('BPUT-CH101', 'Engineering Chemistry', 'ALL', 1, 1, 3, 'CORE'),
('BPUT-EG101', 'Engineering Graphics', 'ALL', 1, 1, 3, 'CORE'),
('BPUT-CS101', 'Fundamentals of Computing', 'CSE', 1, 1, 3, 'CORE'),
('BPUT-EE101', 'Basic Electrical Engineering', 'ALL', 1, 1, 3, 'CORE'),
('BPUT-PH191', 'Engineering Physics Lab', 'ALL', 1, 1, 2, 'LAB'),
('BPUT-CH191', 'Engineering Chemistry Lab', 'ALL', 1, 1, 2, 'LAB'),
('BPUT-CS191', 'Computing Fundamentals Lab', 'CSE', 1, 1, 2, 'LAB'),
('BPUT-EG191', 'Engineering Graphics Lab', 'ALL', 1, 1, 2, 'LAB'),
('BPUT-M201', 'Engineering Mathematics - II', 'ALL', 2, 1, 4, 'CORE'),
('BPUT-CS201', 'Programming in C', 'CSE', 2, 1, 3, 'CORE'),
('BPUT-EC201', 'Basic Electronics Engineering', 'CSE', 2, 1, 3, 'CORE'),
('BPUT-ME201', 'Engineering Mechanics', 'ALL', 2, 1, 3, 'CORE'),
('BPUT-HU201', 'Technical Communication', 'ALL', 2, 1, 3, 'CORE'),
('BPUT-CS291', 'C Programming Lab', 'CSE', 2, 1, 2, 'LAB'),
('BPUT-EC291', 'Basic Electronics Lab', 'CSE', 2, 1, 2, 'LAB'),
('BPUT-M301', 'Engineering Mathematics - III', 'CSE', 3, 2, 4, 'CORE'),
('BPUT-CS301', 'Data Structures', 'CSE', 3, 2, 3, 'CORE'),
('BPUT-CS302', 'Digital Electronics', 'CSE', 3, 2, 3, 'CORE'),
('BPUT-CS303', 'Discrete Mathematics', 'CSE', 3, 2, 3, 'CORE'),
('BPUT-CS304', 'Object Oriented Programming', 'CSE', 3, 2, 3, 'CORE'),
('BPUT-CS391', 'Data Structures Lab', 'CSE', 3, 2, 2, 'LAB'),
('BPUT-CS392', 'OOP Lab', 'CSE', 3, 2, 2, 'LAB'),
('BPUT-CS501E1', 'Machine Learning', 'CSE', 5, 3, 3, 'ELECTIVE'),
('BPUT-CS501E2', 'Cloud Computing', 'CSE', 5, 3, 3, 'ELECTIVE'),
('BPUT-CS501E3', 'Cyber Security', 'CSE', 5, 3, 3, 'ELECTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `credits` = VALUES(`credits`);

-- STEP 9: SEED student_fees from existing ledger data
INSERT INTO `student_fees`
  (`student_id`, `roll_number`, `category`, `is_hosteller`, `total_fee`,
   `total_paid`, `tuition_paid`, `hostel_paid`, `exam_fees_paid`,
   `backlog_fees_paid`, `scholarship_amount`, `academic_year`)
SELECT
  s.id, s.reg_no, UPPER(s.category), s.hostel_opted, 115000.00,
  COALESCE(SUM(sfl.amount_paid), 0),
  COALESCE(SUM(CASE WHEN sfl.fee_category_id = 1 THEN sfl.amount_paid ELSE 0 END), 0),
  COALESCE(SUM(CASE WHEN sfl.fee_category_id = 6 THEN sfl.amount_paid ELSE 0 END), 0),
  COALESCE(SUM(CASE WHEN sfl.fee_category_id = 3 THEN sfl.amount_paid ELSE 0 END), 0),
  0.00, 0.00, '2026-27'
FROM `students` s
LEFT JOIN `student_fee_ledgers` sfl ON sfl.student_id = s.id
GROUP BY s.id, s.reg_no, s.category, s.hostel_opted
ON DUPLICATE KEY UPDATE
  `total_paid` = VALUES(`total_paid`),
  `tuition_paid` = VALUES(`tuition_paid`),
  `hostel_paid` = VALUES(`hostel_paid`),
  `exam_fees_paid` = VALUES(`exam_fees_paid`);

-- STEP 10: Extend notifications ENUM
ALTER TABLE `notifications`
  MODIFY COLUMN `category`
  ENUM('INVOICE','PAYMENT','RECEIPT','REMINDER','REFUND','ADJUSTMENT','ALERT','REGISTRATION')
  DEFAULT 'ALERT';

SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Migration completed successfully.' AS result;
