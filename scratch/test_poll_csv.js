const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');
const pollId = 1;

async function test() {
  try {
    const [pollRows] = await db.pool.query('SELECT title, question FROM campus_polls WHERE id = ?', [pollId]);
    console.log('POLL ROWS:', pollRows);

    const [votes] = await db.pool.query(`
      SELECT 
        cpv.id as vote_id,
        cpv.student_id,
        s.full_name,
        s.roll_number,
        s.branch,
        cpv.selected_option_index,
        cpv.selected_option_text,
        DATE_FORMAT(cpv.voted_at, '%Y-%m-%d %H:%i:%s') as voted_at
      FROM campus_poll_votes cpv
      LEFT JOIN students s ON (cpv.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci OR cpv.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci OR cpv.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci)
      WHERE cpv.poll_id = ?
      ORDER BY cpv.id ASC
    `, [pollId]);

    console.log('VOTES COUNT:', votes.length);
    console.log('SAMPLE VOTE:', votes[0]);
    process.exit(0);
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
    process.exit(1);
  }
}

test();
