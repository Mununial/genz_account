const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function checkBabluPhotos() {
    const [users] = await db.pool.query("SELECT id, username, email, full_name, photo_url FROM users WHERE id IN (180, 879)");
    console.log('Users photos:', users);

    const [students] = await db.pool.query("SELECT id, user_id, full_name, roll_number, email, photo_url FROM students WHERE id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1'");
    console.log('Students photo:', students);

    const [face] = await db.pool.query("SELECT * FROM student_face_data WHERE student_id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1' OR student_id = 'GZU26081'");
    console.log('Face data:', face);

    process.exit(0);
}

checkBabluPhotos().catch(e => { console.error(e); process.exit(1); });
