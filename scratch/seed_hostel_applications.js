const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedHostelApplications() {
  console.log('Seeding room_applications...');

  const [existing] = await db.pool.query('SELECT count(*) as count FROM room_applications');
  if (existing[0].count > 50) {
    console.log('Room applications already seeded (' + existing[0].count + ' records).');
    process.exit(0);
  }

  const [students] = await db.pool.query('SELECT id, roll_number, full_name, gender, branch, year FROM students LIMIT 250');
  
  let appNumber = 1001;
  const values = [];

  for (let i = 0; i < 450; i++) {
    const isGirl = i >= 280; // First 280 Boys, next 170 Girls
    const student = students[i % students.length];
    const studentId = student.id;
    const prefHostelId = isGirl ? 2 : 1;
    const roomType = (i % 3 === 0) ? 'AC' : ((i % 2 === 0) ? 'DOUBLE' : 'TRIPLE');
    const status = (i < 320) ? 'ALLOCATED' : 'PENDING';
    const appNum = 'APP-2026-' + (appNumber + i);

    values.push([
      appNum,
      studentId,
      prefHostelId,
      roomType,
      2026,
      status,
      null,
      'Standard hostel accommodation application for Academic Session 2026-27'
    ]);
  }

  const chunkSize = 25;
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    const sql = 'INSERT INTO room_applications (application_number, student_id, preferred_hostel_id, room_type_preference, academic_year, status, allocated_bed_id, special_requests, created_at, updated_at) VALUES ' + chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())').join(', ');
    const flatParams = chunk.flat();
    await db.pool.query(sql, flatParams);
  }

  console.log('Successfully seeded 450 room applications into MySQL!');
  process.exit(0);
}

seedHostelApplications().catch(err => {
  console.error('Error seeding room applications:', err);
  process.exit(1);
});
