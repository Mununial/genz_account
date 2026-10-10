const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function createTables() {
  console.log('Creating campus_polls and campus_poll_votes...');

  const sqlPolls = `
    CREATE TABLE IF NOT EXISTS campus_polls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      question TEXT NOT NULL,
      options_json LONGTEXT NOT NULL,
      audience_type ENUM('ALL', 'BATCH', 'HOSTEL') DEFAULT 'ALL',
      target_filter VARCHAR(100) DEFAULT 'All Students',
      duration_hours INT DEFAULT 24,
      expires_at DATETIME NOT NULL,
      status ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') DEFAULT 'ACTIVE',
      created_by VARCHAR(100) DEFAULT 'Dean Student Affairs',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const sqlVotes = `
    CREATE TABLE IF NOT EXISTS campus_poll_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      student_id VARCHAR(100) NOT NULL,
      selected_option_index INT NOT NULL,
      selected_option_text VARCHAR(255) NOT NULL,
      voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_poll (poll_id, student_id),
      CONSTRAINT fk_campus_poll FOREIGN KEY (poll_id) REFERENCES campus_polls(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await db.pool.query(sqlPolls);
  await db.pool.query(sqlVotes);

  console.log('Tables created successfully in MySQL!');

  // Seed 3 realistic polls representing the 3 use cases:
  // 1. Mess menu voting
  // 2. Event preferences
  // 3. Facility feedback
  const [existing] = await db.pool.query('SELECT count(*) as count FROM campus_polls');
  if (existing[0].count === 0) {
    const expires24 = new Date(Date.now() + 24 * 3600000);
    const expires48 = new Date(Date.now() + 48 * 3600000);

    const polls = [
      [
        'Sunday Special Mess Menu Preference',
        'Which special menu do you prefer for this Sunday lunch across all residential hostel dining halls?',
        JSON.stringify([
          'Option A: Biryani Special (Hyderabadi Chicken/Paneer Dum Biryani, Mirchi Salan, Raita, Gulab Jamun)',
          'Option B: Traditional Odia Thali (Dalma, Ghanta Tarkari, Dahi Baigana, Kheer, Puri)',
          'Option C: South Indian Feast (Ghee Roast Dosa, Idli, Medu Vada, 3 Chutneys, Sambar, Payasam)'
        ]),
        'HOSTEL',
        'All Residential Hostels',
        24,
        expires24,
        'ACTIVE',
        'Chief Mess Warden'
      ],
      [
        'Annual Tech Fest 2026 Theme Selection',
        'Vote for your preferred overarching theme for GENZ Annual Techfest & Hackathon 2026:',
        JSON.stringify([
          'Option A: AI & Autonomous Intelligent Systems',
          'Option B: Sustainable CleanTech & Smart Cities',
          'Option C: Cybersecurity & Web3 Frontier'
        ]),
        'ALL',
        'All Batches',
        48,
        expires48,
        'ACTIVE',
        'Dean Student Affairs'
      ],
      [
        'Campus Gymnasium & Fitness Facility Timings',
        'Should campus indoor gym and badminton courts extend evening hours till 10:30 PM?',
        JSON.stringify([
          'Option A: Yes, extend evening hours (06:00 PM - 10:30 PM)',
          'Option B: No, keep current timings (05:30 PM - 09:00 PM)',
          'Option C: Prefer early morning slot expansion (05:30 AM - 08:30 AM)'
        ]),
        'ALL',
        'All Campus',
        24,
        expires24,
        'ACTIVE',
        'Sports Council GENZ'
      ]
    ];

    for (const p of polls) {
      await db.pool.query(`
        INSERT INTO campus_polls 
        (title, question, options_json, audience_type, target_filter, duration_hours, expires_at, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, p);
    }

    console.log('Seeded 3 live campus polls!');

    // Seed realistic sample votes for Poll 1 (Mess Menu) to demonstrate real-time count & percentages!
    const [students] = await db.pool.query('SELECT id FROM students LIMIT 150');
    // Distribute votes: 75 votes Option A, 45 votes Option B, 30 votes Option C
    let vIdx = 0;
    for (const s of students) {
      let optIdx = 0;
      let optText = 'Option A: Biryani Special';
      if (vIdx < 75) {
        optIdx = 0;
        optText = 'Option A: Biryani Special';
      } else if (vIdx < 120) {
        optIdx = 1;
        optText = 'Option B: Traditional Odia Thali';
      } else {
        optIdx = 2;
        optText = 'Option C: South Indian Feast';
      }

      await db.pool.query(`
        INSERT INTO campus_poll_votes (poll_id, student_id, selected_option_index, selected_option_text, voted_at)
        VALUES (1, ?, ?, ?, NOW())
      `, [s.id, optIdx, optText]);
      vIdx++;
    }
    console.log(`Seeded ${vIdx} sample student votes for Poll 1!`);
  }

  process.exit(0);
}

createTables().catch(err => {
  console.error('Error creating tables:', err);
  process.exit(1);
});
