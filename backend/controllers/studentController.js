/**
 * Student Financial Portal Controller
 * Gen-Z University Accounts System
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { getStudentBalance } = require('../services/ledgerService');
const { logAudit } = require('../services/auditService');

/**
 * Get Student Profile
 * GET /api/student/profile
 */
async function getProfile(req, res) {
  const studentId = req.user.studentId;

  try {
    const [rows] = await query(
      `SELECT s.*,
              c.name AS course_name, c.code AS course_code,
              b.name AS branch_name, b.code AS branch_code,
              sem.label AS semester_label, sem.semester_number,
              a.name AS session_name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN courses c ON s.course_id = c.id
       JOIN branches b ON s.branch_id = b.id
       JOIN semesters sem ON s.current_semester_id = sem.id
       JOIN academic_sessions a ON s.academic_session_id = a.id
       WHERE s.id = ? LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return error(res, 'Student profile not found.', 404);
    }

    return success(res, rows[0], 'Profile retrieved.');
  } catch (err) {
    console.error('getProfile error:', err);
    return error(res, 'Unable to load profile data.', 500);
  }
}

/**
 * Student Dashboard Summary
 * GET /api/student/dashboard
 */
async function getDashboard(req, res) {
  const studentId = req.user.studentId;

  try {
    // 1. Financial balance stats
    const balance = await getStudentBalance(studentId);

    // 2. Pending invoices
    const [pendingInvoices] = await query(
      `SELECT id, invoice_no, subtotal, total_payable, paid_amount, outstanding_amount, due_date, status
       FROM invoices
       WHERE student_id = ? AND status IN ('ISSUED', 'PARTIALLY_PAID', 'OVERDUE')
       ORDER BY due_date ASC LIMIT 5`,
      [studentId]
    );

    // 3. Recent successful payments
    const [recentPayments] = await query(
      `SELECT p.id, p.payment_no, p.amount, p.payment_method, p.transaction_id, p.status, p.created_at,
              r.receipt_no
       FROM payments p
       LEFT JOIN receipts r ON r.payment_id = p.id
       WHERE p.student_id = ?
       ORDER BY p.created_at DESC LIMIT 5`,
      [studentId]
    );

    // 4. Upcoming dues (due within 15 days)
    const [upcomingDues] = await query(
      `SELECT id, description, outstanding_amount, due_date
       FROM student_fee_ledgers
       WHERE student_id = ? AND outstanding_amount > 0 
         AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)
       ORDER BY due_date ASC`,
      [studentId]
    );

    // 5. Unread notifications count
    const [notifCount] = await query(
      `SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    return success(
      res,
      {
        balance,
        pendingInvoices,
        recentPayments,
        upcomingDues,
        unreadNotifications: (notifCount && notifCount[0]) ? notifCount[0].unread_count : 0
      },
      'Dashboard data loaded.'
    );
  } catch (err) {
    console.error('getDashboard error:', err);
    return error(res, 'Unable to load dashboard data. Please try again.', 500);
  }
}

/**
 * Student Fee Ledger
 * GET /api/student/ledger
 */
async function getLedger(req, res) {
  const studentId = req.user.studentId;

  try {
    const [entries] = await query(
      `SELECT l.id, l.academic_session_id, l.semester_id, l.description,
              fc.name AS fee_category, fc.code AS category_code,
              l.amount_charged, l.scholarship_amount, l.discount_amount, l.fine_amount,
              l.adjustment_amount, l.amount_paid, l.outstanding_amount, l.due_date,
              l.status, l.created_at, l.updated_at,
              inv.invoice_no, sem.label AS semester_label, a.name AS session_name
       FROM student_fee_ledgers l
       JOIN fee_categories fc ON l.fee_category_id = fc.id
       JOIN semesters sem ON l.semester_id = sem.id
       JOIN academic_sessions a ON l.academic_session_id = a.id
       LEFT JOIN invoices inv ON l.invoice_id = inv.id
       WHERE l.student_id = ?
       ORDER BY l.academic_session_id DESC, l.semester_id DESC, l.id ASC`,
      [studentId]
    );

    const balance = await getStudentBalance(studentId);

    return success(res, { balance, ledger: entries }, 'Fee ledger retrieved.');
  } catch (err) {
    console.error('getLedger error:', err);
    return error(res, 'Unable to load your fee ledger. Please try again.', 500);
  }
}

