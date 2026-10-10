const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function fixDatabase() {
    console.log('1. Updating Bablu Bag student record...');
    const [u180] = await db.pool.query("SELECT * FROM users WHERE id = 180");
    console.log('User 180:', u180[0]);

    // Update Bablu Bag student record to link user_id 180, hostel_required Yes, is_hosteller 1, hostel_id 1, bed_id 76
    const [resBablu] = await db.pool.query(`
        UPDATE students 
        SET user_id = 180,
            hostel_required = 'Yes',
            is_hosteller = 1,
            hostel_id = 1,
            bed_id = 76,
            photo_url = 'https://res.cloudinary.com/sbnlowsc/image/upload/v1785738265/student_docs/mKGOyyMkZmaL8fIZYUBiJWijlap1/sg4nhvyexjdqh9hyroxl.jpg'
        WHERE id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1' OR roll_number = 'GZU26081'
    `);
    console.log('Bablu student updated:', resBablu.affectedRows);

    // Ensure User 180 & 879 photo_url
    await db.pool.query(`
        UPDATE users 
        SET photo_url = 'https://res.cloudinary.com/sbnlowsc/image/upload/v1785738265/student_docs/mKGOyyMkZmaL8fIZYUBiJWijlap1/sg4nhvyexjdqh9hyroxl.jpg'
        WHERE id IN (180, 879) OR username = 'GZU26081'
    `);
    console.log('Bablu users photo updated.');

    // 2. Roommates: Arun Patra (Bed 77, Room 26, Hostel 1)
    const [resArun] = await db.pool.query(`
        UPDATE students
        SET hostel_required = 'Yes',
            is_hosteller = 1,
            hostel_id = 1,
            bed_id = 77
        WHERE id = 'IToj3w7mPcW7k1PaoEoqhtcijjC2' OR student_id = 'GZU26213'
    `);
    console.log('Arun Patra updated:', resArun.affectedRows);

    // 3. Roommates: Asutosha Sahoo (Bed 78, Room 26, Hostel 1)
    const [resAsutosha] = await db.pool.query(`
        UPDATE students
        SET hostel_required = 'Yes',
            is_hosteller = 1,
            hostel_id = 1,
            bed_id = 78
        WHERE id = 'kLcMwdNNtqPauiHuskRC3kl8xyo1' OR student_id = 'GZU26230'
    `);
    console.log('Asutosha Sahoo updated:', resAsutosha.affectedRows);

    // 4. Verify Beds 76, 77, 78 status
    await db.pool.query(`
        UPDATE beds
        SET status = 'OCCUPIED'
        WHERE id IN (76, 77, 78)
    `);
    console.log('Beds 76, 77, 78 set to OCCUPIED.');

    // 5. Verify student_allocations
    const [allocs] = await db.pool.query(`
        SELECT sa.id, sa.student_id, sa.room_id, sa.bed_id, sa.status, s.full_name, s.roll_number, s.student_id as student_code, b.bed_number, r.room_number
        FROM student_allocations sa
        JOIN students s ON sa.student_id = s.id
        JOIN beds b ON sa.bed_id = b.id
        JOIN rooms r ON sa.room_id = r.id
        WHERE sa.room_id = 26
    `);
    console.log('\nVerified Active Allocations in Room 126:\n', JSON.stringify(allocs, null, 2));

    process.exit(0);
}

fixDatabase().catch(e => { console.error(e); process.exit(1); });
