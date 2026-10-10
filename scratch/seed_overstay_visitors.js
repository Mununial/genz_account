const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedVisitors() {
  try {
    const [students] = await db.pool.query('SELECT id FROM students LIMIT 5');

    // Get current date/time
    const now = new Date();
    
    // Normal: check-in 30 mins ago, expected out in 60 mins
    const tNormalIn = new Date(now.getTime() - 30 * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const tNormalExpected = new Date(now.getTime() + 60 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    // Warning: check-in 2 hours ago, expected out 18 mins ago
    const tWarningIn = new Date(now.getTime() - 120 * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const tWarningExpected = new Date(now.getTime() - 18 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    // Critical: check-in 3 hours ago, expected out 48 mins ago
    const tCriticalIn = new Date(now.getTime() - 180 * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const tCriticalExpected = new Date(now.getTime() - 48 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    // Completed: check-in 4 hours ago, checked out 2 hours ago
    const tCompletedIn = new Date(now.getTime() - 240 * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const tCompletedExpected = new Date(now.getTime() - 120 * 60000).toISOString().slice(0, 19).replace('T', ' ');
    const tCompletedOut = new Date(now.getTime() - 125 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    await db.pool.query('DELETE FROM visits');

    const list = [
      {
        student_id: students[0].id,
        hostel_id: 1,
        visitor_name: 'Rajesh Mishra',
        visitor_phone: '+91-9861011223',
        visitor_type: 'PARENT',
        purpose: 'Hostel accommodation & fee clearance',
        id_type: 'AADHAAR',
        id_last4: '4892',
        in_time: tWarningIn,
        exp_time: tWarningExpected,
        out_time: null,
        status: 'CHECKED_IN'
      },
      {
        student_id: students[1].id,
        hostel_id: 2,
        visitor_name: 'Pradeep Rout',
        visitor_phone: '+91-9853221100',
        visitor_type: 'VENDOR',
        purpose: 'Hostel mess dairy supply & refrigeration inspection',
        id_type: 'DRIVING_LICENSE',
        id_last4: '7721',
        in_time: tCriticalIn,
        exp_time: tCriticalExpected,
        out_time: null,
        status: 'CHECKED_IN'
      },
      {
        student_id: students[2].id,
        hostel_id: 1,
        visitor_name: 'Dr. Debabrata Samantaray',
        visitor_phone: '+91-9437199880',
        visitor_type: 'GUEST_FACULTY',
        purpose: 'Invited Keynote: Emerging Cloud Topologies',
        id_type: 'PAN',
        id_last4: '3341',
        in_time: tNormalIn,
        exp_time: tNormalExpected,
        out_time: null,
        status: 'CHECKED_IN'
      },
      {
        student_id: students[3].id,
        hostel_id: 1,
        visitor_name: 'Sunita Mohapatra',
        visitor_phone: '+91-9437889900',
        visitor_type: 'GUARDIAN',
        purpose: 'Semester medical supplies handover',
        id_type: 'VOTER_ID',
        id_last4: '9012',
        in_time: tCompletedIn,
        exp_time: tCompletedExpected,
        out_time: tCompletedOut,
        status: 'CHECKED_OUT'
      }
    ];

    for (const v of list) {
      await db.pool.query(`
        INSERT INTO visits 
        (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [v.student_id, v.hostel_id, v.visitor_name, v.visitor_phone, v.visitor_type, v.purpose, v.id_type, v.id_last4, v.in_time, v.exp_time, v.in_time, v.out_time, v.status]);
    }

    console.log('Seeded 4 realistic visitors with active overstay telemetry!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedVisitors();
