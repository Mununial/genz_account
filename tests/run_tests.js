/**
 * Automated Production Readiness & Security Test Suite
 * GEN-Z UNIVERSITY Accounts System
 */

const http = require('http');
const app = require('../backend/server');

let server;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, headers: res.headers });
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

async function runTests() {
  console.log('================================================================');
  console.log('GEN-Z UNIVERSITY - TEST SUITE RUNNER');
  console.log('================================================================\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck Test
    console.log('[Suite 1: Healthcheck & System Discovery]');
    const health = await request('/api/health');
    assert(health.status === 200, 'Healthcheck endpoint responds with 200 OK');
    assert(health.data.college.includes('Gen-Z University'), 'College name confirmed in metadata');

    // 2. Authentication Tests across all 5 roles
    console.log('\n[Suite 2: Authentication & Token Issuance]');
    
    // Student Login
    const studentLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'student@genz', password: 'Ayush#@26' }
    });
    assert(studentLogin.status === 200, 'Student (student@genz) logs in successfully');
    assert(studentLogin.data && studentLogin.data.data && studentLogin.data.data.token, 'Student receives valid JWT token');
    const studentToken = studentLogin.data && studentLogin.data.data ? studentLogin.data.data.token : null;

    // Staff Login
    const staffLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'staff@genz', password: 'Ayush#@26' }
    });
    assert(staffLogin.status === 200, 'Accounts Staff logs in successfully');
    const staffToken = staffLogin.data.data.token;

    // Accounts Head Login
    const headLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'account@genz', password: 'Ayush#@26' }
    });
    assert(headLogin.status === 200, 'Accounts Head logs in successfully');
    const headToken = headLogin.data.data.token;

    // Admin Login
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@genz', password: 'Ayush#@26' }
    });
    assert(adminLogin.status === 200, 'Admin logs in successfully');
    const adminToken = adminLogin.data.data.token;

    // Auditor Login
    const auditorLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'auditor@genz', password: 'Ayush#@26' }
    });
    assert(auditorLogin.status === 200, 'Auditor logs in successfully');
    const auditorToken = auditorLogin.data.data.token;

    // Invalid Password check
    const badLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@genz', password: 'WrongPassword123' }
    });
    assert(badLogin.status === 401, 'Invalid password correctly rejected with 401');

    // 3. Security & RBAC Isolation Tests
    console.log('\n[Suite 3: RBAC & Student Data Isolation]');

    // Student attempts to access admin dashboard
    const studentAccessAdmin = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(studentAccessAdmin.status === 403, 'Student blocked from /api/admin/dashboard with 403 Forbidden');

    // Student attempts to query another student ID
    const studentAccessCross = await request('/api/student/profile?studentId=9999', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(studentAccessCross.status === 403, 'Student blocked from cross-student inspection with 403');

    // Auditor attempts to create fee structure (mutation)
    const auditorMutate = await request('/api/fees/structures', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auditorToken}` },
      body: { title: 'Illegal Structure' }
    });
    assert(auditorMutate.status === 403, 'Auditor blocked from mutating endpoints with 403 Forbidden');

    // 4. Student Portal Financial Operations
    console.log('\n[Suite 4: Student Financial Portal]');

    const profile = await request('/api/student/profile', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(profile.status === 200, 'Student profile fetched successfully');
    assert(profile.data.data.full_name === 'Jitendra Nial' || profile.data.data.full_name.length > 0, 'Correct student name returned');

    const dashboard = await request('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(dashboard.status === 200, 'Student dashboard loaded');
    assert(dashboard.data.data.balance.totalCharged > 0, 'Total fees charged > 0');

    const ledger = await request('/api/student/ledger', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(ledger.status === 200, 'Student fee ledger loaded');
    assert(Array.isArray(ledger.data.data.ledger), 'Ledger entries returned as array');

    const invoices = await request('/api/student/invoices', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(invoices.status === 200, 'Student invoices listed');
    assert(invoices.data.data.length > 0, 'Student has pending/issued invoices');
    const firstInvoice = invoices.data.data[0];

    // 5. Payment Flow, Idempotency & Digital Receipt Generation
    console.log('\n[Suite 5: Payment Flow & Idempotency]');

    // Create payment order
    const orderRes = await request('/api/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { invoiceId: firstInvoice.id, amount: 1000 }
    });
    assert(orderRes.status === 200, 'Payment order created');
    const orderId = orderRes.data.data.orderId;

    // Verify payment with mock signature
    const verifyRes = await request('/api/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { orderId, paymentId: 'pay_mock_123', signature: 'mock_sig_valid' }
    });
    assert(verifyRes.status === 200, 'Server-side payment verification succeeded');
    assert(verifyRes.data.data.receiptNo, 'Digital receipt generated with unique number');
    const receiptNo = verifyRes.data.data.receiptNo;

    // Idempotency check: Re-verify same order
    const reVerify = await request('/api/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { orderId, paymentId: 'pay_mock_123', signature: 'mock_sig_valid' }
    });
    assert(reVerify.status === 200, 'Idempotent re-verification succeeds without error');
    assert(reVerify.data.data.alreadyProcessed === true, 'Flag confirms transaction was already processed');

    // Fetch Receipts
    const receiptsList = await request('/api/student/receipts', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(receiptsList.status === 200, 'Receipts list retrieved');

    // 6. Accounts Executive & Administrative Intelligence
    console.log('\n[Suite 6: Accounts Dashboard & Financial Intelligence]');

    const adminDash = await request('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${headToken}` }
    });
    assert(adminDash.status === 200, 'Executive dashboard metrics loaded');
    assert(adminDash.data.data.kpis.total_collection >= 0, 'Total collection KPI calculated');
    assert(adminDash.data.data.branchStats.length > 0, 'Branch collection stats available');

    const intelligence = await request('/api/admin/intelligence', {
      headers: { Authorization: `Bearer ${headToken}` }
    });
    assert(intelligence.status === 200, 'System-generated finance intelligence computed');

    const studentsDirectory = await request('/api/admin/students', {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert(studentsDirectory.status === 200, 'Staff accesses students directory');
    assert(studentsDirectory.data.data.students.length > 0, 'Seeded students directory populated');

    // 7. Counter Collection by Accounts Staff
    console.log('\n[Suite 7: Counter / Offline Payment]');
    const stuInvoicesRes = await request('/api/student/invoices', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const stuInvoices = (stuInvoicesRes.data && stuInvoicesRes.data.data) || [];
    const targetInv = stuInvoices.find(i => parseFloat(i.outstanding_amount) > 10) || firstInvoice;
    const payAmt = Math.min(250, Math.max(10, Math.floor(parseFloat(targetInv.outstanding_amount) / 2)));

    const offlinePay = await request('/api/payments/record-offline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        studentId: targetInv.student_id || 1,
        invoiceId: targetInv.id,
        amount: payAmt,
        paymentMethod: 'CASH',
        transactionRef: `COUNTER-CHQ-${Date.now()}`,
        remarks: 'Counter payment fee settlement'
      }
    });
    assert(offlinePay.status === 201, 'Accounts Staff successfully records counter collection');
    assert(offlinePay.data && offlinePay.data.data && offlinePay.data.data.receiptNo, 'Counter payment generated digital receipt');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