/**
 * Student Invoices
 * GET /api/student/invoices
 */
async function getInvoices(req, res) {
  const studentId = req.user.studentId;

  try {
    const [invoices] = await query(
      `SELECT i.id, i.invoice_no, i.subtotal, i.discount_amount, i.fine_amount,
              i.total_payable, i.paid_amount, i.outstanding_amount, i.due_date,
              i.status, i.notes, i.created_at,
              sem.label AS semester_label, a.name AS session_name
       FROM invoices i
       JOIN semesters sem ON i.semester_id = sem.id
       JOIN academic_sessions a ON i.academic_session_id = a.id
       WHERE i.student_id = ?
       ORDER BY i.created_at DESC`,
      [studentId]
    );

    return success(res, invoices, 'Invoices retrieved.');
  } catch (err) {
    console.error('getInvoices error:', err);
    return error(res, 'Unable to load invoices.', 500);
  }
}

/**
 * Single Invoice Details with Line Items
 * GET /api/student/invoices/:id
 */
async function getInvoiceById(req, res) {
  const studentId = req.user.studentId;
  const invoiceId = parseInt(req.params.id, 10);

  try {
    const [invoiceRows] = await query(
      `SELECT i.*, sem.label AS semester_label, a.name AS session_name,
              s.reg_no, s.full_name, b.name AS branch_name, c.name AS course_name
       FROM invoices i
       JOIN students s ON i.student_id = s.id
       JOIN branches b ON s.branch_id = b.id
       JOIN courses c ON s.course_id = c.id
       JOIN semesters sem ON i.semester_id = sem.id
       JOIN academic_sessions a ON i.academic_session_id = a.id
       WHERE i.id = ? AND i.student_id = ? LIMIT 1`,
      [invoiceId, studentId]
    );

    if (invoiceRows.length === 0) {
      return error(res, 'Invoice not found or access restricted.', 404);
    }

    const invoice = invoiceRows[0];

    const [items] = await query(
      `SELECT it.id, it.description, it.amount, it.paid_amount, fc.name AS category_name, fc.code AS category_code
       FROM invoice_items it
       JOIN fee_categories fc ON it.fee_category_id = fc.id
       WHERE it.invoice_id = ?`,
      [invoiceId]
    );

    invoice.items = items;
    return success(res, invoice, 'Invoice details loaded.');
  } catch (err) {
    console.error('getInvoiceById error:', err);
    return error(res, 'Unable to load invoice details.', 500);
  }
}

/**
 * Student Payment History
 * GET /api/student/payments
 */
async function getPayments(req, res) {
  const studentId = req.user.studentId;

  try {
    const [payments] = await query(
      `SELECT p.id, p.payment_no, p.amount, p.payment_method, p.transaction_id,
              p.status, p.created_at, p.verified_at,
              i.invoice_no, r.receipt_no, r.id AS receipt_id
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN receipts r ON r.payment_id = p.id
       WHERE p.student_id = ?
       ORDER BY p.created_at DESC`,
      [studentId]
    );

    return success(res, payments, 'Payment history retrieved.');
  } catch (err) {
    console.error('getPayments error:', err);
    return error(res, 'Unable to load payment history.', 500);
  }
}

/**
 * Student Receipts List
 * GET /api/student/receipts
 */
async function getReceipts(req, res) {
  const studentId = req.user.studentId;

  try {
    const [receipts] = await query(
      `SELECT r.id, r.receipt_no, r.amount_paid,
              r.amount_paid AS receipt_amount,
              r.amount_paid AS amount,
              r.payment_method, r.transaction_id,
              r.issued_date,
              r.issued_date AS receipt_date,
              i.invoice_no, p.payment_no,
              COALESCE(sem.label, '1st Semester') AS semester,
              0 AS discount_amount
       FROM receipts r
       JOIN invoices i ON r.invoice_id = i.id
       JOIN payments p ON r.payment_id = p.id
       LEFT JOIN semesters sem ON i.semester_id = sem.id
       WHERE r.student_id = ?
       ORDER BY r.issued_date DESC, r.id DESC`,
      [studentId]
    );

    return success(res, receipts, 'Receipts retrieved.');
  } catch (err) {
    console.error('getReceipts error:', err);
    return error(res, 'Unable to load receipts.', 500);
  }
}

