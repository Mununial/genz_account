const allocationService = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/services/allocationService');
const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function testAllocationMe() {
    const [users] = await db.pool.query("SELECT * FROM users WHERE id IN (180, 879)");
    for (const u of users) {
        console.log('\n--- Testing user:', u.id, u.username, u.email, '---');
        const userObj = {
            id: u.id,
            role: 'STUDENT',
            username: u.username,
            email: u.email,
            rollNo: u.username
        };
        try {
            const res = await allocationService.getMyAllocation(userObj);
            console.log('Success! Allocation data:', JSON.stringify(res, null, 2));
        } catch (err) {
            console.error('Failed:', err.message, 'status:', err.status, 'isDayScholar:', err.isDayScholar);
        }
    }
    process.exit(0);
}

testAllocationMe().catch(e => { console.error(e); process.exit(1); });
