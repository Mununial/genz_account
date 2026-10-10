const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function testQuery() {
    const [rows] = await db.pool.query(
        `SELECT s.id, s.user_id, s.full_name, s.roll_number, s.student_id, s.is_hosteller, s.hostel_required, s.hostel_id, s.bed_id,
                h.name as hostel_name, r.id as room_id, r.room_number, b.bed_number
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN beds b ON s.bed_id = b.id
         LEFT JOIN rooms r ON b.room_id = r.id
         WHERE s.roll_number = 'GZU26081' OR s.id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1'`
    );
    console.log('Student with joins:', rows);

    // Check table names in DB
    const [tables] = await db.pool.query("SHOW TABLES LIKE '%alloc%'");
    console.log('Allocation tables:', tables);

    const [allHostels] = await db.pool.query("SELECT * FROM hostels");
    console.log('Hostels:', allHostels);

    const [bed76] = await db.pool.query("SELECT * FROM beds WHERE id = 76");
    console.log('Bed 76:', bed76);

    if (bed76.length > 0) {
        const [room] = await db.pool.query("SELECT * FROM rooms WHERE id = ?", [bed76[0].room_id]);
        console.log('Room of Bed 76:', room);
    }

    process.exit(0);
}

testQuery().catch(e => { console.error(e); process.exit(1); });
