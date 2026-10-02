const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });

const subjects = [
  // B.Tech CSE (Sem 1)
  { id: 1, code: 'BPUT-M101', name: 'Engineering Mathematics - I', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 2, code: 'BPUT-PH101', name: 'Engineering Physics', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 2 },
  { id: 3, code: 'BPUT-CH101', name: 'Engineering Chemistry', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 3 },
  { id: 4, code: 'BPUT-EG101', name: 'Engineering Graphics', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 4 },
  { id: 5, code: 'BPUT-CS101', name: 'Fundamentals of Computing', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5 },
  { id: 6, code: 'BPUT-EE101', name: 'Basic Electrical Engineering', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6 },
  { id: 7, code: 'BPUT-PH191', name: 'Engineering Physics Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7 },
  { id: 8, code: 'BPUT-CH191', name: 'Engineering Chemistry Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 8 },
  { id: 9, code: 'BPUT-CS191', name: 'Computing Fundamentals Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 9 },
  { id: 10, code: 'BPUT-EG191', name: 'Engineering Graphics Lab', program_id: 1, department_id: 1, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 10 },
  // B.Tech CSE (Sem 2)
  { id: 101, code: 'BPUT-M201', name: 'Engineering Mathematics - II', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 102, code: 'BPUT-DS201', name: 'Data Structures & Algorithms', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 103, code: 'BPUT-BE201', name: 'Basic Electronics Engineering', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 3 },
  { id: 104, code: 'BPUT-ENG201', name: 'Communicative English', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 4 },
  { id: 105, code: 'BPUT-EVS201', name: 'Environmental Studies & Green Tech', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'CORE', sequence: 5 },
  { id: 106, code: 'BPUT-DS291', name: 'Data Structures Practice Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 6 },
  { id: 107, code: 'BPUT-BE291', name: 'Basic Electronics Laboratory', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 7 },
  { id: 108, code: 'BPUT-ENG291', name: 'English Communication Skills Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 8 },
  { id: 109, code: 'BPUT-WS291', name: 'Manufacturing & Workshop Lab', program_id: 1, department_id: 1, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 9 },
  // B.Tech MECH (Sem 1)
  { id: 21, code: 'BPUT-ME101', name: 'Thermodynamics & Heat Engines', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 22, code: 'BPUT-ME102', name: 'Engineering Mechanics (Statics & Dynamics)', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 23, code: 'BPUT-ME191', name: 'Central Workshop Practice Lab', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3 },
  { id: 24, code: 'BPUT-M101M', name: 'Engineering Mathematics - I', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 4 },
  { id: 25, code: 'BPUT-PH101M', name: 'Engineering Physics', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5 },
  { id: 26, code: 'BPUT-EG101M', name: 'Engineering Graphics & CAD', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6 },
  { id: 27, code: 'BPUT-PH191M', name: 'Physics Laboratory', program_id: 1, department_id: 3, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7 },
  // B.Tech MECH (Sem 2)
  { id: 201, code: 'BPUT-ME201', name: 'Material Science & Metallurgy', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 202, code: 'BPUT-ME202', name: 'Fluid Mechanics & Hydraulic Machines', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 203, code: 'BPUT-ME203', name: 'Basic Electronics & Sensors', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 3 },
  { id: 204, code: 'BPUT-M201M', name: 'Engineering Mathematics - II', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 4, type: 'CORE', sequence: 4 },
  { id: 205, code: 'BPUT-ENG201M', name: 'Communicative English', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 3, type: 'CORE', sequence: 5 },
  { id: 206, code: 'BPUT-ME291', name: 'Material Testing & Metallurgy Lab', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 6 },
  { id: 207, code: 'BPUT-ME292', name: 'Fluid Mechanics Laboratory', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 7 },
  { id: 208, code: 'BPUT-ENG291M', name: 'English Communication Skills Lab', program_id: 1, department_id: 3, semester: 2, year: 1, credits: 2, type: 'LAB', sequence: 8 },
  // B.Tech CIVIL (Sem 1)
  { id: 31, code: 'BPUT-CE101', name: 'Surveying & Geomatics', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 32, code: 'BPUT-CE102', name: 'Building Materials & Construction', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 33, code: 'BPUT-CE191', name: 'Surveying Field Practice Lab', program_id: 1, department_id: 5, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3 },
  // Diploma (Sem 1)
  { id: 41, code: 'DIP-M101', name: 'Applied Mathematics - I', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 42, code: 'DIP-SC101', name: 'Applied Science (Physics & Chemistry)', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 43, code: 'DIP-ME191', name: 'Workshop Technology Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 3 },
  { id: 441, code: 'DIP-ENG101', name: 'Communication English & Grammar', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 4 },
  { id: 442, code: 'DIP-EG101', name: 'Engineering Drawing & Drafting', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 5 },
  { id: 443, code: 'DIP-CS101', name: 'Computer Application Fundamentals', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 3, type: 'CORE', sequence: 6 },
  { id: 444, code: 'DIP-SC191', name: 'Applied Science Practical Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 7 },
  { id: 445, code: 'DIP-CS191', name: 'Computer Application Lab', program_id: 2, department_id: 8, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 8 },
  // MBA (Sem 1)
  { id: 51, code: 'MBA-101', name: 'Organizational Behavior & Principles', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 1 },
  { id: 52, code: 'MBA-102', name: 'Managerial Economics', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 2 },
  { id: 53, code: 'MBA-103', name: 'Accounting for Financial Decision Making', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 3 },
  { id: 54, code: 'MBA-104', name: 'Business Communication Lab', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 2, type: 'LAB', sequence: 4 },
  { id: 55, code: 'MBA-105', name: 'Marketing Management Essentials', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 5 },
  { id: 56, code: 'MBA-106', name: 'Quantitative Techniques for Managers', program_id: 3, department_id: 11, semester: 1, year: 1, credits: 4, type: 'CORE', sequence: 6 }
];

async function seedLiveSubjects() {
  console.log('Seeding BPUT Subject Catalog into Hostinger MySQL...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  let inserted = 0;
  for (const s of subjects) {
    await conn.query(`
      INSERT INTO subjects (id, code, name, program_id, department_id, semester, year, credits, type, sequence, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE name = VALUES(name), credits = VALUES(credits), type = VALUES(type);
    `, [s.id, s.code, s.name, s.program_id, s.department_id, s.semester, s.year, s.credits, s.type, s.sequence]);
    inserted++;
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  const [res] = await conn.query('SELECT COUNT(*) as count FROM subjects');
  console.log(`✓ Successfully seeded ${inserted} subjects! Total subjects in Hostinger DB: ${res[0].count}`);

  await conn.end();
}

seedLiveSubjects();
