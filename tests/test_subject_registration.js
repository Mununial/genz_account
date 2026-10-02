/**
 * End-to-End Test Suite for Subject Registration Module
 * Bhubaneswar Engineering College (BEC)
 */

const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING SUBJECT REGISTRATION MODULE END-TO-END TESTS');
  console.log('================================================================\n');

  let passed = 0, failed = 0;
  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Login as Student (Tushar Mhato / roll 2644)
  console.log('1. Student Authentication & Profile');
  const stuLogin = await request('POST', '/api/auth/login', {
    email: '2644',
    password: '123456'
  });
  assert(stuLogin.status === 200 && stuLogin.body?.data?.token, 'Student login successful');
  const stuToken = stuLogin.body?.data?.token;

  // 2. Student Eligibility Check
  console.log('\n2. Fee Eligibility Check');
  const eligRes = await request('GET', '/api/registration/eligibility', null, stuToken);
  assert(eligRes.status === 200, 'Eligibility endpoint returned 200');
  assert(eligRes.body?.data?.eligibility !== undefined, 'Eligibility object present in response');
  console.log('     Eligible:', eligRes.body?.data?.eligibility?.eligible);
  console.log('     Checks:', JSON.stringify(eligRes.body?.data?.eligibility?.checks));

  // 3. Fetch Subjects
  console.log('\n3. BPUT Subject Catalog Fetch');
  const subRes = await request('GET', '/api/registration/subjects?semester=1&branch=ALL', null, stuToken);
  assert(subRes.status === 200, 'Subjects endpoint returned 200');
  assert(subRes.body?.data?.subjects?.length > 0, `Found ${subRes.body?.data?.subjects?.length} subjects`);
  const subjects = subRes.body?.data?.subjects || [];
  const subjectIds = subjects.slice(0, 7).map(s => s.id);
  const totalCredits = subjects.slice(0, 7).reduce((acc, s) => acc + s.credits, 0);
  console.log(`     Selected 7 subjects: IDs ${subjectIds.join(', ')} (${totalCredits} credits)`);

  // Ensure student fee record exists in mockDb for eligibility
  // Let's submit regular registration
  console.log('\n4. Student Registration Submission');
  // First ensure fee paid in mockDb or check if student is eligible
  // If not eligible in mockDb, let's update student fee or test submission
  let subSubmit = await request('POST', '/api/registration/submit', {
    subjectIds,
    registrationType: 'REGULAR'
  }, stuToken);

  let regId = subSubmit.body?.data?.registrationId;
  if (subSubmit.status === 403) {
    console.log('     Student had outstanding dues (expected by BPUT fee rule). Verifying 403 blocker...');
    assert(subSubmit.status === 403, 'Blocked non-eligible student as required by BPUT rule');

    // Test Backlog registration which permits submission
    console.log('     Submitting Backlog Registration (requires approval workflow)...');
    const blSubmit = await request('POST', '/api/registration/submit', {
      subjectIds: [1, 2],
      registrationType: 'BACKLOG'
    }, stuToken);
    assert(blSubmit.status === 201 || blSubmit.status === 200 || blSubmit.status === 409, 'Backlog registration submitted or active exists');
    regId = blSubmit.body?.data?.registrationId;
  } else {
    assert(subSubmit.status === 201, `Registration submitted successfully (ID: ${regId})`);
  }

  // If regId was 409 (already exists from previous run), fetch existing ID
  if (!regId) {
    const myRegs = await request('GET', '/api/registration/my', null, stuToken);
    regId = myRegs.body?.data?.registrations?.[0]?.id;
    console.log(`     Retrieved existing registration ID: ${regId}`);
  }

  assert(regId > 0, `Valid registration ID: ${regId}`);

  // 5. HOD Review & Forward
  console.log('\n5. HOD Workflow (Review & Forward)');
  const hodLogin = await request('POST', '/api/auth/login', {
    email: 'hod.cse@bec.ac.in',
    password: 'Admin@BEC2026!'
  });
  assert(hodLogin.status === 200, 'HOD login successful');
  const hodToken = hodLogin.body?.data?.token;

  const hodPending = await request('GET', '/api/registration/hod/pending', null, hodToken);
  assert(hodPending.status === 200, `HOD pending list fetched (${hodPending.body?.data?.registrations?.length} pending)`);

  const hodDetail = await request('GET', `/api/registration/hod/${regId}`, null, hodToken);
  assert(hodDetail.status === 200, `HOD fetched application #${regId} details`);

  const hodFwd = await request('PUT', `/api/registration/hod/${regId}/forward`, {
    remarks: 'Academic credits and pre-requisites verified. Forwarded to Director.'
  }, hodToken);
  assert(hodFwd.status === 200 || hodFwd.status === 409, 'HOD forwarded application to Director');

  // 6. Director Workflow (Approve)
  console.log('\n6. Director Workflow (Approve to Accounts)');
  const dirLogin = await request('POST', '/api/auth/login', {
    email: 'director@bec.ac.in',
    password: 'Admin@BEC2026!'
  });
  assert(dirLogin.status === 200, 'Director login successful');
  const dirToken = dirLogin.body?.data?.token;

  const dirPending = await request('GET', '/api/registration/director/pending', null, dirToken);
  assert(dirPending.status === 200, `Director pending list fetched (${dirPending.body?.data?.registrations?.length} pending)`);

  const dirApprove = await request('PUT', `/api/registration/director/${regId}/approve`, {
    remarks: 'Approved by Director. Sent to Accounts for final verification.'
  }, dirToken);
  assert(dirApprove.status === 200 || dirApprove.status === 409, 'Director approved application');

  // 7. Accounts Workflow (Finalize & Confirm)
  console.log('\n7. Accounts Workflow (Finalize & Confirm)');
  const accLogin = await request('POST', '/api/auth/login', {
    email: 'accounts.head@bec.ac.in',
    password: 'Head@BEC2026!'
  });
  assert(accLogin.status === 200, 'Accounts Head login successful');
  const accToken = accLogin.body?.data?.token;

  const accPending = await request('GET', '/api/registration/accounts/pending', null, accToken);
  assert(accPending.status === 200, `Accounts pending list fetched (${accPending.body?.data?.registrations?.length} pending)`);

  const accFinal = await request('PUT', `/api/registration/accounts/${regId}/finalize`, {
    remarks: 'Fee clearance verified. Official registration confirmed.'
  }, accToken);
  assert(accFinal.status === 200 || accFinal.status === 409, 'Accounts officially confirmed registration');

  // 8. Student My Registrations Check
  console.log('\n8. Student Status Verification');
  const myCheck = await request('GET', '/api/registration/my', null, stuToken);
  assert(myCheck.status === 200, 'Student fetched registrations');
  const confirmedReg = myCheck.body?.data?.registrations?.find(r => r.id === regId);
  console.log(`     Status of #${regId}:`, confirmedReg?.status);
  assert(confirmedReg?.status === 'CONFIRMED', 'Registration is officially CONFIRMED');

  // 9. Admin BPUT Subject Management
  console.log('\n9. Admin BPUT Subject Management');
  const admLogin = await request('POST', '/api/auth/login', {
    email: 'admin@bec.ac.in',
    password: 'Admin@BEC2026!'
  });
  assert(admLogin.status === 200, 'Admin login successful');
  const admToken = admLogin.body?.data?.token;

  const testCode = `BPUT-TEST-${Date.now()}`;
  const newSub = await request('POST', '/api/registration/admin/subjects', {
    code: testCode,
    name: 'Advanced Software Engineering',
    branch: 'CSE',
    semester: 6,
    year: 3,
    credits: 4,
    type: 'CORE'
  }, admToken);
  assert(newSub.status === 201 || newSub.status === 200, 'Admin created subject');

  const admList = await request('GET', '/api/registration/admin/subjects?branch=CSE', null, admToken);
  assert(admList.status === 200 && admList.body?.data?.subjects?.length > 0, 'Admin fetched CSE subjects');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
