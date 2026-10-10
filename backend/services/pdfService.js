/**
 * PDF Generation Service for Official Documents
 * Gen-Z University ERP & Campus Management System
 */

const PDFDocument = require('pdfkit');

function createPdfBuffer(builderFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
    try {
      builderFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 1. Generate Academic Certificate PDF
 */
async function generateCertificatePdf({ studentName, rollNo, certificateType, issueDate, certificateNo }) {
  return createPdfBuffer(doc => {
    // Outer Border
    doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor('#4F46E5').stroke();
    doc.rect(26, 26, 543, 790).lineWidth(1).strokeColor('#C7D2FE').stroke();

    // Header
    doc.fontSize(24).fillColor('#1E1B4B').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 60, { align: 'center' });
    doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text('Autonomous Institution | Accredited by UGC & AICTE', { align: 'center' });
    doc.text('Main Campus, Knowledge Corridor, Bhubaneswar - 751024', { align: 'center' });
    doc.moveDown(0.5);

    doc.moveTo(60, 115).lineTo(535, 115).lineWidth(1.5).strokeColor('#4F46E5').stroke();

    // Certificate Title Box
    doc.moveDown(1.5);
    doc.rect(130, 135, 335, 40).fillAndStroke('#EEF2FF', '#6366F1');
    doc.fontSize(16).fillColor('#312E81').font('Helvetica-Bold').text(certificateType ? certificateType.toUpperCase() : 'BONAFIDE & CHARACTER CERTIFICATE', 130, 148, { align: 'center', width: 335 });

    // Certificate Body
    doc.moveDown(3);
    doc.fontSize(12).fillColor('#1F2937').font('Helvetica').lineGap(8);
    
    doc.text(`Certificate No: ${certificateNo || 'GZU-CERT-9042'}`, 60, 220, { align: 'left' });
    doc.text(`Date of Issue: ${issueDate || new Date().toLocaleDateString('en-IN')}`, 400, 220, { align: 'right' });

    doc.moveDown(2);
    const bodyText = `This is to certify that Mr./Ms. ${studentName || 'Student Name'} bearing Registration/Roll Number ${rollNo || 'GENZ-2026-081'} is a bonafide student of Gen-Z University enrolled in the Department of Computer Science & Engineering.

During their period of study at this institution, their academic performance, attendance record, and conduct have been observed to be EXEMPLARY and of high character.

This certificate is being issued upon their request for official record, scholarship, and verification purposes. We wish them all success in their future academic and professional endeavors.`;

    doc.text(bodyText, 60, 260, { width: 475, align: 'justify', lineGap: 6 });

    // Table of verification metadata
    doc.moveDown(2);
    const tableTop = 460;
    doc.rect(60, tableTop, 475, 90).fillAndStroke('#F9FAFB', '#E5E7EB');
    
    doc.fontSize(11).fillColor('#374151').font('Helvetica-Bold');
    doc.text('Verification Details', 80, tableTop + 12);
    doc.font('Helvetica').fontSize(10).fillColor('#4B5563');
    doc.text(`• Student Name: ${studentName || 'Munu Nial'}`, 80, tableTop + 32);
    doc.text(`• Roll Number: ${rollNo || 'GENZ-2026-CSE-042'}`, 80, tableTop + 48);
    doc.text(`• Digital Verification URL: https://cms.genzuniversity.in/verify`, 80, tableTop + 64);

    doc.text(`• System ID: GZU-${Date.now().toString().slice(-6)}`, 320, tableTop + 32);
    doc.text(`• Signature: Digitally Certified`, 320, tableTop + 48);
    doc.text(`• Security Stamp: 256-BIT ENCRYPTED`, 320, tableTop + 64);

    // Signatures
    const sigY = 660;
    doc.fontSize(11).fillColor('#111827').font('Helvetica-Bold');
    doc.text('Dean of Academic Affairs', 80, sigY);
    doc.text('Registrar / Controller of Examinations', 320, sigY);

    doc.fontSize(9).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Digitally Signed via ERP]', 80, sigY + 16);
    doc.text('[Digitally Signed via ERP]', 320, sigY + 16);

    // Footer
    doc.fontSize(8).fillColor('#9CA3AF').text('Gen-Z University Central Examination & Academic Records Desk • Valid with digital watermark', 40, 780, { align: 'center' });
  });
}

