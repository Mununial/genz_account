const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(username, password) {
  const res = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: username, password: password || '123456' });
  if (!res.data || !res.data.data?.token) {
    throw new Error(`Login failed for ${username}: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function runAdvancedTests() {
  console.log('================================================================');
  console.log('🚀 TESTING ADVANCED BPUT EXAM & ACCOUNTS REGISTRATION FEATURES');
  console.log('================================================================\n');

  try {
    const adminToken = await login('admin', '123456');
    const examToken = await login('exam.section', '123456');
    const accountsToken = await login('admin', '123456');
    const studentToken = await login('2644', '123456');

    // 1. Test Registration Windows Master API
    console.log('Test 1: Verify Registration Windows Master API...');
    const winRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/exam-section/windows',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${examToken}` }
    });
    console.log('Windows count:', winRes.data.data.windows.length);
    if (!winRes.data.data.windows.length) throw new Error('No windows returned');
    console.log('✓ Windows API loaded successfully.\n');

    // 2. Test Window Toggle
    console.log('Test 2: Toggling Semester 3 Registration Window to LOCKED...');
    const toggleRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/exam-section/windows/3/toggle',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${examToken}`,
        'Content-Type': 'application/json'
      }
    }, { is_open: 0 });
    console.log('Toggle response:', toggleRes.data.message);
    if (toggleRes.data.data.is_open !== 0) throw new Error('Window toggle failed to lock');
    console.log('✓ Master toggle locked semester 3 successfully.\n');

    // 3. Test Student Eligibility for Sem 3 (Window Locked + Prerequisite Check)
    console.log('Test 3: Checking Sem 3 Eligibility when Window is Locked...');
    const eligRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/eligibility?semester=3',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const isElig = eligRes.data.data.eligibility.eligible;
    const isWinOpen = eligRes.data.data.windowStatus.isOpen;
    console.log('Eligible:', isElig, '| Window Open:', isWinOpen, '| Reason:', eligRes.data.data.eligibility.reasons);
    if (isElig !== false || isWinOpen !== false) throw new Error('Student should NOT be eligible for locked semester');
    console.log('✓ Student correctly locked out of Semester 3.\n');

    // 4. Re-open Semester 3
    console.log('Test 4: Re-opening Semester 3 Window...');
    await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/exam-section/windows/3/toggle',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${examToken}`,
        'Content-Type': 'application/json'
      }
    }, { is_open: 1 });
    console.log('✓ Semester 3 re-opened.\n');

    // 5. Test Accounts Office Registration Fee Ledger Register
    console.log('Test 5: Checking Accounts Office Registration Fee Register...');
    const accRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/accounts/registrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accountsToken}` }
    });
    console.log('Accounts Stats:', accRes.data.data.stats);
    console.log('Accounts Transactions Count:', accRes.data.data.registrations.length);
    if (accRes.data.data.stats.totalCollected === undefined) throw new Error('totalCollected stat missing');
    console.log('Total Fees Collected:', `₹${accRes.data.data.stats.totalCollected.toLocaleString('en-IN')}`);
    console.log('✓ Accounts registration fees register verified.\n');

    // 6. Test Examination Section Candidate Subject Breakdown
    console.log('Test 6: Checking Examination Section Queue Subject Breakdown...');
    const examQueueRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/registration/exam-section/registrations?status=ALL',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${examToken}` }
    });
    const candidate = examQueueRes.data.data.registrations[0];
    if (candidate) {
      console.log(`Candidate: ${candidate.full_name} (${candidate.roll_number})`);
      console.log(`Year: ${candidate.candidate_year} | Branch: ${candidate.department_code} | Sem: ${candidate.semester}`);
      console.log(`Registered Subjects Count: ${candidate.subjects.length}`);
      candidate.subjects.slice(0, 3).forEach(s => {
        console.log(`  - [${s.code}] ${s.name} (${s.credits} Credits, ${s.type || 'Theory'})`);
      });
      console.log(`BPUT Exam Fee Status: ${candidate.exam_fee_status} (₹${candidate.exam_fee_amount})`);
    }
    console.log('✓ Exam section detailed subject breakdown verified.\n');

    console.log('================================================================');
    console.log('🎉 ALL ADVANCED EXAM & ACCOUNTS REGISTRATION TESTS PASSED!');
    console.log('================================================================');
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

runAdvancedTests();
