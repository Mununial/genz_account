-- ==============================================================================
-- BEC ACCOUNTS SYSTEM — DEPARTMENT-WISE SUBJECT REGISTRATION SYSTEM MIGRATION
-- BPUT College Program + Department + Semester Structured
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS `programs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,     -- 'B.Tech', 'Diploma', 'MBA'
  `code` VARCHAR(20) NOT NULL UNIQUE,     -- 'BTECH', 'DIP', 'MBA'
  `duration_years` INT NOT NULL,
  `total_semesters` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` INT NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,     -- 'CSE', 'CSD', 'MECH', 'AERO', etc.
  `name` VARCHAR(100) NOT NULL,
  `short_name` VARCHAR(20) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DEPARTMENT HODS TABLE
CREATE TABLE IF NOT EXISTS `department_hods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL,
  `hod_user_id` INT NOT NULL,
  `semester_range` VARCHAR(20) DEFAULT '1-8',   -- '1-2', '3-4', '5-6', '7-8'
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`hod_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SUBJECTS TABLE (Enhanced with program_id and department_id)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `program_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `semester` INT NOT NULL,
  `year` INT NOT NULL,
  `credits` INT NOT NULL,
  `type` ENUM('CORE','ELECTIVE','LAB','BACKLOG') DEFAULT 'CORE',
  `is_active` BOOLEAN DEFAULT TRUE,
  `sequence` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SUBJECT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS `subject_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_number` VARCHAR(50) UNIQUE,
  `student_id` INT NOT NULL,
  `roll_number` VARCHAR(50) NOT NULL,
  `program_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `semester` INT NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL DEFAULT '2026-27',
  `registration_type` ENUM('REGULAR','BACKLOG') DEFAULT 'REGULAR',
  `total_credits` INT NOT NULL DEFAULT 0,
  `status` ENUM(
    'DRAFT','SUBMITTED',
    'HOD_REVIEW','HOD_FORWARDED','HOD_REVERTED',
    'DIRECTOR_REVIEW','DIRECTOR_APPROVED','DIRECTOR_REJECTED',
    'ACCOUNTS_REVIEW','CONFIRMED','REJECTED'
  ) DEFAULT 'DRAFT',
  `submitted_at` TIMESTAMP NULL,
  `hod_id` INT NULL,
  `hod_action_at` TIMESTAMP NULL,
  `hod_remarks` TEXT,
  `director_id` INT NULL,
  `director_action_at` TIMESTAMP NULL,
  `director_remarks` TEXT,
  `accounts_id` INT NULL,
  `accounts_action_at` TIMESTAMP NULL,
  `accounts_remarks` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. REGISTRATION SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS `registration_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `is_backlog` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `subject_registrations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SEED PROGRAMS
INSERT INTO `programs` (`id`, `name`, `code`, `duration_years`, `total_semesters`) VALUES
(1, 'B.Tech', 'BTECH', 4, 8),
(2, 'Diploma', 'DIP', 3, 6),
(3, 'MBA', 'MBA', 2, 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 8. SEED DEPARTMENTS
-- B.Tech Departments
INSERT INTO `departments` (`id`, `program_id`, `code`, `name`, `short_name`, `is_active`) VALUES
(1, 1, 'CSE', 'Computer Science & Engineering', 'CSE', 1),
(2, 1, 'CSD', 'Computer Science & Data Science', 'CSD', 1),
(3, 1, 'MECH', 'Mechanical Engineering', 'MECH', 1),
(4, 1, 'AERO', 'Aeronautical Engineering', 'AERO', 1),
(5, 1, 'CIVIL', 'Civil Engineering', 'CIVIL', 1),
(6, 1, 'EEE', 'Electrical & Electronics Engineering', 'EEE', 1),
(7, 1, 'AGRI', 'Agriculture Engineering', 'AGRI', 1),
-- Diploma Departments
(8, 2, 'DIP-MECH', 'Diploma Mechanical Engineering', 'DIP-MECH', 1),
(9, 2, 'DIP-EEE', 'Diploma Electrical Engineering', 'DIP-EEE', 1),
(10, 2, 'DIP-CIVIL', 'Diploma Civil Engineering', 'DIP-CIVIL', 1),
-- MBA Department
(11, 3, 'MBA', 'Master of Business Administration', 'MBA', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 9. SEED DEPARTMENT HOD USERS
INSERT INTO `users` (`id`, `email`, `password_hash`, `role_id`, `must_change_password`, `is_active`) VALUES
(10, 'hod.cse@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(11, 'hod.csd@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(12, 'hod.mech@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(13, 'hod.aero@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(14, 'hod.civil@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(15, 'hod.eee@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(16, 'hod.agri@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(17, 'hod.diploma@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(18, 'hod.mba@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 6, 0, 1),
(19, 'director@bec.ac.in', '$2b$12$9OnJ6GT1Zycz2K1V1hZInOJ7Tv7IPkUpnC2LfbwyD6cIWy.G40WZO', 7, 0, 1)
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- Staff records for HODs
INSERT INTO `staff` (`user_id`, `staff_code`, `full_name`, `designation`, `department`, `phone`) VALUES
(10, 'BEC-HOD-CSE-001', 'Dr. Rajesh Kumar Mohanty', 'Head of Department', 'Computer Science & Engineering', '+91-9437000010'),
(11, 'BEC-HOD-CSD-001', 'Dr. Priyadarshi Biswal', 'Head of Department', 'Computer Science & Data Science', '+91-9437000011'),
(12, 'BEC-HOD-MEC-001', 'Prof. Manoranjan Pradhan', 'Head of Department', 'Mechanical Engineering', '+91-9437000012'),
(13, 'BEC-HOD-AER-001', 'Wing Cdr. (Retd) K. N. Das', 'Head of Department', 'Aeronautical Engineering', '+91-9437000013'),
(14, 'BEC-HOD-CIV-001', 'Dr. Subhashree Senapati', 'Head of Department', 'Civil Engineering', '+91-9437000014'),
(15, 'BEC-HOD-EEE-001', 'Prof. Ashis Kumar Panda', 'Head of Department', 'Electrical & Electronics Engineering', '+91-9437000015'),
(16, 'BEC-HOD-AGR-001', 'Dr. Bijay Ketan Nayak', 'Head of Department', 'Agriculture Engineering', '+91-9437000016'),
(17, 'BEC-HOD-DIP-001', 'Er. Chandan Kumar Rout', 'Head of Department', 'Diploma Engineering Wing', '+91-9437000017'),
(18, 'BEC-HOD-MBA-001', 'Dr. Smruti Rekha Jena', 'Head of Department', 'Master of Business Administration', '+91-9437000018'),
(19, 'BEC-DIR-001', 'Prof. S. K. Rath', 'Director', 'Administration', '+91-9437000099')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 10. MAP DEPARTMENT HODS
INSERT INTO `department_hods` (`department_id`, `hod_user_id`, `semester_range`) VALUES
(1, 10, '1-8'), -- CSE
(2, 11, '1-8'), -- CSD
(3, 12, '1-8'), -- MECH
(4, 13, '1-8'), -- AERO
(5, 14, '1-8'), -- CIVIL
(6, 15, '1-8'), -- EEE
(7, 16, '1-8'), -- AGRI
(8, 17, '1-6'), -- DIP-MECH
(9, 17, '1-6'), -- DIP-EEE
(10, 17, '1-6'), -- DIP-CIVIL
(11, 18, '1-4')  -- MBA
ON DUPLICATE KEY UPDATE `hod_user_id` = VALUES(`hod_user_id`);

SET FOREIGN_KEY_CHECKS = 1;
