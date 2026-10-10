const {
  sendCertificateEmail,
  sendGatePassEmail,
  sendTechnicianTicketEmail,
  sendDirectorReportEmail
} = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/services/emailService');

async function sendAllTests() {
  const targetEmail = 'mununial637@gmail.com';
  console.log('Sending all 4 emails with GenZ University Digital Campus branding to', targetEmail);

  // 1. Certificate Email
  await sendCertificateEmail({
    to: targetEmail,
    studentName: 'Jitendra Nial',
    rollNo: '2301316095',
    certificateType: 'Bonafide Certificate',
    issueDate: new Date().toLocaleDateString('en-IN'),
    certificateNo: 'GZU-CERT-2026-9042'
  });
  console.log('1. Certificate email sent.');

  // 2. Gate Pass Email
  await sendGatePassEmail({
    to: targetEmail,
    studentName: 'Jitendra Nial',
    rollNo: '2301316095',
    passType: 'Day Outing Pass',
    reason: 'Campus Market & Book Store Visit',
    validFrom: '11 Oct 2026, 02:00 PM',
    validTo: '11 Oct 2026, 08:00 PM',
    passId: 'GP-20261011-8831',
    wardenApproval: 'Approved by Chief Warden'
  });
  console.log('2. Gate Pass email sent.');

  // 3. Technician Work Order
  await sendTechnicianTicketEmail({
    to: targetEmail,
    technicianName: 'Santosh Behera',
    ticketId: 'TKT-2026-1049',
    roomOrLab: 'Computer Lab 3 / Block B',
    issueDescription: 'Network switch port failure & LAN cable check',
    priority: 'HIGH',
    reportedBy: 'Lab Incharge'
  });
  console.log('3. Technician ticket email sent.');

  // 4. Director Report Email
  await sendDirectorReportEmail({
    to: targetEmail,
    directorName: 'Executive Director',
    date: new Date().toLocaleDateString('en-IN'),
    totalCollections: '₹5,20,000',
    activeStudents: '1,420',
    pendingApprovals: '2',
    systemHealth: '100% Operational'
  });
  console.log('4. Director report email sent.');
  console.log('All 4 emails dispatched successfully!');
}

sendAllTests().catch(console.error);