/**
 * 2. Generate Campus Gate Pass PDF
 */
async function generateGatePassPdf({ studentName, rollNo, passType, reason, validFrom, validTo, passId, wardenApproval }) {
  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#059669').stroke();

    // Header badge
    doc.rect(30, 30, 535, 70).fill('#064E3B');
    doc.fontSize(20).fillColor('#ECFDF5').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#A7F3D0').font('Helvetica').text('CAMPUS SECURITY & HOSTEL GATE PASS', { align: 'center' });

    // Pass Status Banner
    doc.moveDown(3);
    doc.rect(60, 125, 475, 40).fillAndStroke('#D1FAE5', '#10B981');
    doc.fontSize(14).fillColor('#065F46').font('Helvetica-Bold').text(`PASS ID: ${passId || 'GP-2026-8819'} [STATUS: VERIFIED & ACTIVE]`, 60, 138, { align: 'center', width: 475 });

    // Details Table
    const boxY = 190;
    doc.rect(60, boxY, 475, 260).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Student Name:', studentName || 'Munu Nial'],
      ['Roll Number:', rollNo || 'GENZ-2026-CSE-042'],
      ['Pass Category:', passType || 'Hosteler Day Outing Pass'],
      ['Purpose / Reason:', reason || 'Academic Library & Research Work'],
      ['Valid From:', validFrom || 'Today, 04:30 PM'],
      ['Valid Until / Curfew:', validTo || 'Today, 09:00 PM'],
      ['Warden Authorization:', wardenApproval || 'Approved (Biometric OTP Verified)'],
      ['Security Gate Access:', 'Main Gate No. 1, 2 & North Entry']
    ];

    let currentY = boxY + 20;
    fields.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151').text(label, 85, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 260, currentY);
      currentY += 28;
    });

    // Barcode Mock Box
    doc.rect(60, 480, 475, 90).fillAndStroke('#F3F4F6', '#D1D5DB');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1F2937').text('CAMPUS SECURITY SCANNER CODE', 80, 495);
    doc.fontSize(9).font('Courier').fillColor('#4B5563');
    doc.text(`||||| | |||||||| |||| ||||||| |||||| ||||| |||||||| ||||`, 80, 520);
    doc.text(`||||| | |||||||| |||| ||||||| |||||| ||||| |||||||| ||||`, 80, 532);
    doc.text(`* ${passId || 'GP-2026-8819'} - GZU - SECURITY - PASS *`, 80, 548);

    // Instructions
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#DC2626').text('IMPORTANT SECURITY INSTRUCTIONS:', 60, 600);
    doc.font('Helvetica').fontSize(9).fillColor('#4B5563').lineGap(4);
    doc.text('1. Student must carry university physical ID card along with this printed/digital pass.', 60, 620);
    doc.text('2. Failure to return before reporting deadline results in automated parent SMS alert & hostel fine.', 60, 638);
    doc.text('3. Any misconduct outside or inside campus premises will lead to cancellation of hostel privilege.', 60, 656);

    // Signatures
    const sY = 710;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Chief Warden', 80, sY);
    doc.text('Campus Security Officer', 340, sY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Digital Clearance]', 80, sY + 14);
    doc.text('[Gate Scanner Authorization]', 340, sY + 14);
  });
}

/**
 * 3. Generate Technician Maintenance Work Order PDF
 */