/**
 * Single Digital Receipt for Printing / Download
 * GET /api/student/receipts/:id
 */
async function getReceiptById(req, res) {
  const studentId = req.user.studentId;
  const receiptId = parseInt(req.params.id, 10);

  try {
    const [receiptRows] = await query(
      `SELECT r.*, s.reg_no, s.full_name, b.name AS branch_name, c.name AS course_name,
              sem.label AS semester_label, a.name AS session_name, i.invoice_no
       FROM receipts r
       JOIN students s ON r.student_id = s.id
       JOIN branches b ON s.branch_id = b.id
       JOIN courses c ON s.course_id = c.id
       JOIN invoices i ON r.invoice_id = i.id
       JOIN semesters sem ON i.semester_id = sem.id
       JOIN academic_sessions a ON i.academic_session_id = a.id
       WHERE r.id = ? AND r.student_id = ? LIMIT 1`,
      [receiptId, studentId]
    );

    if (receiptRows.length === 0) {
      return error(res, 'Receipt not found or access restricted.', 404);
    }

    const receipt = receiptRows[0];
    if (typeof receipt.receipt_data_json === 'string') {
      try {
        receipt.receipt_data_json = JSON.parse(receipt.receipt_data_json);
      } catch (e) {}
    }

    return success(res, receipt, 'Receipt loaded.');
  } catch (err) {
    console.error('getReceiptById error:', err);
    return error(res, 'Unable to load digital receipt.', 500);
  }
}

/**
 * Submit Payment / Refund / Adjustment Request
 * POST /api/student/requests
 */
async function submitRequest(req, res) {
  const studentId = req.user.studentId;
  const { requestType, invoiceId, amount, reason } = req.body;

  if (!requestType || !reason) {
    return error(res, 'Request type and detailed reason are required.', 400);
  }

  try {
    if (requestType === 'REFUND') {
      const refundAmount = parseFloat(amount);
      if (!refundAmount || refundAmount <= 0) {
        return error(res, 'A valid refund amount must be specified.', 400);
      }

      // Verify student paid on this invoice
      const [paymentRows] = await query(
        `SELECT id FROM payments WHERE invoice_id = ? AND student_id = ? AND status = 'SUCCESS' LIMIT 1`,
        [invoiceId, studentId]
      );

      if (paymentRows.length === 0) {
        return error(res, 'No verified payment found for this invoice to refund.', 400);
      }

      const paymentId = paymentRows[0].id;
      const refundNo = `REF-${Date.now().toString().slice(-6)}`;

      await query(
        `INSERT INTO refunds (refund_no, payment_id, student_id, invoice_id, amount, reason, status, requested_by)
         VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED', ?)`,
        [refundNo, paymentId, studentId, invoiceId, refundAmount, reason, req.user.id]
      );

      await logAudit({
        userId: req.user.id,
        role: req.user.role,
        action: 'SUBMIT_REFUND_REQUEST',
        module: 'REFUND',
        reason,
        ipAddress: req.ip
      });

      return success(res, { refundNo }, 'Refund request submitted for Accounts Head approval.');
    } else {
      // Fee adjustment or scholarship request
      await query(
        `INSERT INTO adjustments (student_id, invoice_id, fee_category_id, adjustment_type, amount, reason, status, requested_by)
         VALUES (?, ?, 1, 'CREDIT', ?, ?, 'PENDING', ?)`,
        [studentId, invoiceId || null, parseFloat(amount || 0), reason, req.user.id]
      );

      return success(res, null, 'Fee adjustment request submitted for review.');
    }
  } catch (err) {
    console.error('submitRequest error:', err);
    return error(res, 'Unable to submit your request at this time.', 500);
  }
}

/**
 * Student In-Portal Notifications
 * GET /api/student/notifications
 */
