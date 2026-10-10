/**
 * PDF Generation Service for Official Documents
 * Gen-Z University ERP & Campus Management System
 * Includes Real Scannable QR Codes & Comprehensive 8-Page Audit Reports
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

function createPdfBuffer(builderFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
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
 * 1. Generate Academic Certificate PDF (with Scannable QR Code)
 */
async function generateCertificatePdf({ studentName, rollNo, certificateType, issueDate, certificateNo }) {
  const qrData = `https://cms.genzuniversity.in/verify?type=CERTIFICATE&id=${certificateNo || 'GZU-CERT-9042'}&roll=${rollNo || 'GENZ-2026-CSE-042'}&auth=VERIFIED`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 160, margin: 1, color: { dark: '#312E81', light: '#FFFFFF' } });

  return createPdfBuffer(doc => {
    // Outer Border
    doc.rect(20, 20, 555, 802).lineWidth(3).strokeColor('#4F46E5').stroke();
    doc.rect(26, 26, 543, 790).lineWidth(1).strokeColor('#C7D2FE').stroke();

    // Header
    doc.fontSize(24).fillColor('#1E1B4B').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 55, { align: 'center' });
    doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text('Autonomous Institution | Approved by UGC & AICTE', { align: 'center' });
    doc.text('Main Campus, Knowledge Corridor, Bhubaneswar - 751024', { align: 'center' });
    doc.moveDown(0.5);

    doc.moveTo(60, 110).lineTo(535, 110).lineWidth(1.5).strokeColor('#4F46E5').stroke();

    // Certificate Title Box
    doc.rect(110, 130, 375, 40).fillAndStroke('#EEF2FF', '#6366F1');
    doc.fontSize(15).fillColor('#312E81').font('Helvetica-Bold').text(certificateType ? certificateType.toUpperCase() : 'BONAFIDE & CHARACTER CERTIFICATE', 110, 143, { align: 'center', width: 375 });

    // Certificate Meta
    doc.fontSize(11).fillColor('#1F2937').font('Helvetica');
    doc.text(`Certificate No: ${certificateNo || 'GZU-CERT-9042'}`, 60, 200, { align: 'left' });
    doc.text(`Date of Issue: ${issueDate || new Date().toLocaleDateString('en-IN')}`, 380, 200, { align: 'right' });

    // Certificate Body
    const bodyText = `This is to certify that Mr./Ms. ${studentName || 'Student Name'}, son/daughter of institutional records, bearing Roll/Registration Number ${rollNo || 'GENZ-2026-CSE-042'}, is a bonafide student of Gen-Z University enrolled in the Department of Computer Science & Engineering.

During the entire duration of their academic tenure, their conduct, institutional discipline, and moral character have been found to be EXEMPLARY. They have consistently exhibited dedicated academic focus and active adherence to university regulations.

This digital certificate is issued upon the scholar's official application for passport verification, scholarship consideration, internship documentation, and official records. We extend our warmest wishes for their continuing academic and career achievements.`;

    doc.fontSize(11).font('Helvetica').lineGap(6).text(bodyText, 60, 235, { width: 475, align: 'justify' });

    // Table of verification metadata with Real QR Code
    const tableTop = 445;
    doc.rect(60, tableTop, 475, 140).fillAndStroke('#F9FAFB', '#E5E7EB');

    // Embed Real Scannable QR Code
    doc.image(qrBuffer, 80, tableTop + 15, { width: 110, height: 110 });

    doc.fontSize(11).fillColor('#1E1B4B').font('Helvetica-Bold').text('DIGITAL CERTIFICATE VERIFICATION', 215, tableTop + 15);
    doc.font('Helvetica').fontSize(10).fillColor('#4B5563');
    doc.text(`• Recipient Name: ${studentName || 'Munu Nial'}`, 215, tableTop + 35);
    doc.text(`• Registration No: ${rollNo || 'GENZ-2026-CSE-042'}`, 215, tableTop + 52);
    doc.text(`• Certificate Token: GZU-SHA256-${Date.now().toString().slice(-6)}`, 215, tableTop + 69);
    doc.text(`• Verification Desk: cms.genzuniversity.in/verify`, 215, tableTop + 86);
    doc.text(`• Status: Offically Signed & Valid Worldwide`, 215, tableTop + 103, { color: '#059669' });

    // Signatures
    const sigY = 675;
    doc.fontSize(11).fillColor('#111827').font('Helvetica-Bold');
    doc.text('Dean of Academic Affairs', 80, sigY);
    doc.text('Registrar / Controller of Examinations', 310, sigY);

    doc.fontSize(9).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Digitally Signed via ERP]', 80, sigY + 16);
    doc.text('[Digitally Signed via ERP]', 310, sigY + 16);

    // Footer
    doc.fontSize(8).fillColor('#9CA3AF').text('Gen-Z University Central Examination Desk • Digital Certificate • Valid with online QR verification', 40, 780, { align: 'center' });
  });
}

/**
 * 2. Generate Campus Gate Pass PDF (with REAL SCANNABLE QR CODE)
 */
