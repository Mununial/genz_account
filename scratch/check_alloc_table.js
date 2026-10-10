const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function checkAllocations() {
    const [cols] = await db.pool.query("DESCRIBE allocations");
    console.log('allocations columns:', cols.map(c => c.Field));

    const [rows] = await db.pool.query("SELECT * FROM allocations WHERE student_id = 'mKGOyyMkZmaL8fIZYUBiJWijlap1' OR student_id = '180' OR student_id = '879' OR student_id = 'GZU26081'");
    console.log('Existing allocations for Bablu:', rows);

    process.exit(0);
}

checkAllocations().catch(e => {
    console.error(e);
    process.exit(1);
});
