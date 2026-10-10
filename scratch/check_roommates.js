const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');
async function test() {
  const [s] = await db.pool.query(
    "SELECT id, roll_number, student_id, full_name, bed_id, branch, year, photo_url FROM students WHERE id IN ('IToj3w7mPcW7k1PaoEoqhtcijjC2', 'kLcMwdNNtqPauiHuskRC3kl8xyo1')"
  );
  console.log('Roommates in students table:', s);
  process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
