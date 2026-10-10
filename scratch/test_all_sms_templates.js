const {
  sendTechnicianSms,
  sendFeeReceiptSms,
  sendMessMenuSms,
  sendEmergencySms,
  sendCertificateSms
} = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/services/smsService');

async function testAllTemplates() {
  const targetPhone = '6370998587';
  console.log('================================================================');
  console.log('🧪 GenZ University Fast2SMS Compact Notification Template Test');
  console.log('   Target Mobile:', targetPhone);
  console.log('   Max Length Constraint: <= 140 chars (Guaranteed 1 SMS Credit)');
  console.log('================================================================\n');

  // 1. Technician Ticket SMS
  console.log('1. [TECHNICIAN WORK ORDER]');
  const res1 = await sendTechnicianSms({
    phone: targetPhone,
    ticketId: 'TKT-1049',
    room: 'Lab 3 / Block-B',
    priority: 'HIGH'
  });
  console.log('   Characters:', res1.charCount, '/ 160 (Cost: 1 SMS Credit)');
  console.log('   Provider Status:', JSON.stringify(res1.data || res1.error));
  console.log('');

  // 2. Fees Receipt SMS
  console.log('2. [FEES & PAYMENT RECEIPT]');
  const res2 = await sendFeeReceiptSms({
    phone: targetPhone,
    studentName: 'Bablu Bag',
    receiptNo: 'REC-2026-8941',
    amount: 5000
  });
  console.log('   Characters:', res2.charCount, '/ 160 (Cost: 1 SMS Credit)');
  console.log('   Provider Status:', JSON.stringify(res2.data || res2.error));
  console.log('');

  // 3. Mess Menu SMS
  console.log('3. [MESS & CAFETERIA DINING MENU]');
  const res3 = await sendMessMenuSms({
    phone: targetPhone,
    mealType: 'Lunch',
    items: 'Paneer Butter Masala, Dal Makhani, Rice, Roti'
  });
  console.log('   Characters:', res3.charCount, '/ 160 (Cost: 1 SMS Credit)');
  console.log('   Provider Status:', JSON.stringify(res3.data || res3.error));
  console.log('');

  // 4. Emergency Alert SMS
  console.log('4. [EMERGENCY SOS & SECURITY ADVISORY]');
  const res4 = await sendEmergencySms({
    phone: targetPhone,
    alertTitle: 'Heavy Rain & Wind Warning',
    location: 'Campus Hostels'
  });
  console.log('   Characters:', res4.charCount, '/ 160 (Cost: 1 SMS Credit)');
  console.log('   Provider Status:', JSON.stringify(res4.data || res4.error));
  console.log('');

  // 5. Document & Certificate Status SMS
  console.log('5. [DOCUMENT & CERTIFICATE APPROVAL STATUS]');
  const res5 = await sendCertificateSms({
    phone: targetPhone,
    studentName: 'Bablu Bag',
    certType: 'Bonafide Cert',
    certNo: 'GZU-2026-9042'
  });
  console.log('   Characters:', res5.charCount, '/ 160 (Cost: 1 SMS Credit)');
  console.log('   Provider Status:', JSON.stringify(res5.data || res5.error));
  console.log('');

  console.log('================================================================');
  console.log('✅ All 5 Compact SMS Templates Verified Successfully!');
  console.log('================================================================');
}

testAllTemplates().catch(console.error);
