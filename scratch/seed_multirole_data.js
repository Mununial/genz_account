const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedMultiRoleData() {
  try {
    const [students] = await db.pool.query('SELECT id, student_id, full_name, roll_number, branch, hostel_id, phone, father_name FROM students LIMIT 20');
    console.log(`Loaded ${students.length} students for multi-role seeding.`);

    // 1. Seed Visits
    await db.pool.query('DELETE FROM visits');
    const sampleVisits = [
      {
        student_id: students[0].id,
        hostel_id: 1,
        visitor_name: 'Rajesh Mishra',
        visitor_phone: '+91-9861011223',
        visitor_email: 'rajesh.mishra@gmail.com',
        visitor_type: 'PARENT',
        purpose: 'Fee clearance & local guardian visit',
        identification_type: 'AADHAAR',
        identification_last4: '4892',
        visit_date: '2026-10-02',
        expected_check_in: '10:00:00',
        expected_check_out: '16:00:00',
        actual_check_in: '2026-10-02 10:15:00',
        actual_check_out: null,
        status: 'CHECKED_IN',
        created_by: 1
      },
      {
        student_id: students[1].id,
        hostel_id: 2,
        visitor_name: 'Sunita Mohapatra',
        visitor_phone: '+91-9437889900',
        visitor_email: 'sunita.m@gmail.com',
        visitor_type: 'GUARDIAN',
        purpose: 'Medical supply handover',
        identification_type: 'VOTER_ID',
        identification_last4: '9012',
        visit_date: '2026-10-02',
        expected_check_in: '11:30:00',
        expected_check_out: '14:30:00',
        actual_check_in: '2026-10-02 11:25:00',
        actual_check_out: null,
        status: 'CHECKED_IN',
        created_by: 1
      },
      {
        student_id: students[2].id,
        hostel_id: 1,
        visitor_name: 'Anand Verma',
        visitor_phone: '+91-9937123456',
        visitor_email: 'anand.verma@techsolutions.com',
        visitor_type: 'GUEST_FACULTY',
        purpose: 'Guest Lecture on Cloud Infrastructure',
        identification_type: 'PAN',
        identification_last4: '3341',
        visit_date: '2026-10-02',
        expected_check_in: '09:00:00',
        expected_check_out: '13:00:00',
        actual_check_in: '2026-10-02 09:10:00',
        actual_check_out: '2026-10-02 13:15:00',
        status: 'CHECKED_OUT',
        created_by: 1
      },
      {
        student_id: students[3].id,
        hostel_id: 1,
        visitor_name: 'Pradeep Rout',
        visitor_phone: '+91-9853221100',
        visitor_email: 'prout@logistics.in',
        visitor_type: 'VENDOR',
        purpose: 'Hostel mess grocery inspection',
        identification_type: 'DRIVING_LICENSE',
        identification_last4: '7721',
        visit_date: '2026-10-02',
        expected_check_in: '08:00:00',
        expected_check_out: '11:00:00',
        actual_check_in: '2026-10-02 08:05:00',
        actual_check_out: '2026-10-02 10:45:00',
        status: 'CHECKED_OUT',
        created_by: 1
      }
    ];

    for (const v of sampleVisits) {
      await db.pool.query(`
        INSERT INTO visits 
        (student_id, hostel_id, visitor_name, visitor_phone, visitor_email, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, expected_check_out, actual_check_in, actual_check_out, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [v.student_id, v.hostel_id, v.visitor_name, v.visitor_phone, v.visitor_email, v.visitor_type, v.purpose, v.identification_type, v.identification_last4, v.visit_date, v.expected_check_in, v.expected_check_out, v.actual_check_in, v.actual_check_out, v.status, v.created_by]);
    }
    console.log('Seeded visits successfully!');

    // 2. Seed Leave Applications
    await db.pool.query('DELETE FROM leave_applications');
    const sampleLeaves = [
      {
        leave_number: 'LEV-2026-101',
        student_id: students[0].id,
        hostel_id: 1,
        leave_type: 'WEEKEND_HOME',
        start_date: '2026-10-03',
        end_date: '2026-10-05',
        reason: 'Family festival celebration and medical health checkup in hometown.',
        destination_address: 'Plot 42, Cuttack Road, Bhubaneswar',
        emergency_phone: '+91-9437102030',
        status: 'PENDING'
      },
      {
        leave_number: 'LEV-2026-102',
        student_id: students[1].id,
        hostel_id: 2,
        leave_type: 'ACADEMIC_INTERNSHIP',
        start_date: '2026-10-06',
        end_date: '2026-10-12',
        reason: 'Attending IEEE Student Technical Conference & Paper Presentation.',
        destination_address: 'IIT Kharagpur Campus, West Bengal',
        emergency_phone: '+91-9861234567',
        status: 'PENDING'
      },
      {
        leave_number: 'LEV-2026-103',
        student_id: students[2].id,
        hostel_id: 1,
        leave_type: 'SICK_LEAVE',
        start_date: '2026-10-01',
        end_date: '2026-10-03',
        reason: 'Recovering from severe viral fever with physician advised bed rest.',
        destination_address: 'Home Residence, Rourkela',
        emergency_phone: '+91-9938001122',
        status: 'APPROVED',
        approved_by: 1
      }
    ];

    for (const l of sampleLeaves) {
      await db.pool.query(`
        INSERT INTO leave_applications 
        (leave_number, student_id, hostel_id, leave_type, start_date, end_date, reason, destination_address, emergency_phone, status, approved_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [l.leave_number, l.student_id, l.hostel_id, l.leave_type, l.start_date, l.end_date, l.reason, l.destination_address, l.emergency_phone, l.status, l.approved_by || null]);
    }
    console.log('Seeded leave applications successfully!');

    // 3. Seed Attendance Records
    await db.pool.query('DELETE FROM attendance');
    const dates = ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
    for (let i = 0; i < Math.min(students.length, 10); i++) {
      const s = students[i];
      for (const d of dates) {
        const isPresent = i === 2 && (d === '2026-10-01' || d === '2026-10-02') ? 'ABSENT' : (Math.random() > 0.15 ? 'PRESENT' : 'ABSENT');
        await db.pool.query(`
          INSERT INTO attendance 
          (student_id, hostel_id, attendance_date, status, marked_by, marked_at, created_at)
          VALUES (?, ?, ?, ?, 1, NOW(), NOW())
        `, [s.id, s.hostel_id || 1, d, isPresent]);
      }
    }
    console.log('Seeded attendance records successfully!');

    // 4. Seed Student Fees
    await db.pool.query('DELETE FROM student_fees');
    for (let i = 0; i < Math.min(students.length, 10); i++) {
      const s = students[i];
      const totalAmount = 65000.00;
      const paid = i % 2 === 0 ? 65000.00 : 35000.00;
      const status = paid >= totalAmount ? 'PAID' : 'PARTIAL';
      await db.pool.query(`
        INSERT INTO student_fees 
        (student_id, hostel_id, fee_structure_id, academic_year, amount, paid_amount, due_date, status, created_at, updated_at)
        VALUES (?, ?, 1, '2026-2027', ?, ?, '2026-11-15', ?, NOW(), NOW())
      `, [s.id, s.hostel_id || 1, totalAmount, paid, status]);
    }
    console.log('Seeded student fees successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedMultiRoleData();