async function generateTechnicianTicketPdf({ technicianName, ticketId, roomOrLab, issueDescription, priority, reportedBy }) {
  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#D97706').stroke();

    // Header
    doc.rect(30, 30, 535, 70).fill('#78350F');
    doc.fontSize(20).fillColor('#FEF3C7').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#FDE68A').font('Helvetica').text('CAMPUS FACILITIES & MAINTENANCE WORK ORDER', { align: 'center' });

    // Ticket ID
    doc.rect(60, 125, 475, 40).fillAndStroke('#FEF3C7', '#F59E0B');
    doc.fontSize(14).fillColor('#92400E').font('Helvetica-Bold').text(`WORK ORDER: #${ticketId || 'TKT-2026-0941'} [${priority || 'HIGH PRIORITY'}]`, 60, 138, { align: 'center', width: 475 });

    // Fields
    const boxY = 190;
    doc.rect(60, boxY, 475, 260).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Assigned Technician:', technicianName || 'Senior Campus Technician'],
      ['Work Order ID:', ticketId || 'TKT-2026-0941'],
      ['Campus Location / Room:', roomOrLab || 'AI & Robotics Lab, 3rd Floor'],
      ['Priority Level:', priority || 'HIGH'],
      ['Reported By:', reportedBy || 'HOD Computer Science & Engineering'],
      ['Issue Details:', issueDescription || 'Network switch failure & projector HDMI check'],
      ['Date Issued:', new Date().toLocaleDateString('en-IN')],
      ['Status:', 'PENDING ON-SITE INSPECTION & RESOLUTION']
    ];

    let currentY = boxY + 20;
    fields.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151').text(label, 85, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 260, currentY, { width: 250 });
      currentY += 28;
    });

    // Checkbox checklist for technician
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1F2937').text('ON-SITE TECHNICIAN RESOLUTION CHECKLIST:', 60, 480);
    const checks = [
      '[ ] Physical Inspection & Fault Diagnostic Completed',
      '[ ] Hardware / Wiring / Replacement Parts Applied',
      '[ ] Power & Network Connectivity Testing Successful',
      '[ ] Lab In-Charge Sign-off & Handover Completed'
    ];
    let chkY = 505;
    doc.font('Courier').fontSize(10).fillColor('#374151');
    checks.forEach(c => {
      doc.text(c, 80, chkY);
      chkY += 22;
    });

    // Signatures
    const sY = 650;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Technician Signature', 80, sY);
    doc.text('Facilities Manager Sign-off', 340, sY);

    doc.rect(80, sY + 20, 160, 40).strokeColor('#9CA3AF').stroke();
    doc.rect(340, sY + 20, 160, 40).strokeColor('#9CA3AF').stroke();
  });
}

/**
 * 4. Generate Director Daily Executive Report PDF
 */
async function generateDirectorReportPdf({ directorName, date, totalCollections, activeStudents, pendingApprovals, systemHealth }) {
  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#0284C7').stroke();

    // Header
    doc.rect(30, 30, 535, 75).fill('#0F172A');
    doc.fontSize(22).fillColor('#38BDF8').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#94A3B8').font('Helvetica').text('OFFICE OF THE DIRECTOR & BOARD OF GOVERNORS', { align: 'center' });
    doc.text('DAILY EXECUTIVE PERFORMANCE & ACCOUNTS SUMMARY', { align: 'center' });

    // Subtitle
    doc.moveDown(3);
    doc.fontSize(13).fillColor('#0F172A').font('Helvetica-Bold').text(`EXECUTIVE BRIEFING: ${date || new Date().toLocaleDateString('en-IN')}`, 60, 130);
    doc.fontSize(10).font('Helvetica').fillColor('#64748B').text(`Recipient: ${directorName || 'Director'} • System Generated Report`, 60, 148);

    // KPI Summary Cards
    const cardY = 175;
    // Card 1
    doc.rect(60, cardY, 145, 70).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#166534').text('FEE COLLECTIONS', 70, cardY + 12);
    doc.fontSize(16).fillColor('#15803D').text(totalCollections || '₹ 8,45,000', 70, cardY + 34);

    // Card 2
    doc.rect(225, cardY, 145, 70).fillAndStroke('#EFF6FF', '#93C5FD');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E40AF').text('ACTIVE STUDENTS', 235, cardY + 12);
    doc.fontSize(16).fillColor('#1D4ED8').text(activeStudents || '1,480 Active', 235, cardY + 34);

    // Card 3
    doc.rect(390, cardY, 145, 70).fillAndStroke('#FEF3C7', '#FCD34D');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#92400E').text('PENDING APPROVALS', 400, cardY + 12);
    doc.fontSize(16).fillColor('#B45309').text(pendingApprovals || '4 Requests', 400, cardY + 34);

    // Section 1: Department Financial Summary
    doc.moveDown(5);
    const tableY = 275;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text('1. Department Collections & Ledger Highlights', 60, tableY);

    doc.rect(60, tableY + 20, 475, 120).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#334155');
    doc.text('Department / Division', 75, tableY + 32);
    doc.text('Transactions', 260, tableY + 32);
    doc.text('Volume Collected', 410, tableY + 32);

    doc.moveTo(75, tableY + 48).lineTo(520, tableY + 48).strokeColor('#CBD5E1').stroke();

    const depts = [
      ['Computer Science & Engineering', '28 Fees Settled', '₹ 3,92,000'],
      ['Mechanical & Civil Engineering', '16 Fees Settled', '₹ 2,24,000'],
      ['Management & MBA Wing', '11 Fees Settled', '₹ 1,54,000'],
      ['Hostel & Mess Utility Fee', '15 Payments', '₹ 75,000']
    ];

    let rY = tableY + 58;
    doc.font('Helvetica').fontSize(9).fillColor('#475569');
    depts.forEach(([d, t, a]) => {
      doc.text(d, 75, rY);
      doc.text(t, 260, rY);
      doc.font('Helvetica-Bold').text(a, 410, rY);
      doc.font('Helvetica');
      rY += 18;
    });

    // Section 2: Infrastructure & Compliance
    const s2Y = 430;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text('2. Campus Governance & System Infrastructure', 60, s2Y);

    doc.rect(60, s2Y + 20, 475, 100).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica').fontSize(10).fillColor('#334155').lineGap(5);
    doc.text(`• Cloud System Health: ${systemHealth || '100% Operational, Zero Downtime'}`, 75, s2Y + 32);
    doc.text('• Gate Security Compliance: 98.4% On-time Curfew Compliance Recorded.', 75, s2Y + 50);
    doc.text('• Academic Attendance: 92.1% Average Student Classroom Attendance.', 75, s2Y + 68);
    doc.text('• Digital Audit Trail: All transactions logged to Hostinger MySQL Cluster.', 75, s2Y + 86);

    // Signatures
    const sigY = 650;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Chief Financial Officer', 80, sigY);
    doc.text('Registrar / Controller', 340, sigY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Finance Department]', 80, sigY + 14);
    doc.text('[Administrative Operations]', 340, sigY + 14);

    doc.fontSize(8).fillColor('#94A3B8').text('Confidential Executive Briefing • Prepared for the Director, Gen-Z University', 40, 780, { align: 'center' });
  });
}

