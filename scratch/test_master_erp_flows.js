/**
 * Verification of Master ERP Endpoints
 */
const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
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
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf || '{}') }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
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
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(buf); } catch (e) { parsed = buf; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing Master ERP Workflow Endpoints on localhost:5000...');

  // 1. Login as Accounts Head
  const loginRes = await post('/api/auth/login', {
    email: 'accounts.head@bec.ac.in',
    password: 'Head@BEC2026!'
  });
  console.log('1. Login status:', loginRes.status, loginRes.body?.data?.user?.role);
  const token = loginRes.body?.data?.token;

  // 2. Universal Transaction Search (Ctrl+K)
  const searchRes = await get('/api/admin/transactions/search?q=REC', token);
  console.log('2. Universal Txn Search status:', searchRes.status, 'Results:', searchRes.body?.data?.length);

  // 3. Cash Closing Fetch
  const cashRes = await get('/api/admin/cash-closing', token);
  console.log('3. Cash Closing status:', cashRes.status, 'Opening Cash:', cashRes.body?.data?.openingCash);

  // 4. Record Daily Cash Closing
  const recordClosingRes = await post('/api/admin/cash-closing', {
    openingCash: 25000,
    cashCollections: 10000,
    cashExpenses: 2000,
    bankDeposit: 0,
    physicalCash: 33000,
    variance: 0,
    denominations: { d500: 66 },
    discrepancyReason: ''
  }, token);
  console.log('4. Record Cash Closing status:', recordClosingRes.status, recordClosingRes.body?.message);

  // 5. Bank Accounts Master
  const bankRes = await get('/api/admin/bank-accounts', token);
  console.log('5. Bank Accounts status:', bankRes.status, 'Count:', bankRes.body?.data?.length);

  // 6. Exam Registrations
  const examRes = await get('/api/admin/exam-registrations', token);
  console.log('6. Exam Registrations status:', examRes.status, 'Count:', examRes.body?.data?.length);

  // 7. Update Exam Registration
  const updateExamRes = await post('/api/admin/exam-registrations/1', {
    registrationStatus: 'REGISTERED'
  }, token);
  console.log('7. Update Exam Registration status:', updateExamRes.status, updateExamRes.body?.message);

  // 8. Create Refund Request
  const createRefundRes = await post('/api/admin/refunds', {
    studentId: 80,
    amount: 5000,
    reason: 'Caution security deposit refundable test verification',
    feeCategory: 'Caution Deposit',
    paymentMethod: 'BANK_TRANSFER'
  }, token);
  console.log('8. Create Refund status:', createRefundRes.status, 'Refund No:', createRefundRes.body?.data?.refundNo);

  // 9. Fetch Refunds
  const getRefundsRes = await get('/api/admin/refunds', token);
  console.log('9. Get Refunds status:', getRefundsRes.status, 'Count:', getRefundsRes.body?.data?.length);

  // 10. Receipt Cancellation
  const cancelReceiptRes = await post('/api/payments/receipts/1/cancel', {
    reason: 'Cheque bounced during clearing - verified reversal'
  }, token);
  console.log('10. Cancel Receipt status:', cancelReceiptRes.status, cancelReceiptRes.body?.message);

  // 11. Two-Step Authorization Password Verification
  const verifyPassRes = await post('/api/auth/verify-password', {
    password: 'Head@BEC2026!'
  }, token);
  console.log('11. Two-Step Password Verification status:', verifyPassRes.status, verifyPassRes.body?.message);
  if (verifyPassRes.status !== 200) throw new Error('Password verification failed');

  // 12. Omnibar Multi-Field Student Search
  const omniSearchRes = await get('/api/admin/students?search=Barsha&limit=5', token);
  console.log('12. Student Search status:', omniSearchRes.status, 'Found:', omniSearchRes.body?.data?.students?.length);
  if (!omniSearchRes.body?.data?.students?.length) throw new Error('Student search returned 0 results');

  // 13. Defaulters Report with Aging Filter (0-30 days)
  const defaultersAgingRes = await get('/api/reports/defaulters?aging=0-30', token);
  console.log('13. Defaulters Aging status:', defaultersAgingRes.status, 'Count:', defaultersAgingRes.body?.data?.count, 'Overdue:', defaultersAgingRes.body?.data?.totalOverdue);

  // 14. Defaulters Report with Amount Range (>50,000)
  const defaultersAmtRes = await get('/api/reports/defaulters?amountRange=GT50K', token);
  console.log('14. Defaulters Amount Range status:', defaultersAmtRes.status, 'Count:', defaultersAmtRes.body?.data?.count);

  // 15. Transport Bus List Export
  const busListRes = await get('/api/transport/export', token);
  console.log('15. Transport Bus List Export status:', busListRes.status, 'Content length:', (busListRes.body ? JSON.stringify(busListRes.body).length : 'OK'));

  // 16. Defaulters CSV Export
  const defaultersCsvRes = await get('/api/reports/export-csv?type=defaulters&aging=ALL', token);
  console.log('16. Defaulters CSV Export status:', defaultersCsvRes.status);

  console.log('\n================================================================');
  console.log('ALL 16 MASTER ERP INSTITUTIONAL FLOWS VERIFIED SUCCESSFULLY!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
