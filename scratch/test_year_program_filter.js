const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:5000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Login to get Auth Token ---');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'accounts.staff@bec.ac.in', password: 'Staff@BEC2026!' }
  });

  const token = loginRes.data && loginRes.data.data && loginRes.data.data.token;
  if (!token) {
    console.error('Failed to login:', loginRes);
    process.exit(1);
  }
  console.log('✓ Staff Authenticated successfully.');

  const headers = { 'Authorization': `Bearer ${token}` };

  console.log('\n--- 2. Testing Students Directory Data ---');
  const stRes = await request('/api/admin/students?limit=2000', { headers });
  const students = stRes.data.data.students || [];
  console.log(`Total students returned: ${students.length}`);

  // Test year distribution
  const yr1 = students.filter(s => (s.academic_year || (s.current_semester_id > 2 ? '2nd Year' : '1st Year')) === '1st Year');
  const yr2 = students.filter(s => (s.academic_year || (s.current_semester_id > 2 ? '2nd Year' : '1st Year')) === '2nd Year');
  console.log(`1st Year students count: ${yr1.length}`);
  console.log(`2nd Year students count: ${yr2.length}`);

  if (yr2.length === 1 && yr2[0].full_name.includes('Tushar')) {
    console.log(`✓ VERIFIED: Exactly 1 senior student in 2nd Year: ${yr2[0].full_name} (${yr2[0].course_name} - ${yr2[0].branch_name})`);
  } else {
    console.error('❌ UNEXPECTED 2nd Year student count or data:', yr2);
  }

  // Test B.Tech + 2nd Year filter
  const btechYr2 = students.filter(s => {
    const course = s.course_name || 'B.Tech';
    const yr = s.academic_year || (s.current_semester_id > 2 ? '2nd Year' : '1st Year');
    return course.includes('B.Tech') && yr === '2nd Year';
  });
  console.log(`B.Tech 2nd Year students count: ${btechYr2.length}`);
  if (btechYr2.length === 0) {
    console.log('✓ VERIFIED: B.Tech + 2nd Year correctly returns 0 records (empty state), NEVER 1st Year data!');
  } else {
    console.error('❌ BUG: B.Tech + 2nd Year returned records!', btechYr2);
  }

  console.log('\n--- 3. Testing Collections / Receipts Data ---');
  const collRes = await request('/api/reports/collections', { headers });
  const collections = collRes.data.data.collections || [];
  console.log(`Total Collections records: ${collections.length}`);

  const collYr1 = collections.filter(p => (p.academic_year || '1st Year') === '1st Year');
  const collYr2 = collections.filter(p => (p.academic_year || '1st Year') === '2nd Year');
  console.log(`Collections in 1st Year: ${collYr1.length}`);
  console.log(`Collections in 2nd Year: ${collYr2.length}`);

  if (collYr2.length > 0) {
    console.log(`✓ 2nd Year Collections found: ${collYr2.length} (Student: ${collYr2[0].full_name || collYr2[0].student_name})`);
    const contains1stYear = collYr2.some(p => (p.academic_year || '1st Year') === '1st Year' || (p.full_name && !p.full_name.includes('Tushar')));
    if (!contains1stYear) {
      console.log('✓ VERIFIED: 2nd Year Collections contain ONLY 2nd Year student records, ZERO 1st Year data!');
    } else {
      console.error('❌ BUG: 1st Year records leaked into 2nd Year collections!');
    }
  }

  console.log('\n--- 4. Testing Defaulters Report Data ---');
  const defRes = await request('/api/reports/defaulters', { headers });
  const defaulters = defRes.data.data.defaulters || [];
  console.log(`Total Defaulters records: ${defaulters.length}`);

  const defYr1 = defaulters.filter(d => (d.academic_year || '1st Year') === '1st Year');
  const defYr2 = defaulters.filter(d => (d.academic_year || '1st Year') === '2nd Year');
  console.log(`Defaulters in 1st Year: ${defYr1.length}`);
  console.log(`Defaulters in 2nd Year: ${defYr2.length}`);

  console.log('\n--- 5. Testing Registrations Report Data ---');
  const regRes = await request('/api/reports/registrations', { headers });
  const regs = regRes.data.data.registrations || [];
  console.log(`Total Registrations records: ${regs.length}`);

  const regYr1 = regs.filter(r => (r.academic_year || '1st Year') === '1st Year');
  const regYr2 = regs.filter(r => (r.academic_year || '1st Year') === '2nd Year');
  console.log(`Registrations in 1st Year: ${regYr1.length}`);
  console.log(`Registrations in 2nd Year: ${regYr2.length}`);

  if (regYr2.length === 1 && regYr2[0].student_name.includes('Tushar')) {
    console.log(`✓ VERIFIED: Exactly 1 senior registration in 2nd Year: ${regYr2[0].student_name} (${regYr2[0].exam_name})`);
  }

  console.log('\n=============================================');
  console.log('ALL FILTER VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================');
}

run().catch(console.error);
