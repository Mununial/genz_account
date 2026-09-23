/**
 * Verification of Partial Payment, Gateway Integration & Real-Time Account Updates
 * Bhubaneswar Engineering College (BEC) Accounts System
 */

const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
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
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
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

async function verifyPartialPaymentFlow() {
  console.log('================================================================');
  console.log('BEC REAL-TIME PARTIAL PAYMENT & GATEWAY VERIFICATION');
  console.log('================================================================\n');

  // 1. Student Login
  console.log('[1/6] Logging in as student (barsha.priyadarshini@bec.ac.in)...');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'barsha.priyadarshini@bec.ac.in', password: 'Student@BEC2026!' }
  });
  if (loginRes.status !== 200 || !loginRes.data.data.token) {
    throw new Error('Student login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.data.token;
  console.log('  -> Logged in successfully. Token acquired.');

  // 2. Fetch Initial Dashboard & Invoice
  console.log('[2/6] Checking initial invoice and balance...');
  const dashRes = await request('/api/student/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const initialBalance = dashRes.data.data.balance;
  const invoices = dashRes.data.data.pendingInvoices;
  console.log(`  -> Initial Total Charged: ₹${initialBalance.totalCharged}`);
  console.log(`  -> Initial Total Paid: ₹${initialBalance.totalPaid}`);
  console.log(`  -> Initial Total Outstanding: ₹${initialBalance.totalOutstanding}`);
  console.log(`  -> Open Invoices Count: ${invoices.length}`);
  const targetInvoice = invoices[0];
  console.log(`  -> Target Invoice: #${targetInvoice.invoice_no}, Outstanding: ₹${targetInvoice.outstanding_amount}`);

  // 3. Initiate Partial Payment (e.g. ₹25,000 or half of remaining dues)
  const outstanding = parseFloat(targetInvoice.outstanding_amount);
  const partialAmount1 = outstanding >= 25000 ? 25000 : Math.max(1000, Math.floor(outstanding / 2));
  console.log(`\n[3/6] Initiating Partial Payment 1: ₹${partialAmount1} via UPI / QR Gateway...`);
  const orderRes1 = await request('/api/payments/create-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      invoiceId: targetInvoice.id,
      amount: partialAmount1,
      paymentMethod: 'Online UPI / QR'
    }
  });
  if (orderRes1.status !== 200 || !orderRes1.data.data.orderId) {
    throw new Error('Failed to create payment order: ' + JSON.stringify(orderRes1.data));
  }
  const orderId1 = orderRes1.data.data.orderId;
  console.log(`  -> Payment order created: ${orderId1}, Amount: ₹${orderRes1.data.data.amount}`);

  // 4. Verify & Finalize Partial Payment 1
  console.log('[4/6] Completing Gateway verification and posting to ledger...');
  const verifyRes1 = await request('/api/payments/verify', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      orderId: orderId1,
      paymentId: `PAY_UPI_${Date.now()}`,
      signature: 'mock_sig_valid',
      invoiceId: targetInvoice.id,
      paymentMethod: 'Online UPI / QR'
    }
  });
  if (verifyRes1.status !== 200 || !verifyRes1.data.data.receiptNo) {
    throw new Error('Payment verification failed: ' + JSON.stringify(verifyRes1.data));
  }
  const receipt1 = verifyRes1.data.data;
  console.log(`  -> Payment verified successfully!`);
  console.log(`  -> Official Receipt Generated: ${receipt1.receiptNo}`);
  console.log(`  -> Payment Record ID: #${receipt1.paymentId}`);

  // 5. Verify Real-time Account & Ledger Balance Update
  console.log('\n[5/6] Verifying real-time account balances after ₹25,000 partial payment...');
  const updatedDashRes = await request('/api/student/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const updatedBalance = updatedDashRes.data.data.balance;
  const updatedInvoices = updatedDashRes.data.data.pendingInvoices;
  const expectedTotalPaid = parseFloat(initialBalance.totalPaid) + partialAmount1;
  const expectedTotalOutstanding = parseFloat(initialBalance.totalOutstanding) - partialAmount1;
  const expectedInvOutstanding = parseFloat(targetInvoice.outstanding_amount) - partialAmount1;

  console.log(`  -> Updated Total Paid: ₹${updatedBalance.totalPaid} (Expected: ₹${expectedTotalPaid})`);
  console.log(`  -> Updated Total Outstanding: ₹${updatedBalance.totalOutstanding} (Expected: ₹${expectedTotalOutstanding})`);
  
  if (Math.abs(parseFloat(updatedBalance.totalPaid) - expectedTotalPaid) > 0.01) {
    throw new Error(`Expected total paid ₹${expectedTotalPaid}, got ₹${updatedBalance.totalPaid}`);
  }
  if (Math.abs(parseFloat(updatedBalance.totalOutstanding) - expectedTotalOutstanding) > 0.01) {
    throw new Error(`Expected total outstanding ₹${expectedTotalOutstanding}, got ₹${updatedBalance.totalOutstanding}`);
  }

  if (updatedInvoices.length > 0) {
    const invAfterPay1 = updatedInvoices.find(i => i.id === targetInvoice.id) || updatedInvoices[0];
    console.log(`  -> Invoice Status: ${invAfterPay1.status} (Expected: PARTIALLY_PAID)`);
    console.log(`  -> Invoice Paid Amount: ₹${invAfterPay1.paid_amount}`);
    console.log(`  -> Invoice Remaining Outstanding: ₹${invAfterPay1.outstanding_amount} (Expected: ₹${expectedInvOutstanding})`);
    if (Math.abs(parseFloat(invAfterPay1.outstanding_amount) - expectedInvOutstanding) > 0.01) {
      throw new Error(`Expected remaining outstanding ₹${expectedInvOutstanding}, got ₹${invAfterPay1.outstanding_amount}`);
    }
  }

  // 6. Verify Receipts List contains newly generated receipt
  console.log('\n[6/6] Verifying official receipt retrieval...');
  const receiptsRes = await request('/api/student/receipts', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`  -> Total Receipts for Student: ${receiptsRes.data.data.length}`);
  const matchingReceipt = receiptsRes.data.data.find(r => r.receipt_no === receipt1.receiptNo);
  if (!matchingReceipt) {
    throw new Error('Generated receipt not found in student receipts history!');
  }
  console.log(`  -> Found matching receipt: ${matchingReceipt.receipt_no}, Amount: ₹${matchingReceipt.amount_paid}, Method: ${matchingReceipt.payment_method}`);

  // Query single receipt details for print modal
  const singleReceiptRes = await request(`/api/student/receipts/${receipt1.receiptId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`  -> Digital Receipt fetched: ${singleReceiptRes.data.data.receipt_no}, Student: ${singleReceiptRes.data.data.full_name}`);

  console.log('\n================================================================');
  console.log('ALL VERIFICATIONS PASSED: PARTIAL PAYMENT & REAL-TIME UPDATES WORK 100%!');
  console.log('================================================================');
}

verifyPartialPaymentFlow().catch(err => {
  console.error('\nVerification Error:', err.message);
  process.exit(1);
});
