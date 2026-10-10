const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function checkBabluAll() {
    const [students] = await db.pool.query("SELECT id, user_id, full_name, email, roll_number, hostel_required, is_hosteller, hostel_id, bed_id FROM students WHERE id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1' OR email LIKE '%bablu%'");
    console.log('Students:', students);

    const [users] = await db.pool.query("SELECT id, username, email, full_name, user_role FROM users WHERE email LIKE '%bablu%' OR username LIKE '%bablu%'");
    console.log('Users:', users);

    process.exit(0);
}

checkBabluAll().catch(e => {
    console.error(e);
    process.exit(1);
});
