const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedTestCurfewPasses() {
  const [existing] = await db.pool.query("SELECT id FROM gate_passes WHERE pass_number LIKE 'GP-DEMO-%'");
  if (existing.length > 0) {
    console.log('Curfew demo passes already present (' + existing.length + ').');
    process.exit(0);
  }

  const now = new Date();
  
  // Student 1: Nandita Mistry (GENZ Girls Hostel Block-B) - Overdue by 40 min
  const exp1 = new Date(now.getTime() - 40 * 60000);
  const out1 = new Date(now.getTime() - 160 * 60000);
  
  // Student 2: Swagatika Behera (GENZ Girls Hostel Block-B) - Overdue by 75 min (Escalated)
  const exp2 = new Date(now.getTime() - 75 * 60000);
  const out2 = new Date(now.getTime() - 200 * 60000);

  // Student 3: Om Prakash Sha (GENZ Boys Hostel Block-A) - Overdue by 15 min
  const exp3 = new Date(now.getTime() - 15 * 60000);
  const out3 = new Date(now.getTime() - 120 * 60000);

  const passes = [
    ['GP-DEMO-001', '2mrsG0R7XVP7SoeTNgIfLjYPtKk1', 2, 'LOCAL_OUTING', out1, exp1, out1, 'Market & Book Purchase', 'Bhubaneswar Central Market', '8018568429', 'CHECKED_OUT'],
    ['GP-DEMO-002', '3x9pisMWMuN9rBzHXsTmZ8NHoG83', 2, 'LOCAL_OUTING', out2, exp2, out2, 'Doctor Consultation', 'Apollo Clinic, Bhubaneswar', '9078608834', 'CHECKED_OUT'],
    ['GP-DEMO-003', '2QFRjfIFOTYKqKOY8qR2J1uKTMs2', 1, 'LOCAL_OUTING', out3, exp3, out3, 'Project Group Discussion', 'Khandagiri Tech Park', '8658430483', 'CHECKED_OUT']
  ];

  for (const p of passes) {
    await db.pool.query(`
      INSERT INTO gate_passes 
      (pass_number, student_id, hostel_id, pass_type, out_date_time, expected_in_date_time, actual_out_time, reason, destination, parent_phone, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, p);
  }

  console.log('Seeded 3 real gate passes with curfew overdue timestamps successfully!');
  process.exit(0);
}

seedTestCurfewPasses().catch(e => {
  console.error(e);
  process.exit(1);
});