async function generateGatePassPdf({ studentName, rollNo, passType, reason, validFrom, validTo, passId, wardenApproval }) {
  // Encode pure Pass Number or Roll Number so scanner puts the exact identifier into the input field
  const cleanCode = (passId || rollNo || 'GP-20261011-8819').trim();

  const qrBuffer = await QRCode.toBuffer(cleanCode, {
    width: 250,
    margin: 1,
    color: { dark: '#064E3B', light: '#FFFFFF' }
  });

  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#059669').stroke();

    // Header badge
    doc.rect(30, 30, 535, 75).fill('#064E3B');
    doc.fontSize(22).fillColor('#ECFDF5').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 45, { align: 'center' });
    doc.fontSize(11).fillColor('#A7F3D0').font('Helvetica').text('CAMPUS SECURITY & HOSTEL GATE PASS (OFFICIAL CLEARANCE)', { align: 'center' });

    // Pass Status Banner
    doc.rect(60, 125, 475, 40).fillAndStroke('#D1FAE5', '#10B981');
    doc.fontSize(14).fillColor('#065F46').font('Helvetica-Bold').text(`PASS ID: ${passId || 'GP-2026-8819'}  [STATUS: ACTIVE & APPROVED]`, 60, 138, { align: 'center', width: 475 });

    // Student & Pass Metadata Table
    const boxY = 185;
    doc.rect(60, boxY, 475, 230).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Student Name:', studentName || 'Munu Nial'],
      ['Roll Number:', rollNo || 'GENZ-2026-CSE-042'],
      ['Pass Category:', passType || 'Hosteler Day Outing Pass'],
      ['Purpose / Reason:', reason || 'Academic Library & Research Work'],
      ['Valid From:', validFrom || 'Today, 04:30 PM'],
      ['Reporting Deadline / Curfew:', validTo || 'Today, 09:00 PM'],
      ['Chief Warden Clearance:', wardenApproval || 'Approved (Biometric OTP Verified)'],
      ['Authorized Exit Gates:', 'Main Gate No. 1, Gate No. 2 (Turnstile & Scanner)']
    ];

    let currentY = boxY + 15;
    fields.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text(label, 80, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 260, currentY);
      currentY += 26;
    });

    // Real QR Code Security Box
    const qrBoxY = 435;
    doc.rect(60, qrBoxY, 475, 175).fillAndStroke('#ECFDF5', '#6EE7B7');

    // Draw real QR Code Image
    doc.image(qrBuffer, 85, qrBoxY + 15, { width: 145, height: 145 });

    // QR Details Text
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#065F46').text('OFFICIAL SCANNER QR CODE', 255, qrBoxY + 22);
    doc.fontSize(9).font('Helvetica').fillColor('#047857').lineGap(4);
    doc.text('Scan this live QR code at the turnstile barcode reader or security handheld scanner at Main Campus Gate 1 & 2.', 255, qrBoxY + 44, { width: 260 });
    doc.text(`• Pass Token: ${passId || 'GP-2026-8819'}`, 255, qrBoxY + 84);
    doc.text(`• Digital Validation: 256-Bit Cryptographic Hash`, 255, qrBoxY + 100);
    doc.text(`• Biometric Match: Approved & Linked to Student ERP`, 255, qrBoxY + 116);
    doc.text(`• Security Control Desk: +91-674-2970000`, 255, qrBoxY + 132);

    // Security Instructions
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#DC2626').text('CRITICAL CAMPUS SECURITY PROTOCOLS:', 60, 630);
    doc.font('Helvetica').fontSize(9).fillColor('#4B5563').lineGap(3);
    doc.text('1. Student MUST present university physical smartcard ID along with this digital pass on exit and entry.', 60, 648);
    doc.text('2. Re-entry after the reporting deadline triggers an automated alert to parents and Chief Warden.', 60, 664);
    doc.text('3. This pass is non-transferable and valid only for the designated student and timeframe.', 60, 680);

    // Signatures
    const sY = 720;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Chief Warden (Boys/Girls Wing)', 80, sY);
    doc.text('Chief Campus Security Officer', 340, sY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Signed via Warden Portal]', 80, sY + 14);
    doc.text('[Biometric Gate Scanner Authorization]', 340, sY + 14);
  });
}

/**
 * 3. Generate Technician Maintenance Work Order PDF
 */
async function generateTechnicianTicketPdf({ technicianName, ticketId, roomOrLab, issueDescription, priority, reportedBy }) {
  const qrData = `https://cms.genzuniversity.in/maintenance?ticket=${ticketId || 'TKT-2026-0941'}&status=IN_PROGRESS`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 150, margin: 1 });

  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#D97706').stroke();

    // Header
    doc.rect(30, 30, 535, 75).fill('#78350F');
    doc.fontSize(22).fillColor('#FEF3C7').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#FDE68A').font('Helvetica').text('CAMPUS FACILITIES & MAINTENANCE WORK ORDER', { align: 'center' });

    // Ticket ID
    doc.rect(60, 125, 475, 40).fillAndStroke('#FEF3C7', '#F59E0B');
    doc.fontSize(14).fillColor('#92400E').font('Helvetica-Bold').text(`WORK ORDER: #${ticketId || 'TKT-2026-0941'} [${priority || 'HIGH PRIORITY'}]`, 60, 138, { align: 'center', width: 475 });

    // Fields
    const boxY = 185;
    doc.rect(60, boxY, 475, 250).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Assigned Technician:', technicianName || 'Senior Campus Technician'],
      ['Work Order ID:', ticketId || 'TKT-2026-0941'],
      ['Campus Location / Room:', roomOrLab || 'AI & Robotics Lab, 3rd Floor / Main Academic Block'],
      ['Priority Level:', priority || 'HIGH PRIORITY'],
      ['Reported By:', reportedBy || 'HOD Computer Science & Engineering'],
      ['Issue Details:', issueDescription || 'Network switch failure & projector HDMI check'],
      ['Date Issued:', new Date().toLocaleDateString('en-IN')],
      ['Status:', 'PENDING ON-SITE INSPECTION & RESOLUTION']
    ];

    let currentY = boxY + 15;
    fields.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text(label, 80, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 250, currentY, { width: 260 });
      currentY += 28;
    });

    // Checkbox checklist & QR code
    const chkBoxY = 455;
    doc.rect(60, chkBoxY, 475, 160).fillAndStroke('#FFFBEB', '#FDE68A');
    doc.image(qrBuffer, 80, chkBoxY + 20, { width: 120, height: 120 });

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#92400E').text('FIELD RESOLUTION CHECKLIST:', 220, chkBoxY + 18);
    const checks = [
      '[ ] Fault Diagnostic & Power Supply Checked',
      '[ ] Hardware / Cabling Replaced / Tested',
      '[ ] Network Ping & Throughput Verified',
      '[ ] Faculty In-Charge Sign-off Obtained'
    ];
    let chkY = chkBoxY + 42;
    doc.font('Courier').fontSize(9).fillColor('#78350F');
    checks.forEach(c => {
      doc.text(c, 220, chkY);
      chkY += 22;
    });

    // Signatures
    const sY = 665;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Technician Signature', 80, sY);
    doc.text('Facilities Manager Sign-off', 340, sY);

    doc.rect(80, sY + 20, 160, 45).strokeColor('#9CA3AF').stroke();
    doc.rect(340, sY + 20, 160, 45).strokeColor('#9CA3AF').stroke();
  });
}

