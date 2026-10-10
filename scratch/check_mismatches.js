const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function checkMismatches() {
    // Check Bablu users
    const [babluUsers] = await db.pool.query("SELECT * FROM users WHERE email LIKE '%bablu%' OR username LIKE '%bablu%' OR username = 'GZU26081'");
    console.log('Bablu users:', babluUsers);

    // Check student record
    const [babluStudent] = await db.pool.query("SELECT id, user_id, student_id, roll_number, email, full_name, photo_url FROM students WHERE roll_number = 'GZU26081' OR student_id = 'GZU26081' OR email LIKE '%bablu%'");
    console.log('Bablu student:', babluStudent);

    process.exit(0);
}

checkMismatches().catch(e => { console.error(e); process.exit(1); });
