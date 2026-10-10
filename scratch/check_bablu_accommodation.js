const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function inspect() {
    const [students] = await db.pool.query(
        "SELECT * FROM students WHERE user_id IN (180, 879) OR roll_number = 'GZU26081' OR email LIKE '%bablu%'"
    );
    console.log('Students:', JSON.stringify(students, null, 2));

    const [users] = await db.pool.query(
        "SELECT id, username, email, full_name, user_role, photo_url FROM users WHERE id IN (180, 879) OR username = 'GZU26081' OR email LIKE '%bablu%'"
    );
    console.log('Users:', JSON.stringify(users, null, 2));

    const [allocations] = await db.pool.query(
        "SELECT * FROM allocations WHERE student_id IN (SELECT id FROM students WHERE user_id IN (180, 879) OR roll_number = 'GZU26081') OR student_id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1'"
    );
    console.log('Allocations:', JSON.stringify(allocations, null, 2));

    process.exit(0);
}
inspect().catch(e => { console.error(e); process.exit(1); });