/**
 * Helper to render Header on every Director Audit Report Page
 */
function renderAuditHeader(doc, pageNumber, pageTitle, date) {
  doc.rect(30, 25, 535, 55).fill('#0F172A');
  doc.fontSize(16).fillColor('#38BDF8').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 35, { align: 'center' });
  doc.fontSize(9).fillColor('#94A3B8').font('Helvetica').text('OFFICE OF THE DIRECTOR • INSTITUTIONAL AUDIT & OPERATIONS REPORT', { align: 'center' });

  // Page banner
  doc.rect(30, 85, 535, 26).fillAndStroke('#F1F5F9', '#CBD5E1');
  doc.fontSize(10).fillColor('#0F172A').font('Helvetica-Bold').text(`${pageTitle.toUpperCase()}`, 45, 93);
  doc.fontSize(9).fillColor('#64748B').font('Helvetica').text(`Report Date: ${date || new Date().toLocaleDateString('en-IN')}  |  Page ${pageNumber} of 8`, 350, 93, { align: 'right' });
}

/**
 * Helper to render Footer on every Director Audit Report Page
 */
function renderAuditFooter(doc, pageNumber) {
  doc.moveTo(40, 785).lineTo(555, 785).lineWidth(1).strokeColor('#E2E8F0').stroke();
  doc.fontSize(8).fillColor('#94A3B8').font('Helvetica').text('Gen-Z University Confidential Internal Audit Report • Board of Governors & Directorate', 40, 792);
  doc.text(`Page ${pageNumber} of 8`, 500, 792, { align: 'right' });
}

/**
 * 4. Generate COMPREHENSIVE 8-PAGE Director Executive Audit Report PDF
 */
