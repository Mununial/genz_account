const jwt = require('../backend/node_modules/jsonwebtoken');

async function testSync() {
  const staffLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'accounts.staff@bec.ac.in', password: '123456' })
  }).then(r => r.json());
  const staffToken = staffLogin.data?.token;

  const studentLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tushar.mhato@bec.ac.in', password: '123456' })
  }).then(r => r.json());
  const studentToken = studentLogin.data?.token;

  console.log('1. Student initiating payment order...');
  const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ amount: 15000, paymentMethod: 'Online UPI / QR' })
  }).then(r => r.json());
  console.log('Order created:', orderRes);

  if (!orderRes.success) {
    console.error('Failed to create order');
    return;
  }

  const { orderId } = orderRes.data;
  console.log('2. Student verifying payment...');
  const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      orderId,
      paymentId: `PAY-GW-${Date.now()}`,
      signature: 'mock_sig_valid',
      paymentMethod: 'Online UPI / QR'
    })
  }).then(r => r.json());
  console.log('Payment verified:', verifyRes);

  console.log('3. Staff fetching Collections Report (/api/reports/collections)...');
  const collRes = await fetch('http://localhost:5000/api/reports/collections', {
    headers: { Authorization: `Bearer ${staffToken}` }
  }).then(r => r.json());
  console.log('Collections count:', collRes.data?.count, 'Collections items:', collRes.data?.collections);

  console.log('4. Staff fetching Student Ledger (/api/admin/students/1644/ledger)...');
  const ledgerRes = await fetch('http://localhost:5000/api/admin/students/1644/ledger', {
    headers: { Authorization: `Bearer ${staffToken}` }
  }).then(r => r.json());
  console.log('Student payments in ledger count:', ledgerRes.data?.payments?.length);
  console.log('Student payments:', ledgerRes.data?.payments);

  console.log('5. Staff fetching Dashboard (/api/admin/dashboard)...');
  const dashRes = await fetch('http://localhost:5000/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${staffToken}` }
  }).then(r => r.json());
  console.log('Dashboard recent transactions count:', dashRes.data?.recentTransactions?.length);
  console.log('Recent transactions:', dashRes.data?.recentTransactions);
}

testSync().catch(console.error);
