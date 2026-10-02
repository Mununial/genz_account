CREATE TABLE IF NOT EXISTS student_health_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  blood_group VARCHAR(10) DEFAULT 'B+',
  medical_conditions TEXT,
  allergies TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  vaccination_status VARCHAR(50) DEFAULT 'Fully Vaccinated',
  special_medical_needs TEXT,
  medical_fitness_status VARCHAR(50) DEFAULT 'Certified Fit',
  insurance_policy_no VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