async function getNotifications(req, res) {
  try {
    const [rows] = await query(
      `SELECT id, title, message, category, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );

    return success(res, rows, 'Notifications retrieved.');
  } catch (err) {
    console.error('getNotifications error:', err);
    return error(res, 'Unable to load notifications.', 500);
  }
}

/**
 * Get Student Health & Medical Record
 * GET /api/student/health
 */
async function getHealth(req, res) {
  const studentId = req.user.studentId;

  try {
    const [rows] = await query(
      `SELECT shr.*, s.full_name, s.roll_no, s.reg_no, s.phone, s.parent_name, s.parent_phone
       FROM students s
       LEFT JOIN student_health_records shr ON s.id = shr.student_id
       WHERE s.id = ? LIMIT 1`,
      [studentId]
    );

    if (rows.length === 0) {
      return error(res, 'Student not found.', 404);
    }

    const data = rows[0];
    const result = {
      blood_group: data.blood_group || 'B+',
      medical_conditions: data.medical_conditions || '',
      allergies: data.allergies || '',
      emergency_contact_name: data.emergency_contact_name || data.parent_name || '',
      emergency_contact_phone: data.emergency_contact_phone || data.parent_phone || data.phone || '',
      emergency_contact_relation: data.emergency_contact_relation || 'Parent / Guardian',
      vaccination_status: data.vaccination_status || 'Fully Vaccinated',
      special_medical_needs: data.special_medical_needs || '',
      medical_fitness_status: data.medical_fitness_status || 'Certified Fit',
      insurance_policy_no: data.insurance_policy_no || ('BPUT-STU-MED-' + (data.reg_no || studentId)),
      emergency_health_center: 'GENZ Campus Health Center: 108 / 0674-2970000',
      last_updated_at: data.updated_at || data.created_at || new Date()
    };

    return success(res, result, 'Student health record retrieved.');
  } catch (err) {
    console.error('getHealth error:', err);
    return error(res, 'Unable to load health record.', 500);
  }
}

/**
 * Update Student Health & Medical Record
 * POST /api/student/health
 */
async function updateHealth(req, res) {
  const studentId = req.user.studentId;
  const {
    blood_group,
    medical_conditions,
    allergies,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relation,
    vaccination_status,
    special_medical_needs,
    insurance_policy_no
  } = req.body;

  try {
    await query(
      `INSERT INTO student_health_records (
        student_id, blood_group, medical_conditions, allergies,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        vaccination_status, special_medical_needs, insurance_policy_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        blood_group = VALUES(blood_group),
        medical_conditions = VALUES(medical_conditions),
        allergies = VALUES(allergies),
        emergency_contact_name = VALUES(emergency_contact_name),
        emergency_contact_phone = VALUES(emergency_contact_phone),
        emergency_contact_relation = VALUES(emergency_contact_relation),
        vaccination_status = VALUES(vaccination_status),
        special_medical_needs = VALUES(special_medical_needs),
        insurance_policy_no = VALUES(insurance_policy_no),
        updated_at = CURRENT_TIMESTAMP`,
      [
        studentId,
        blood_group || 'B+',
        medical_conditions || '',
        allergies || '',
        emergency_contact_name || '',
        emergency_contact_phone || '',
        emergency_contact_relation || 'Parent',
        vaccination_status || 'Fully Vaccinated',
        special_medical_needs || '',
        insurance_policy_no || ''
      ]
    );

    await logAudit(
      req.user.id,
      'STUDENT_HEALTH_UPDATE',
      'STUDENT',
      studentId,
      { blood_group, vaccination_status, emergency_contact_phone }
    );

    return success(res, null, 'Health & Medical details successfully updated.');
  } catch (err) {
    console.error('updateHealth error:', err);
    return error(res, 'Failed to update health record.', 500);
  }
}

/**
 * Submit Education Loan Assistance Request
 * POST /api/student/loan-request
 */
async function submitLoanRequest(req, res) {
  const studentId = req.user.studentId;
  const {
    bank_name,
    bank_branch,
    bank_ifsc,
    loan_amount,
    loan_purpose,
    co_applicant_name,
    co_applicant_relation,
    co_applicant_phone,
    co_applicant_income,
    student_remarks
  } = req.body;

  if (!bank_name || !loan_amount) {
    return error(res, 'Bank name and requested loan amount are required.', 400);
  }

  try {
    const [students] = await query(
      `SELECT s.*, 
              c.name AS course_name, 
              b.name AS branch_name, 
              sem.label AS semester_label, 
              a.name AS session_name 
       FROM students s
       JOIN courses c ON s.course_id = c.id
       JOIN branches b ON s.branch_id = b.id
       JOIN semesters sem ON s.current_semester_id = sem.id
       JOIN academic_sessions a ON s.academic_session_id = a.id
       WHERE s.id = ? LIMIT 1`,
      [studentId]
    );

    if (students.length === 0) {
      return error(res, 'Student record not found.', 404);
    }

    const s = students[0];

    const [existing] = await query(
      `SELECT id FROM education_loan_requests WHERE student_id = ? AND status = 'PENDING'`,
      [studentId]
    );

    if (existing.length > 0) {
      return error(res, 'You already have a pending education loan request under Director review.', 400);
    }

    const [result] = await query(
      `INSERT INTO education_loan_requests (
        student_id, reg_no, student_name, father_name, course_name, branch_name,
        current_semester, academic_year, bank_name, bank_branch, bank_ifsc,
        loan_amount, loan_purpose, co_applicant_name, co_applicant_relation,
        co_applicant_phone, co_applicant_income, student_remarks, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        studentId,
        s.reg_no,
        s.full_name,
        s.parent_name || s.father_name || 'Father',
        s.course_name,
        s.branch_name,
        s.semester_label,
        s.session_name || '2026-2027',
        bank_name,
        bank_branch || 'Main Branch',
        bank_ifsc || '',
        parseFloat(loan_amount),
        loan_purpose || 'Tuition & Academic Fees',
        co_applicant_name || s.parent_name || '',
        co_applicant_relation || 'Father',
        co_applicant_phone || s.parent_phone || '',
        co_applicant_income ? parseFloat(co_applicant_income) : 0,
        student_remarks || ''
      ]
    );

    const newId = result.insertId;
    const refNo = `GZU/DIR/LOAN/2026/${String(newId).padStart(4, '0')}`;
    await query(`UPDATE education_loan_requests SET reference_no = ? WHERE id = ?`, [refNo, newId]);

    await logAudit(
      req.user.id,
      'LOAN_REQUEST_SUBMITTED',
      'STUDENT',
      studentId,
      { requestId: newId, bank_name, loan_amount: parseFloat(loan_amount), reference_no: refNo }
    );

    try {
      const [dirUsers] = await query(
        `SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'DIRECTOR'`
      );
      for (const du of dirUsers) {
        await query(
          `INSERT INTO notifications (user_id, title, message, category, is_read) 
           VALUES (?, ?, ?, 'ALERT', 0)`,
          [
            du.id,
            'New Education Loan Application',
            `Student ${s.full_name} (${s.reg_no}) requested education loan for ${bank_name} (₹${parseFloat(loan_amount).toLocaleString('en-IN')}).`
          ]
        );
      }
    } catch (notifErr) {
      console.warn('Could not insert director notification:', notifErr.message);
    }

    return success(
      res,
      { id: newId, reference_no: refNo, status: 'PENDING' },
      'Education loan request successfully forwarded to College Directorate.'
    );
  } catch (err) {
    console.error('submitLoanRequest error:', err);
    return error(res, 'Failed to submit loan request.', 500);
  }
}

/**
 * Get Student's Education Loan Requests
 * GET /api/student/loan-requests
 */
async function getLoanRequests(req, res) {
  const studentId = req.user.studentId;

  try {
    const [requests] = await query(
      `SELECT * FROM education_loan_requests WHERE student_id = ? ORDER BY created_at DESC`,
      [studentId]
    );
    return success(res, requests, 'Loan requests retrieved.');
  } catch (err) {
    console.error('getLoanRequests error:', err);
    return error(res, 'Failed to retrieve loan requests.', 500);
  }
}

/**
 * Get 3 Official Bank Loan Letters
 * GET /api/student/loan-letters/:id
 */
async function getLoanLetters(req, res) {
  const studentId = req.user.studentId;
  const requestId = req.params.id;

  try {
    const [requests] = await query(
      `SELECT * FROM education_loan_requests WHERE id = ? AND student_id = ? LIMIT 1`,
      [requestId, studentId]
    );

    if (requests.length === 0) {
      return error(res, 'Loan request not found.', 404);
    }

    const reqData = requests[0];
    if (reqData.status !== 'APPROVED') {
      return error(res, 'Loan request has not been approved by the Directorate yet. Letters are generated upon approval.', 400);
    }

    const [studentRows] = await query(
      `SELECT s.*, c.name AS course_name, b.name AS branch_name, sem.label AS semester_label, a.name AS session_name
       FROM students s
       JOIN courses c ON s.course_id = c.id
       JOIN branches b ON s.branch_id = b.id
       JOIN semesters sem ON s.current_semester_id = sem.id
       JOIN academic_sessions a ON s.academic_session_id = a.id
       WHERE s.id = ? LIMIT 1`,
      [studentId]
    );
    const s = studentRows[0] || {};

    let totalBilled = 0;
    let totalPaid = 0;
    try {
      const [finRows] = await query(
        `SELECT 
           COALESCE(SUM(total_payable), 0) AS billed,
           COALESCE(SUM(paid_amount), 0) AS paid
         FROM invoices WHERE student_id = ? AND status != 'CANCELLED'`,
        [studentId]
      );
      if (finRows.length > 0) {
        totalBilled = parseFloat(finRows[0].billed) || 0;
        totalPaid = parseFloat(finRows[0].paid) || 0;
      }
    } catch (e) {}

    const courseDuration = s.course_name && s.course_name.toLowerCase().includes('diploma') ? 3 : 4;
    const annualTuition = 55000;
    const annualDev = 12000;
    const annualExam = 6000;
    const annualHostel = 35000;
    const annualTotal = annualTuition + annualDev + annualExam + annualHostel;

    const yearlyBreakdown = [];
    for (let yr = 1; yr <= courseDuration; yr++) {
      yearlyBreakdown.push({
        year_number: yr,
        year_label: `Year ${yr} (Sem ${yr * 2 - 1} & ${yr * 2})`,
        tuition: annualTuition,
        development_lab: annualDev,
        exam_reg: annualExam,
        hostel_mess: annualHostel,
        total: annualTotal
      });
    }

    const institutionalGrandTotal = annualTotal * courseDuration;

    const letters = {
      reference_no: reqData.reference_no,
      approved_at: reqData.approved_at || new Date().toISOString(),
      director_remarks: reqData.director_remarks || 'Recommended and Approved for Bank Education Loan Scheme.',
      university: {
        name: 'GEN-Z UNIVERSITY',
        sub_title: 'Approved by UGC & AICTE | Autonomous Higher Technical Education Institution',
        campus: 'Gen-Z Knowledge City, InfoValley-II, Bhubaneswar, Odisha - 752054',
        email: 'director@genz.edu.in | accounts@genz.edu.in',
        phone: '+91-674-2970000 / +91-674-2970001',
        website: 'https://genz.edu.in',
        bank_details: {
          beneficiary_name: 'GEN-Z UNIVERSITY ACCOUNTS',
          bank_name: 'State Bank of India (SBI)',
          branch: 'Capital Commercial Branch, Bhubaneswar',
          account_number: '398200140029',
          account_type: 'Current Account',
          ifsc_code: 'SBIN0001234',
          micr_code: '751002018'
        }
      },
      student: {
        id: s.id,
        name: s.full_name,
        reg_no: s.reg_no,
        roll_no: s.roll_no || s.reg_no,
        father_name: reqData.father_name || s.parent_name || 'Father',
        course: s.course_name,
        branch: s.branch_name,
        current_semester: s.semester_label,
        session: s.session_name || '2026-2027',
        duration_years: courseDuration,
        address: s.permanent_address || s.address || 'Bhubaneswar, Odisha'
      },
      loan: {
        id: reqData.id,
        bank_name: reqData.bank_name,
        bank_branch: reqData.bank_branch,
        bank_ifsc: reqData.bank_ifsc,
        loan_amount: parseFloat(reqData.loan_amount),
        loan_purpose: reqData.loan_purpose,
        co_applicant_name: reqData.co_applicant_name,
        co_applicant_relation: reqData.co_applicant_relation,
        co_applicant_phone: reqData.co_applicant_phone,
        status: reqData.status
      },
      fee_structure: {
        yearlyBreakdown,
        grandTotal: institutionalGrandTotal,
        totalPaid: totalPaid,
        netEstimatedBalance: institutionalGrandTotal - totalPaid,
        requestedLoanAmount: parseFloat(reqData.loan_amount)
      }
    };

    return success(res, letters, '3 Official Education Loan Letters ready for download/print.');
  } catch (err) {
    console.error('getLoanLetters error:', err);
    return error(res, 'Failed to generate loan letters.', 500);
  }
}

module.exports = {
  getProfile,
  getDashboard,
  getLedger,
  getInvoices,
  getInvoiceById,
  getPayments,
  getReceipts,
  getReceiptById,
  submitRequest,
  getNotifications,
  getHealth,
  updateHealth,
  submitLoanRequest,
  getLoanRequests,
  getLoanLetters
};
