const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function fixDob() {
  console.log('--- Fetching current record for Jitendra Nial (2301316095) ---');
  const [current] = await db.pool.query(
    "SELECT id, roll_number, student_id, full_name, dob, personal_json FROM students WHERE roll_number = '2301316095' OR id = 'STU_JITENDRA_2301316095'"
  );
  console.log('Before update:', current[0]);

  let personal = current[0].personal_json;
  if (typeof personal === 'string') {
    try { personal = JSON.parse(personal); } catch(e) { personal = {}; }
  }
  personal = personal || {};
  personal.dob = '2005-05-12';
  personal.dateOfBirth = '2005-05-12';

  const [res] = await db.pool.query(
    "UPDATE students SET dob = '2005-05-12', personal_json = ? WHERE roll_number = '2301316095' OR id = 'STU_JITENDRA_2301316095'",
    [JSON.stringify(personal)]
  );
  console.log('Updated students table. Affected rows:', res.affectedRows);

  const [updated] = await db.pool.query(
    "SELECT id, roll_number, student_id, full_name, dob, personal_json FROM students WHERE roll_number = '2301316095' OR id = 'STU_JITENDRA_2301316095'"
  );
  console.log('After update:', updated[0]);

  process.exit(0);
}

fixDob().catch(e => {
  console.error(e);
  process.exit(1);
});