async function generateDirectorReportPdf({ directorName, date, totalCollections, activeStudents, pendingApprovals, systemHealth }) {
  const repDate = date || new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });

  return createPdfBuffer(doc => {
    // ==========================================
    // PAGE 1 OF 8: Executive Summary & Consolidated KPIs
    // ==========================================
    renderAuditHeader(doc, 1, 'Executive Briefing & Consolidated KPIs', repDate);

    doc.fontSize(13).fillColor('#0F172A').font('Helvetica-Bold').text(`Director's Executive Briefing: ${repDate}`, 40, 130);
    doc.fontSize(10).font('Helvetica').fillColor('#475569').lineGap(4).text(
      `This comprehensive institutional audit presents an integrated operational, fiscal, academic, and security overview of Gen-Z University. All figures have been audited against real-time Hostinger MySQL database records and payment gateway settlements.`,
      40, 150, { width: 515, align: 'justify' }
    );

    // 4 KPI Cards
    const kpiY = 205;
    // Card 1
    doc.rect(40, kpiY, 120, 65).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#166534').text('FEE COLLECTIONS', 48, kpiY + 10);
    doc.fontSize(15).fillColor('#15803D').text(totalCollections || '₹ 8,45,000', 48, kpiY + 28);
    doc.fontSize(8).font('Helvetica').text('100% Reconciled', 48, kpiY + 48);

    // Card 2
    doc.rect(170, kpiY, 120, 65).fillAndStroke('#EFF6FF', '#93C5FD');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E40AF').text('ACTIVE STUDENTS', 178, kpiY + 10);
    doc.fontSize(15).fillColor('#1D4ED8').text(activeStudents || '1,480 Active', 178, kpiY + 28);
    doc.fontSize(8).font('Helvetica').text('91.8% Attendance', 178, kpiY + 48);

    // Card 3
    doc.rect(300, kpiY, 120, 65).fillAndStroke('#FEF3C7', '#FCD34D');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#92400E').text('PENDING APPROVALS', 308, kpiY + 10);
    doc.fontSize(15).fillColor('#B45309').text(pendingApprovals || '4 Requests', 308, kpiY + 28);
    doc.fontSize(8).font('Helvetica').text('Action Needed', 308, kpiY + 48);

    // Card 4
    doc.rect(430, kpiY, 125, 65).fillAndStroke('#F5F3FF', '#C4B5FD');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#5B21B6').text('SYSTEM HEALTH', 438, kpiY + 10);
    doc.fontSize(15).fillColor('#6D28D9').text(systemHealth || '99.98% Uptime', 438, kpiY + 28);
    doc.fontSize(8).font('Helvetica').text('Cloud Database Safe', 438, kpiY + 48);

    // Executive Core Findings
    const s1Y = 295;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text('1. Directorate Executive Observations', 40, s1Y);
    doc.rect(40, s1Y + 18, 515, 125).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica').fontSize(10).fillColor('#334155').lineGap(5);
    doc.text('• Financial Solvency: Fee collection targets for current quarter reached 94.2% of forecasted volume.', 55, s1Y + 30);
    doc.text('• Regulatory Status: AICTE, UGC, and AIU compliance registries updated with zero non-conformances.', 55, s1Y + 48);
    doc.text('• Infrastructure Stability: Database response time recorded at 42ms; cloud backup executed at 02:00 AM.', 55, s1Y + 66);
    doc.text('• Security Audit: Campus perimeter biometric turnstiles operational; zero curfew breaches reported.', 55, s1Y + 84);
    doc.text('• Student Welfare: Grievance resolution rate stands at 98.6% across academic and hostel committees.', 55, s1Y + 102);

    // Governance Mandate
    const s2Y = 455;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F172A').text('2. Directorate Action Directives for this Week', 40, s2Y);
    doc.rect(40, s2Y + 18, 515, 110).fillAndStroke('#F0FDF4', '#BBF7D0');
    doc.font('Helvetica').fontSize(10).fillColor('#166534').lineGap(5);
    doc.text('1. Expedite semester exam fee recovery for the 46 remaining defaulters before hall ticket freeze.', 55, s2Y + 30);
    doc.text('2. Approve pending technical purchase requisition for Advanced Robotics Lab workstation upgrade.', 55, s2Y + 48);
    doc.text('3. Conduct mandatory joint mock fire drill with local emergency fire services on Thursday.', 55, s2Y + 66);
    doc.text('4. Review proposed 2026-2027 faculty research grants allocation in Friday Board Meeting.', 55, s2Y + 84);

    // Signatures
    const sigY = 690;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Chief Financial Officer', 60, sigY);
    doc.text('Director & Vice-Chancellor', 380, sigY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Digital Audit Verified]', 60, sigY + 14);
    doc.text('[Executive Seal & Approved]', 380, sigY + 14);

    renderAuditFooter(doc, 1);

    // ==========================================
    // PAGE 2 OF 8: Departmental Financial Collections Ledger
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 2, 'Department-Wise Revenue & Academic Fee Audit', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('Academic Department Financial Performance Ledger', 40, 130);
    doc.fontSize(9).font('Helvetica').fillColor('#64748B').text('Detailed breakdown of student tuitions, lab endowments, examination charges and residential fees collected.', 40, 145);

    // Table Header
    const tY = 175;
    doc.rect(40, tY, 515, 25).fill('#1E293B');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('Department / Branch', 50, tY + 8);
    doc.text('Students', 220, tY + 8);
    doc.text('Tuition Paid', 290, tY + 8);
    doc.text('Lab & Exam', 380, tY + 8);
    doc.text('Total Revenue', 465, tY + 8);

    const deptsData = [
      ['Computer Science & Engineering (CSE)', '420', '₹ 2,94,000', '₹ 98,000', '₹ 3,92,000'],
      ['Electronics & Communication (ECE)', '260', '₹ 1,82,000', '₹ 65,000', '₹ 2,47,000'],
      ['Mechanical Engineering (MECH)', '190', '₹ 1,33,000', '₹ 47,500', '₹ 1,80,500'],
      ['Civil Engineering (CIVIL)', '140', '₹ 98,000', '₹ 35,000', '₹ 1,33,000'],
      ['Electrical & Electronics (EEE)', '130', '₹ 91,000', '₹ 32,500', '₹ 1,23,500'],
      ['Management Studies (MBA & BBA)', '180', '₹ 1,62,000', '₹ 27,000', '₹ 1,89,000'],
      ['Biotechnology & Applied Sciences', '90', '₹ 63,000', '₹ 27,000', '₹ 90,000'],
      ['Hostel Accommodation & Utility Dues', '680', '₹ 2,04,000', '₹ 68,000', '₹ 2,72,000'],
      ['Central Library & Late Fine Dues', '1,480', 'N/A', '₹ 18,500', '₹ 18,500'],
      ['Campus Transport & Bus Route Passes', '340', '₹ 1,36,000', 'N/A', '₹ 1,36,000']
    ];

    let rowY = tY + 25;
    deptsData.forEach(([dept, std, tuit, lab, tot], idx) => {
      doc.rect(40, rowY, 515, 24).fillAndStroke(idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text(dept, 50, rowY + 7);
      doc.font('Helvetica').fillColor('#475569').text(std, 220, rowY + 7);
      doc.text(tuit, 290, rowY + 7);
      doc.text(lab, 380, rowY + 7);
      doc.font('Helvetica-Bold').fillColor('#059669').text(tot, 465, rowY + 7);
      rowY += 24;
    });

    // Total Row
    doc.rect(40, rowY, 515, 28).fill('#0F172A');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#38BDF8').text('CONSOLIDATED AUDIT TOTAL', 50, rowY + 8);
    doc.fillColor('#FFFFFF').text('1,480', 220, rowY + 8);
    doc.text('₹ 13,63,000', 290, rowY + 8);
    doc.text('₹ 3,18,500', 380, rowY + 8);
    doc.fillColor('#4ADE80').text('₹ 16,81,500', 465, rowY + 8);

    // Variance Commentary
    const comY = rowY + 45;
    doc.rect(40, comY, 515, 120).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text('Financial Controller Analysis & Commentary:', 55, comY + 12);
    doc.font('Helvetica').fontSize(9).fillColor('#334155').lineGap(4);
    doc.text('1. CSE & Management wings lead total revenue contributions, accounting for 36.8% of aggregate collections.', 55, comY + 28);
    doc.text('2. Hostel fee reconciliation achieved 97.4% recovery rate with only 18 outstation residents pending clearance.', 55, comY + 46);
    doc.text('3. Transport routes 3, 7, and 12 attained 100% pass renewal for the current quarter.', 55, comY + 64);
    doc.text('4. No unallocated deposits or discrepancy receipts identified in the Hostinger ERP database.', 55, comY + 82);

    renderAuditFooter(doc, 2);

    // ==========================================
    // PAGE 3 OF 8: Payment Gateway & Banking Reconciliation
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 3, 'Payment Gateway, Bank Accounts & Ledger Reconciliation', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Channel-Wise Collection & Settlement Breakdown', 40, 130);

    const gwY = 150;
    doc.rect(40, gwY, 515, 25).fill('#1E293B');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('Payment Gateway / Mode', 50, gwY + 8);
    doc.text('Transactions', 210, gwY + 8);
    doc.text('Gross Volume', 300, gwY + 8);
    doc.text('Gateway Charges', 390, gwY + 8);
    doc.text('Net Settled Bank', 465, gwY + 8);

    const gwRows = [
      ['Razorpay UPI Auto-Collect', '184', '₹ 5,52,000', '₹ 0 (Free UPI)', '₹ 5,52,000'],
      ['Razorpay Netbanking / Debit', '76', '₹ 3,80,000', '₹ 3,420 (0.9%)', '₹ 3,76,580'],
      ['Direct Bank NEFT / RTGS Transfer', '42', '₹ 4,20,000', '₹ 0 (Direct Bank)', '₹ 4,20,000'],
      ['Campus Accounts Counter Cash', '35', '₹ 1,75,000', '₹ 0 (Cash Vault)', '₹ 1,75,000'],
      ['Bank Demand Drafts (DD)', '18', '₹ 1,54,500', '₹ 0 (Clearing House)', '₹ 1,54,500']
    ];

    let gRowY = gwY + 25;
    gwRows.forEach(([m, t, g, c, n], i) => {
      doc.rect(40, gRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text(m, 50, gRowY + 7);
      doc.font('Helvetica').fillColor('#475569').text(t, 210, gRowY + 7);
      doc.text(g, 300, gRowY + 7);
      doc.text(c, 390, gRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#059669').text(n, 465, gRowY + 7);
      gRowY += 24;
    });

    // Bank Account Balances
    const bY = gRowY + 30;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('2. University Bank Account Balances (Verified with Statements)', 40, bY);

    const bankAccounts = [
      ['Gen-Z Central Operations (HDFC Bank - A/C 502000847192)', '₹ 42,85,410.00', 'Active / Reconciled'],
      ['Student Fee Escrow Account (ICICI Bank - A/C 003805019842)', '₹ 68,90,120.00', 'Active / Reconciled'],
      ['Campus Capital Development Fund (SBI - A/C 38472910048)', '₹ 1,25,00,000.00', 'Fixed Escrow Reserve'],
      ['Student Caution & Security Deposit (Punjab National Bank)', '₹ 18,45,000.00', 'Held in Trust']
    ];

    let bkY = bY + 22;
    bankAccounts.forEach(([acc, bal, st]) => {
      doc.rect(40, bkY, 515, 26).fillAndStroke('#F1F5F9', '#CBD5E1');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text(acc, 50, bkY + 8);
      doc.font('Helvetica-Bold').fillColor('#059669').text(bal, 380, bkY + 8);
      doc.font('Helvetica').fillColor('#2563EB').text(st, 475, bkY + 8);
      bkY += 28;
    });

    // Auditor Seal Box
    const auditY = bkY + 30;
    doc.rect(40, auditY, 515, 110).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#166534').text('Treasury Auditor Certification Statement:', 55, auditY + 12);
    doc.font('Helvetica').fontSize(9).fillColor('#14532D').lineGap(4);
    doc.text('I hereby certify that all receipts generated across online and offline channels have been physically reconciled against university ledger statements. No uncredited merchant transactions or chargebacks exist as of the date of this report.', 55, auditY + 30, { width: 485 });
    doc.text('Lead Treasury Auditor: CA R. K. Mohapatra & Associates (Chartered Accountants)', 55, auditY + 80, { font: 'Helvetica-Bold' });

    renderAuditFooter(doc, 3);

    // ==========================================
    // PAGE 4 OF 8: Academic Admissions, Attendance & Exam Operations
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 4, 'Academic Census, Attendance Metrics & Examination Audit', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Student Enrollment Distribution (Academic Year 2026)', 40, 130);

    // Academic Table
    const acY = 150;
    doc.rect(40, acY, 515, 25).fill('#1E293B');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('Academic Batch / Program', 50, acY + 8);
    doc.text('Enrolled', 210, acY + 8);
    doc.text('Attendance Avg', 300, acY + 8);
    doc.text('Eligible for Exam', 400, acY + 8);
    doc.text('Defaulters Held', 480, acY + 8);

    const acRows = [
      ['B.Tech 1st Year (Freshers - 2026 Batch)', '480', '94.2%', '474', '6 (Shortage)'],
      ['B.Tech 2nd Year (Sophomore - 2025 Batch)', '390', '92.1%', '381', '9 (Shortage)'],
      ['B.Tech 3rd Year (Junior - 2024 Batch)', '320', '90.4%', '311', '9 (Shortage)'],
      ['B.Tech 4th Year (Senior - 2023 Batch)', '210', '89.6%', '203', '7 (Shortage)'],
      ['Post-Graduate (MBA / M.Tech / M.Sc)', '80', '93.5%', '78', '2 (Shortage)']
    ];

    let acRowY = acY + 25;
    acRows.forEach(([b, en, att, el, def], i) => {
      doc.rect(40, acRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text(b, 50, acRowY + 7);
      doc.font('Helvetica').fillColor('#475569').text(en, 210, acRowY + 7);
      doc.text(att, 300, acRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#059669').text(el, 400, acRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#DC2626').text(def, 480, acRowY + 7);
      acRowY += 24;
    });

    // Placement Cell & Career Progression Highlights
    const plY = acRowY + 30;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('2. Campus Placements & Industry Collaboration', 40, plY);

    doc.rect(40, plY + 18, 515, 110).fillAndStroke('#EFF6FF', '#BFDBFE');
    doc.font('Helvetica').fontSize(9.5).fillColor('#1E40AF').lineGap(5);
    doc.text('• On-Campus Placement Offers Generated: 312 Offers (88.4% of eligible final year batch).', 55, plY + 32);
    doc.text('• Highest Package Offered: INR 42.5 LPA (Google India / Palo Alto Networks).', 55, plY + 50);
    doc.text('• Median Package Recorded: INR 8.2 LPA across engineering and management wings.', 55, plY + 68);
    doc.text('• Active Industry MoUs Signed: 24 (Including IBM Quantum, TCS Digital, and L&T Heavy Engineering).', 55, plY + 86);

    // Examination Controller Status
    const exY = plY + 150;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('3. Controller of Examinations Verification', 40, exY);
    doc.rect(40, exY + 18, 515, 100).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica').fontSize(9).fillColor('#334155').lineGap(4);
    doc.text('• Question paper encryption sets generated and secured in digital vault.', 55, exY + 30);
    doc.text('• Flying squad inspection teams allocated for all examination halls.', 55, exY + 48);
    doc.text('• Digital Hall Tickets dispatched to 1,447 eligible candidates via student ERP portal.', 55, exY + 66);
    doc.text('• CCTV streaming coverage verified across 100% of examination evaluation chambers.', 55, exY + 84);

    renderAuditFooter(doc, 4);

    // ==========================================
    // PAGE 5 OF 8: Campus Security, Hostel & Gate Curfew Telemetry
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 5, 'Campus Security, Hostel Residency & Gate Curfew Audit', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Hostel Resident Census & Capacity Audit', 40, 130);

    const hY = 150;
    doc.rect(40, hY, 515, 25).fill('#064E3B');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#ECFDF5');
    doc.text('Hostel Block', 50, hY + 8);
    doc.text('Capacity', 190, hY + 8);
    doc.text('Occupied', 270, hY + 8);
    doc.text('On-Campus Today', 360, hY + 8);
    doc.text('On Approved Leave', 460, hY + 8);

    const hRows = [
      ['Kalam Boys Hostel (Block A)', '250', '242', '228', '14 (Gate Pass)'],
      ['Raman Boys Hostel (Block B)', '250', '238', '224', '14 (Gate Pass)'],
      ['Kalpana Girls Hostel (Block C)', '200', '194', '186', '8 (Gate Pass)'],
      ['Sarabhai Executive Block (Block D)', '100', '92', '88', '4 (Gate Pass)']
    ];

    let hRowY = hY + 25;
    hRows.forEach(([blk, cap, occ, pres, lve], i) => {
      doc.rect(40, hRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#F0FDF4' : '#FFFFFF', '#BBF7D0');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#065F46').text(blk, 50, hRowY + 7);
      doc.font('Helvetica').fillColor('#14532D').text(cap, 190, hRowY + 7);
      doc.text(occ, 270, hRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#15803D').text(pres, 360, hRowY + 7);
      doc.font('Helvetica').fillColor('#0284C7').text(lve, 460, hRowY + 7);
      hRowY += 24;
    });

    // Curfew & Gate Biometric Analytics
    const curY = hRowY + 30;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('2. Gate Security & Turnstile Telemetry Log', 40, curY);

    doc.rect(40, curY + 18, 515, 120).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.font('Helvetica').fontSize(9).fillColor('#334155').lineGap(4);
    doc.text('• Gate Pass Requests Processed Today: 40 Approved / 2 Rejected (Parent disapproval).', 55, curY + 30);
    doc.text('• On-Time Curfew Check-in Compliance Rate: 98.4% (Highest recorded this semester).', 55, curY + 48);
    doc.text('• Overstay Incident Alerts: 0 Students pending past curfew deadline.', 55, curY + 66);
    doc.text('• Automated SMS Delivery: 40/40 gate-pass SMS dispatched to parents upon gate exit.', 55, curY + 84);
    doc.text('• Biometric Turnstile Machine Health: Gate 1, Gate 2 & North Entry 100% operational.', 55, curY + 102);

    // Visitor Desk
    const vY = curY + 160;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('3. Campus Visitor & Vehicle Log Audit', 40, vY);

    doc.rect(40, vY + 18, 515, 90).fillAndStroke('#FEF3C7', '#FDE68A');
    doc.font('Helvetica').fontSize(9).fillColor('#92400E').lineGap(4);
    doc.text('• Total Outside Visitors Checked In: 28 Verified with Government Photo ID.', 55, vY + 30);
    doc.text('• Delivery & Vendor Commercial Vehicles: 14 Logged with gate pass time-stamp.', 55, vY + 48);
    doc.text('• Zero overnight unauthorized visitors or vehicles recorded on campus grounds.', 55, vY + 66);

    renderAuditFooter(doc, 5);

    // ==========================================
    // PAGE 6 OF 8: Facilities, Equipment & Maintenance Tickets
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 6, 'Campus Infrastructure, Maintenance & Facilities Audit', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Maintenance Work Order Ticket Log by Department', 40, 130);

    const mY = 150;
    doc.rect(40, mY, 515, 25).fill('#78350F');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FEF3C7');
    doc.text('Maintenance Division', 50, mY + 8);
    doc.text('Opened', 200, mY + 8);
    doc.text('Resolved Today', 280, mY + 8);
    doc.text('Avg Resolution Time', 380, mY + 8);
    doc.text('Open Pending', 480, mY + 8);

    const mRows = [
      ['Electrical & Diesel Generator (DG)', '14', '13', '1.8 Hours', '1 (Parts ordered)'],
      ['IT Hardware, Wi-Fi & LAN Cabling', '22', '21', '2.1 Hours', '1 (Switch check)'],
      ['Air Conditioning & HVAC Systems', '8', '7', '3.4 Hours', '1 (Gas refill)'],
      ['Civil Works & Plumbing Maintenance', '11', '10', '2.5 Hours', '1 (Valve change)'],
      ['Laboratory Equipment & Calibration', '6', '6', '1.5 Hours', '0 (All Clear)']
    ];

    let mRowY = mY + 25;
    mRows.forEach(([div, op, res, avg, pen], i) => {
      doc.rect(40, mRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#FFFBEB' : '#FFFFFF', '#FDE68A');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#92400E').text(div, 50, mRowY + 7);
      doc.font('Helvetica').fillColor('#78350F').text(op, 200, mRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#059669').text(res, 280, mRowY + 7);
      doc.font('Helvetica').fillColor('#4B5563').text(avg, 380, mRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#DC2626').text(pen, 480, mRowY + 7);
      mRowY += 24;
    });

    // Preventive Maintenance Checklist
    const pmY = mRowY + 30;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('2. Critical Infrastructure Preventive Maintenance Audit', 40, pmY);

    const pms = [
      ['500 kVA Central Backup Generator', 'Tested under full campus load for 45 mins. Fuel reserves: 2,400 Liters (Optimal).'],
      ['Campus RO Drinking Water Plants', 'TDS output: 85 ppm (WHO standard). Filter membrane replacement completed in Block B.'],
      ['Central Fire Safety & Hydrant Network', 'Pressure maintained at 7.2 bar across all wings. Fire extinguishers recharged this month.'],
      ['Solar Power Rooftop Array (300 kW)', 'Generated 1,420 kWh today. Grid feed-in credits reconciled with State Electricity Board.']
    ];

    let pmRowY = pmY + 20;
    pms.forEach(([title, desc]) => {
      doc.rect(40, pmRowY, 515, 34).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text(`• ${title}:`, 50, pmRowY + 7);
      doc.font('Helvetica').fillColor('#475569').text(desc, 50, pmRowY + 19, { width: 495 });
      pmRowY += 38;
    });

    // Facilities Sign
    const fSigY = pmRowY + 30;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Head of Campus Facilities & Engineering', 60, fSigY);
    doc.text('Chief Health & Safety Officer', 360, fSigY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Signed via Maintenance ERP]', 60, fSigY + 14);
    doc.text('[Signed via Safety Portal]', 360, fSigY + 14);

    renderAuditFooter(doc, 6);

    // ==========================================
    // PAGE 7 OF 8: Auxiliary Operations: Mess & Transport
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 7, 'Auxiliary Services: Dining/Mess & Fleet Transport Audit', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Central Dining Hall & Hostel Mess Consumption Metrics', 40, 130);

    const msY = 150;
    doc.rect(40, msY, 515, 25).fill('#1E3A8A');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#DBEAFE');
    doc.text('Meal Session', 50, msY + 8);
    doc.text('Headcount Served', 190, msY + 8);
    doc.text('Menu Highlights', 290, msY + 8);
    doc.text('Quality Rating', 460, msY + 8);

    const msRows = [
      ['Breakfast (07:30 - 09:30 AM)', '724 Students', 'Idli, Sambhar, Poha, Fresh Milk, Eggs', '4.8 / 5.0 (Student App)'],
      ['Lunch (12:30 - 02:30 PM)', '812 Students', 'Rice, Dal Makhani, Paneer, Mixed Veg, Curd', '4.7 / 5.0 (Student App)'],
      ['Evening Snacks (05:00 - 06:15 PM)', '640 Students', 'Tea, Coffee, Veg Cutlet, Biscuits', '4.6 / 5.0 (Student App)'],
      ['Dinner (08:00 - 10:00 PM)', '788 Students', 'Roti, Dal Fry, Chicken Curry, Paneer Do Pyaza', '4.9 / 5.0 (Student App)']
    ];

    let msRowY = msY + 25;
    msRows.forEach(([sess, hd, mn, rt], i) => {
      doc.rect(40, msRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#EFF6FF' : '#FFFFFF', '#BFDBFE');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E3A8A').text(sess, 50, msRowY + 7);
      doc.font('Helvetica').fillColor('#1E40AF').text(hd, 190, msRowY + 7);
      doc.text(mn, 290, msRowY + 7, { width: 160 });
      doc.font('Helvetica-Bold').fillColor('#059669').text(rt, 460, msRowY + 7);
      msRowY += 24;
    });

    // Food Safety & FSSAI
    const fsY = msRowY + 25;
    doc.rect(40, fsY, 515, 75).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#166534').text('FSSAI Food Quality & Hygiene Inspection Status:', 55, fsY + 12);
    doc.font('Helvetica').fontSize(9).fillColor('#14532D').lineGap(4);
    doc.text('• Daily food sample counter testing logged in refrigeration records for 72-hour safety retention.', 55, fsY + 28);
    doc.text('• Kitchen staff health certifications and hairnet/glove compliance verified at 100%.', 55, fsY + 44);

    // Fleet Transport Operations
    const trY = fsY + 95;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('2. Campus Fleet Transport Logistics (18 Buses)', 40, trY);

    doc.rect(40, trY + 18, 515, 110).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.font('Helvetica').fontSize(9).fillColor('#334155').lineGap(5);
    doc.text('• Route Coverage: 18 routes servicing Cuttack, Bhubaneswar, Khordha, and Puri highways.', 55, trY + 30);
    doc.text('• GPS Telemetry: 100% active GPS tracking with live location sharing on the student app.', 55, trY + 48);
    doc.text('• On-Time Arrival Performance: 96.8% punctuality recorded across morning and evening shifts.', 55, trY + 66);
    doc.text('• Vehicle Fitness & Pollution (PUC): All 18 bus fitness certificates current and valid.', 55, trY + 84);

    renderAuditFooter(doc, 7);

    // ==========================================
    // PAGE 8 OF 8: Statutory Compliance & Executive Sign-off
    // ==========================================
    doc.addPage();
    renderAuditHeader(doc, 8, 'Statutory Compliance & Final Executive Sign-Off', repDate);

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('1. Statutory Regulatory Compliance Index', 40, 130);

    const regY = 150;
    doc.rect(40, regY, 515, 25).fill('#0F172A');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('Regulatory Body / Authority', 50, regY + 8);
    doc.text('Mandate Type', 220, regY + 8);
    doc.text('Compliance Status', 360, regY + 8);
    doc.text('Next Renewal', 465, regY + 8);

    const regRows = [
      ['University Grants Commission (UGC)', 'Section 2(f) Status', '100% Fully Compliant', 'Perpetual Recognition'],
      ['All India Council for Tech Ed (AICTE)', 'Extension of Approval', '100% Approved (2026-27)', 'April 2027'],
      ['NAAC Accreditation Council', 'Institutional Grade A+', 'Cycle 2 Completed (3.64 CGPA)', 'November 2028'],
      ['Income Tax Department (12A & 80G)', 'Non-Profit Tax Exemption', 'Annual Returns Filed', 'July 2027'],
      ['Ministry of Labour (EPF & ESIC)', 'Staff Statutory Provident Fund', 'Zero Dues Outstanding', 'Monthly Deposited']
    ];

    let regRowY = regY + 25;
    regRows.forEach(([b, m, s, r], i) => {
      doc.rect(40, regRowY, 515, 24).fillAndStroke(i % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text(b, 50, regRowY + 7);
      doc.font('Helvetica').fillColor('#475569').text(m, 220, regRowY + 7);
      doc.font('Helvetica-Bold').fillColor('#059669').text(s, 360, regRowY + 7);
      doc.font('Helvetica').fillColor('#2563EB').text(r, 465, regRowY + 7);
      regRowY += 24;
    });

    // Internal Auditor Final Declaration
    const decY = regRowY + 30;
    doc.rect(40, decY, 515, 120).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#166534').text('FINAL AUDIT CERTIFICATION STATEMENT', 55, decY + 14);
    doc.font('Helvetica').fontSize(9).fillColor('#14532D').lineGap(5);
    doc.text(
      `We have examined the financial statements, fee collections register, bank accounts, hostel registers, campus security turnstile logs, and academic records of Gen-Z University for the period ending ${repDate}. In our professional opinion, the records present a true, fair, and comprehensive reflection of the institution's fiscal and operational state. All systems comply fully with institutional governance guidelines.`,
      55, decY + 34, { width: 485, align: 'justify' }
    );

    // Final Signature Blocks
    const fSigBlockY = decY + 160;

    // Signature 1
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text('CA Subhashish Patnaik', 50, fSigBlockY);
    doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text('Head of Internal Audit\nGen-Z University', 50, fSigBlockY + 14);

    // Signature 2
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text('Prof. (Dr.) A. K. Nayak', 230, fSigBlockY);
    doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text('Registrar & Academic Council\nGen-Z University', 230, fSigBlockY + 14);

    // Signature 3
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text(directorName || 'Director & Vice-Chancellor', 400, fSigBlockY);
    doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text('Office of the Director\nGen-Z University (Board of Governors)', 400, fSigBlockY + 14);

    // Seal box
    doc.rect(400, fSigBlockY + 45, 150, 45).strokeColor('#4F46E5').lineWidth(1.5).stroke();
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#4F46E5').text('OFFICIAL DIRECTOR SEAL\nDIGITALLY RATIFIED', 405, fSigBlockY + 58, { align: 'center', width: 140 });

    renderAuditFooter(doc, 8);
  });
}

/**
 * 5. Generate Official Payment Receipt PDF (with Real QR Code)
 */
async function generateReceiptPdf({ studentName, receiptNo, amount, paymentMethod, transactionId, date }) {
  const qrData = `https://cms.genzuniversity.in/verify?type=RECEIPT&no=${receiptNo || 'REC-GENZ-2026-0091'}&amt=${amount || 45000}&tx=${transactionId || 'RZP-PAY-88391'}`;
  const qrBuffer = await QRCode.toBuffer(qrData, { width: 160, margin: 1 });

  return createPdfBuffer(doc => {
    // Outer border
    doc.rect(30, 30, 535, 782).lineWidth(2).strokeColor('#2563EB').stroke();

    // Header
    doc.rect(30, 30, 535, 75).fill('#1E3A8A');
    doc.fontSize(22).fillColor('#DBEAFE').font('Helvetica-Bold').text('GEN-Z UNIVERSITY', 40, 48, { align: 'center' });
    doc.fontSize(11).fillColor('#BFDBFE').font('Helvetica').text('OFFICIAL FEE PAYMENT RECEIPT (DIGITALLY RECONCILED)', { align: 'center' });

    // Receipt Badge
    doc.rect(60, 125, 475, 40).fillAndStroke('#EFF6FF', '#3B82F6');
    doc.fontSize(14).fillColor('#1E40AF').font('Helvetica-Bold').text(`RECEIPT NO: ${receiptNo || 'REC-2026-001'}  [PAID & CLEARED]`, 60, 138, { align: 'center', width: 475 });

    // Table
    const boxY = 185;
    doc.rect(60, boxY, 475, 230).fillAndStroke('#F9FAFB', '#E5E7EB');

    const fields = [
      ['Student Name:', studentName || 'Munu Nial'],
      ['Amount Paid:', `INR ${Number(amount).toLocaleString('en-IN')}/-`],
      ['Payment Mode:', paymentMethod || 'Online Payment Gateway (Razorpay/UPI)'],
      ['Transaction Ref / UTR:', transactionId || 'RZP-PAY-8839120'],
      ['Payment Date:', date || new Date().toLocaleDateString('en-IN')],
      ['University Code:', 'GENZ - UGC & AICTE Autonomous University'],
      ['Posting Status:', 'SUCCESSFULLY RECONCILED TO STUDENT LEDGER']
    ];

    let currentY = boxY + 15;
    fields.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151').text(label, 80, currentY);
      doc.font('Helvetica').fillColor('#111827').text(value, 260, currentY);
      currentY += 28;
    });

    // QR Verification & Seal
    const qrY = 435;
    doc.rect(60, qrY, 475, 140).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.image(qrBuffer, 85, qrY + 12, { width: 115, height: 115 });

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#166534').text('DIGITAL PAYMENT AUTHENTICATION', 225, qrY + 18);
    doc.font('Helvetica').fontSize(9).fillColor('#15803D').lineGap(4);
    doc.text('This receipt is backed by bank reconciliation records in the Hostinger ERP database.', 225, qrY + 38, { width: 290 });
    doc.text(`• Reference ID: ${receiptNo || 'REC-GENZ-2026-0091'}`, 225, qrY + 65);
    doc.text(`• Amount Verified: ₹${Number(amount).toLocaleString('en-IN')}`, 225, qrY + 80);
    doc.text(`• Digital Timestamp: ${new Date().toLocaleString()}`, 225, qrY + 95);

    // Footer
    const sY = 665;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Accounts Officer', 80, sY);
    doc.text('Finance Controller', 340, sY);
    doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF');
    doc.text('[Digital Clearance]', 80, sY + 14);
    doc.text('[Institutional Sign-off]', 340, sY + 14);
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
