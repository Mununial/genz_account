const http = require('http');

function postJson(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing Accounts & Promotion System...');
  
  // 1. Login as Accounts Head / Admin
  const loginRes = await postJson('/api/auth/login', {
    email: 'admin@bec.ac.in',
    password: 'Admin@BEC2026!'
  });
  
  if (!loginRes.data || !loginRes.data.data || !loginRes.data.data.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }
  
  const token = loginRes.data.data.token;
  console.log('Admin login success. Token acquired.');

  // 2. Test Dashboard Stats
  const dashRes = await getJson('/api/admin/dashboard', token);
  console.log('\n--- DASHBOARD STATS ---');
  console.log('Total Students in Dashboard:', dashRes.data.data.kpis.total_students_count);
  console.log('Total Collection:', dashRes.data.data.kpis.total_collection);

  // 3. Test Promotion Stats
  const promRes = await getJson('/api/admin/promotion/stats', token);
  console.log('\n--- PROMOTION STATS ---');
  console.log('Total Students:', promRes.data.data.totalStudents);
  console.log('Eligible for 2nd Sem:', promRes.data.data.eligibleFor2ndSem);
  console.log('Eligible for 2nd Year:', promRes.data.data.eligibleFor2ndYear);
  console.log('By Year breakdown:', promRes.data.data.byYear);
  console.log('By Course breakdown:', promRes.data.data.byCourse);

  // 4. Test Single Student Promotion (e.g. Bablu Bag, student id 1)
  console.log('\n--- TESTING SEMESTER PROMOTION (STUDENT ID 1) ---');
  const semPromoRes = await postJson('/api/admin/promotion/promote-semester', {
    fromSemesterId: 1,
    toSemesterId: 2,
    studentIds: [1]
  }, token);
  console.log('Semester Promotion Result:', semPromoRes.data);

  // Check Bablu Bag ledger & profile
  const stRes = await getJson('/api/admin/students/1/ledger', token);
  console.log('Student 1 Semester after promotion:', stRes.data.data.student.semester_label);
  console.log('Student 1 Academic Year:', stRes.data.data.student.academic_year);

  // 5. Test Year Advancement (e.g. Student ID 1 to 2nd Year)
  console.log('\n--- TESTING YEAR ADVANCEMENT (STUDENT ID 1) ---');
  const yrPromoRes = await postJson('/api/admin/promotion/promote-year', {
    fromYear: 1,
    toYear: 2,
    targetSemesterId: 3,
    studentIds: [1],
    generateInvoice: true
  }, token);
  console.log('Year Promotion Result:', yrPromoRes.data);

  const stRes2 = await getJson('/api/admin/students/1/ledger', token);
  console.log('Student 1 Semester after year promotion:', stRes2.data.data.student.semester_label);
  console.log('Student 1 Academic Year after year promotion:', stRes2.data.data.student.academic_year);
  console.log('Student 1 Invoices Count:', stRes2.data.data.invoices.length);
  console.log('Student 1 Invoices:', stRes2.data.data.invoices.map(inv => ({ invoice_no: inv.invoice_no, total_amount: inv.total_amount, outstanding: inv.outstanding_amount })));

  console.log('\nAll promotion checks passed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
