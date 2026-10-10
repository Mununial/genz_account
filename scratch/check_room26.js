const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function checkRoom26() {
    const [beds] = await db.pool.query("SELECT * FROM beds WHERE room_id = 26");
    console.log('Beds in Room 26:', beds);

    const [allocs] = await db.pool.query("SELECT * FROM student_allocations WHERE room_id = 26");
    console.log('Allocs in Room 26:', allocs);

    const [babluAllocs] = await db.pool.query("SELECT * FROM student_allocations WHERE student_id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1'");
    console.log('Bablu Allocs in student_allocations:', babluAllocs);

    const [studentsInBeds] = await db.pool.query(
        "SELECT id, roll_number, full_name, bed_id, is_hosteller, hostel_required FROM students WHERE bed_id IN (SELECT id FROM beds WHERE room_id = 26)"
    );
    console.log('Students assigned to beds in Room 26:', studentsInBeds);

    process.exit(0);
}

checkRoom26().catch(e => { console.error(e); process.exit(1); });