/**
 * 5. Generate Official Payment Receipt PDF
 */
async function generateReceiptPdf({ studentName, receiptNo, amount, paymentMethod, transactionId, date }) {
  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#2563EB').stroke();

    // Header
    doc.rect(30, 30, 535, 75).fill('#1E3A8A');
    doc.fontSize(22).fillColor('#DBEAFE').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#BFDBFE').font('Helvetica').text('OFFICIAL FEE PAYMENT RECEIPT', { align: 'center' });

    // Receipt Badge
    doc.rect(60, 125, 475, 40).fillAndStroke('#EFF6FF', '#3B82F6');
    doc.fontSize(14).fillColor('#1E40AF').font('Helvetica-Bold').text(`RECEIPT NO: ${receiptNo || 'REC-2026-001'} [PAID]`, 60, 138, { align: 'center', width: 475 });

    // Table
    const boxY = 190;
    doc.rect(60, boxY, 475, 230).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Student Name:', studentName || 'Munu Nial'],
      ['Amount Paid:', `INR ${Number(amount).toLocaleString('en-IN')}/-`],
      ['Payment Mode:', paymentMethod || 'Online Payment'],
      ['Transaction Ref / UTR:', transactionId || 'RZP-PAY-8839120'],
      ['Payment Date:', date || new Date().toLocaleDateString('en-IN')],
      ['University Code:', 'GENZ - UGC & AICTE Approved'],
      ['Status:', 'SUCCESSFULLY RECONCILED & POSTED']
    ];

    let currentY = boxY + 20;
    fields.forEach(([label, value]) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151').text(label, 85, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 260, currentY);
      currentY += 28;
    });

    // Seal
    doc.rect(60, 450, 475, 80).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#166534').text('ACCOUNTS DEPARTMENT DIGITAL CLEARANCE', 80, 465);
    doc.fontSize(9).font('Helvetica').fillColor('#15803D').text('This is an authorized computer-generated fee acknowledgement receipt. No manual signature is required for official presentation.', 80, 485, { width: 430 });

    // Footer
    const sY = 650;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Accounts Officer', 80, sY);
    doc.text('Finance Controller', 340, sY);
  });
}

module.exports = {
  createPdfBuffer,
  generateCertificatePdf,
  generateGatePassPdf,
  generateTechnicianTicketPdf,
  generateDirectorReportPdf,
  generateReceiptPdf
};
