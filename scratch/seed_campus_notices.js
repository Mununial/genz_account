const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedNotices() {
  const [existing] = await db.pool.query('SELECT COUNT(*) as count FROM notices');
  if (existing[0].count > 0) {
    console.log(`Notices already present (${existing[0].count} notices). Skipping seed.`);
    return;
  }

  const notices = [
    {
      title: 'Mandatory Campus Night Curfew Enforcement (20:30 IST)',
      description: 'All resident scholars must be inside hostel premises by 8:30 PM sharp. Gate scanners and biometric access logging will operate strictly under Security Operations protocol.',
      priority: 'URGENT',
      status: 'PUBLISHED',
      published_at: new Date('2026-10-01 08:00:00')
    },
    {
      title: 'TCS & Infosys Campus Recruitment Drive 2026-27',
      description: 'Eligible final-year B.Tech scholars (CSE, ETC, EE, ME) must assemble at the Main Auditorium at 10:00 AM in formal attire with updated resumes and hall passes.',
      priority: 'IMPORTANT',
      status: 'PUBLISHED',
      published_at: new Date('2026-10-02 09:30:00')
    },
    {
      title: 'BPUT Odd Semester Form Fill-up & Examination Manifest',
      description: 'Notice for 5th & 7th Semester B.Tech: Submit university registration clearance tokens at the Academic Section counter before October 15, 2026.',
      priority: 'IMPORTANT',
      status: 'PUBLISHED',
      published_at: new Date('2026-10-02 11:00:00')
    },
    {
      title: 'Central Library Extended Reading Room Hours',
      description: 'Central Library reading hall facility will remain open till 11:00 PM IST on all weekdays to support students preparing for upcoming mid-term evaluations.',
      priority: 'GENERAL',
      status: 'PUBLISHED',
      published_at: new Date('2026-10-02 14:00:00')
    },
    {
      title: 'GENZ Annual Innovation & Robotics Hackathon 2026',
      description: 'Department of CSE and ECE announce the Annual Tech Innovation Hackathon. Registrations open on the campus portal. Cash prizes and incubator funding for top 3 teams.',
      priority: 'GENERAL',
      status: 'PUBLISHED',
      published_at: new Date('2026-10-03 08:15:00')
    }
  ];

  for (const n of notices) {
    await db.pool.query(
      `INSERT INTO notices (title, description, created_by, hostel_id, priority, status, published_at, created_at, updated_at)
       VALUES (?, ?, 1, NULL, ?, ?, ?, NOW(), NOW())`,
      [n.title, n.description, n.priority, n.status, n.published_at]
    );
  }

  console.log(`Successfully seeded ${notices.length} campus notices!`);
}

seedNotices()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
