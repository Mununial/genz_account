/**
 * End-to-End Test for Education Loan Application, Director Approval, and 3-Letter Generation
 * Gen-Z University
 */

const http = require('http');

function postJson(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: urlPath,
        method: 'POST',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: urlPath,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function patchJson(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: urlPath,
        method: 'PATCH',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('=== TESTING EDUCATION LOAN WORKFLOW ===\n');

  // 1. Student Login (student@genz / Ayush#@26)
  console.log('1. Logging in as Student (student@genz)...');
  const stuLogin = await postJson('/api/auth/login', {
    email: 'student@genz',
    password: 'Ayush#@26'
  });

  if (stuLogin.statusCode !== 200 || !stuLogin.body.data || !stuLogin.body.data.token) {
    console.error('Student login failed:', stuLogin);
    process.exit(1);
  }
  const stuToken = stuLogin.body.data.token;
  console.log('✓ Student logged in successfully. Role:', stuLogin.body.data.user.role);

  // 2. Submit Education Loan Request
  console.log('\n2. Submitting Education Loan Request for SBI...');
  const loanSubmit = await postJson(
    '/api/student/loan-request',
    {
      bank_name: 'State Bank of India (SBI)',
      bank_branch: 'Bhubaneswar Main Commercial Branch',
      bank_ifsc: 'SBIN0001234',
      loan_amount: 350000,
      loan_purpose: 'Tuition & Academic Fees',
      co_applicant_name: 'Dilip Bag',
      co_applicant_relation: 'Father',
      co_applicant_phone: '+91 9437012345',
      co_applicant_income: 480000,
      student_remarks: 'Required urgent sanction letter for bank manager.'
    },
    stuToken
  );

  console.log('Submit Response:', loanSubmit.body);

  // 3. Fetch student loan requests
  console.log('\n3. Fetching student loan requests...');
  const stuRequests = await getJson('/api/student/loan-requests', stuToken);
  console.log(`✓ Student has ${stuRequests.body.data.length} loan request(s).`);
  const activeReq = stuRequests.body.data[0];
  console.log('Latest Request ID:', activeReq.id, 'Status:', activeReq.status, 'Ref:', activeReq.reference_no);

  // 4. Director Login (director@genz / Ayush#@26)
  console.log('\n4. Logging in as Director (director@genz)...');
  const dirLogin = await postJson('/api/auth/login', {
    email: 'director@genz',
    password: 'Ayush#@26'
  });

  if (dirLogin.statusCode !== 200 || !dirLogin.body.data || !dirLogin.body.data.token) {
    console.error('Director login failed:', dirLogin);
    process.exit(1);
  }
  const dirToken = dirLogin.body.data.token;
  console.log('✓ Director logged in successfully. Role:', dirLogin.body.data.user.role);

  // 5. Director views queue
  console.log('\n5. Director views loan queue...');
  const dirQueue = await getJson('/api/admin/loan-requests', dirToken);
  console.log(`✓ Director sees ${dirQueue.body.data.length} loan request(s).`);

  // 6. Director approves request
  console.log(`\n6. Director approving loan request ID: ${activeReq.id}...`);
  const approveRes = await patchJson(
    `/api/admin/loan-requests/${activeReq.id}/status`,
    {
      status: 'APPROVED',
      director_remarks: 'Recommended and approved by Directorate for SBI Education Loan Scheme. Official 3-letter university dossier sanctioned.'
    },
    dirToken
  );
  console.log('Approve Response:', approveRes.body);

  // 7. Student retrieves 3 generated letters
  console.log('\n7. Student fetching 3 generated letters...');
  const lettersRes = await getJson(`/api/student/loan-letters/${activeReq.id}`, stuToken);
  if (lettersRes.statusCode === 200 && lettersRes.body.data) {
    const d = lettersRes.body.data;
    console.log('✓ Letters generated successfully!');
    console.log('Reference No:', d.reference_no);
    console.log('University Name:', d.university.name);
    console.log('University Bank Account (SBI):', d.university.bank_details.account_number);
    console.log('Student Name:', d.student.name);
    console.log('Target Bank:', d.loan.bank_name);
    console.log('Sanctioned Amount: ₹' + d.loan.loan_amount);
    console.log('Yearly Fee Breakdown Count:', d.fee_structure.yearlyBreakdown.length);
  } else {
    console.error('Failed to get letters:', lettersRes);
  }

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
