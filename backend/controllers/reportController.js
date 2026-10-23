/**
 * Financial Reports & Analytics Controller
 * Gen-Z University Accounts System
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * Collection Report with Filters
 * GET /api/reports/collections
 */
async function getCollectionsReport(req, res) {
  const { startDate, endDate, branchId, paymentMethod } = req.query;

  try {
    let where = `WHERE p.status = 'SUCCESS'`;
    const params = [];

    if (startDate) {
      where += ` AND DATE(p.created_at) >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      where += ` AND DATE(p.created_at) <= ?`;
      params.push(endDate);
    }
    if (branchId) {
      where += ` AND s.branch_id = ?`;
      params.push(branchId);
    }
    if (paymentMethod) {
      where += ` AND p.payment_method = ?`;
      params.push(paymentMethod);
    }

    const [rows] = await query(`
      SELECT p.id, p.payment_no, p.amount, p.payment_method, p.transaction_id, p.created_at,
             s.reg_no, s.full_name, b.name AS branch_name, b.code AS branch_code,
             i.invoice_no, r.receipt_no
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN branches b ON s.branch_id = b.id
      JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN receipts r ON r.payment_id = p.id
      ${where}
      ORDER BY p.created_at DESC
    `, params);

    const totalCollected = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return success(res, { totalCollected, count: rows.length, collections: rows }, 'Collection report generated.');
  } catch (err) {
    console.error('getCollectionsReport error:', err);
    return error(res, 'Failed to generate collection report.', 500);
  }
}

/**
 * Defaulters / Overdue Report
 * GET /api/reports/defaulters
 */
async function getDefaultersReport(req, res) {
  const { branchId, semesterId, aging, amountRange } = req.query;

  try {
    let where = `WHERE i.status != 'CANCELLED' AND i.outstanding_amount > 0 AND i.due_date < CURDATE()`;
    const params = [];

    if (branchId) {
      where += ` AND s.branch_id = ?`;
      params.push(branchId);
    }
    if (semesterId) {
      where += ` AND s.current_semester_id = ?`;
      params.push(semesterId);
    }

    let [defaulters] = await query(`
      SELECT s.id, s.reg_no, s.full_name, s.phone, s.parent_name, s.parent_phone,
             s.branch_id, s.current_semester_id,
             b.name AS branch_name, b.code AS branch_code, sem.label AS semester_label,
             i.invoice_no, i.total_payable, i.paid_amount, i.outstanding_amount, i.due_date,
             DATEDIFF(CURDATE(), i.due_date) AS days_overdue
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      JOIN branches b ON s.branch_id = b.id
      JOIN semesters sem ON s.current_semester_id = sem.id
      ${where}
      ORDER BY i.outstanding_amount DESC, days_overdue DESC
    `, params);

    // Apply Overdue Aging Filter (Unified Aging Calculation - Master Prompt Req 23)
    if (aging && aging !== 'ALL') {
      if (aging === '0-30') {
        defaulters = defaulters.filter(d => d.days_overdue >= 0 && d.days_overdue <= 30);
      } else if (aging === '31-60') {
        defaulters = defaulters.filter(d => d.days_overdue >= 31 && d.days_overdue <= 60);
      } else if (aging === '61-90') {
        defaulters = defaulters.filter(d => d.days_overdue >= 61 && d.days_overdue <= 90);
      } else if (aging === '90+') {
        defaulters = defaulters.filter(d => d.days_overdue > 90);
      }
    }

    // Apply Amount Range Filter (Master Prompt Req 22: < 10k, 10k - 50k, > 50k)
    if (amountRange && amountRange !== 'ALL') {
      if (amountRange === 'LT10K') {
        defaulters = defaulters.filter(d => parseFloat(d.outstanding_amount) < 10000);
      } else if (amountRange === '10K-50K') {
        defaulters = defaulters.filter(d => parseFloat(d.outstanding_amount) >= 10000 && parseFloat(d.outstanding_amount) <= 50000);
      } else if (amountRange === 'GT50K') {
        defaulters = defaulters.filter(d => parseFloat(d.outstanding_amount) > 50000);
      }
    }

    const totalOverdue = defaulters.reduce((sum, d) => sum + parseFloat(d.outstanding_amount), 0);

    return success(res, { totalOverdue, count: defaulters.length, defaulters }, 'Defaulters report generated.');
  } catch (err) {
    console.error('getDefaultersReport error:', err);
    return error(res, 'Failed to generate defaulters report.', 500);
  }
}

/**
 * CSV Export for Financial Audits
 * GET /api/reports/export-csv
 */
async function exportCsv(req, res) {
  const { type = 'collections', aging, amountRange, branchId } = req.query;

  try {
    let csvData = '';
    let filename = `genz_report_${type}_${Date.now()}.csv`;

    if (type === 'collections') {
      const [rows] = await query(`
        SELECT p.payment_no, p.amount, p.payment_method, p.transaction_id, p.created_at,
               s.reg_no, s.full_name, b.code AS branch, i.invoice_no, r.receipt_no
        FROM payments p
        JOIN students s ON p.student_id = s.id
        JOIN branches b ON s.branch_id = b.id
        JOIN invoices i ON p.invoice_id = i.id
        LEFT JOIN receipts r ON r.payment_id = p.id
        WHERE p.status = 'SUCCESS'
        ORDER BY p.created_at DESC
      `);

      csvData = 'Receipt No,Payment No,Roll No,Student Name,Branch,Amount (INR),Method,Txn ID,Invoice No,Date\n';
      for (const r of rows) {
        csvData += `"${r.receipt_no || ''}","${r.payment_no}","${r.reg_no}","${r.full_name}","${r.branch}","${r.amount}","${r.payment_method}","${r.transaction_id || ''}","${r.invoice_no}","${r.created_at}"\n`;
      }
    } else if (type === 'defaulters') {
      let [rows] = await query(`
        SELECT s.id, s.reg_no, s.full_name, s.phone, s.branch_id, b.code AS branch, sem.label AS semester,
               i.invoice_no, i.total_payable, i.paid_amount, i.outstanding_amount, i.due_date,
               DATEDIFF(CURDATE(), i.due_date) AS days_overdue
        FROM invoices i
        JOIN students s ON i.student_id = s.id
        JOIN branches b ON s.branch_id = b.id
        JOIN semesters sem ON s.current_semester_id = sem.id
        WHERE i.status != 'CANCELLED' AND i.outstanding_amount > 0 AND i.due_date < CURDATE()
        ORDER BY i.outstanding_amount DESC
      `);

      if (branchId) {
        rows = rows.filter(r => String(r.branch_id) === String(branchId));
      }
      if (aging && aging !== 'ALL') {
        if (aging === '0-30') rows = rows.filter(d => d.days_overdue >= 0 && d.days_overdue <= 30);
        else if (aging === '31-60') rows = rows.filter(d => d.days_overdue >= 31 && d.days_overdue <= 60);
        else if (aging === '61-90') rows = rows.filter(d => d.days_overdue >= 61 && d.days_overdue <= 90);
        else if (aging === '90+') rows = rows.filter(d => d.days_overdue > 90);
      }
      if (amountRange && amountRange !== 'ALL') {
        if (amountRange === 'LT10K') rows = rows.filter(d => parseFloat(d.outstanding_amount) < 10000);
        else if (amountRange === '10K-50K') rows = rows.filter(d => parseFloat(d.outstanding_amount) >= 10000 && parseFloat(d.outstanding_amount) <= 50000);
        else if (amountRange === 'GT50K') rows = rows.filter(d => parseFloat(d.outstanding_amount) > 50000);
      }

      csvData = 'Roll No,Student Name,Phone,Branch,Semester,Invoice No,Total Billed,Paid,Outstanding,Due Date,Days Overdue\n';
      for (const r of rows) {
        csvData += `"${r.reg_no}","${r.full_name}","${r.phone || ''}","${r.branch}","${r.semester}","${r.invoice_no}","${r.total_payable}","${r.paid_amount}","${r.outstanding_amount}","${r.due_date}","${r.days_overdue}"\n`;
      }
    } else if (type === 'registrations') {
      const mockDb = require('../config/mockDb');
      let rows = mockDb.examRegistrations || [];
      if (req.query.paymentStatus && req.query.paymentStatus !== 'ALL') {
        rows = rows.filter(r => r.payment_status === req.query.paymentStatus);
      }
      csvData = 'Sl No,Reg No,Roll No,Student Name,Course,Branch,Exam Name,Semester,Fee Amount,Fee Paid,Balance,Status,Admit Card,Receipt No\n';
      rows.forEach((r, idx) => {
        const bal = Math.max(0, (r.fee_amount || 0) - (r.fee_paid || 0));
        csvData += `"${idx + 1}","${r.reg_no || ''}","${r.roll_no || ''}","${r.student_name || ''}","${r.course_name || 'B.Tech'}","${r.branch_code || r.branch_name || ''}","${r.exam_name || ''}","${r.semester_label || '1st Semester'}",${r.fee_amount || 0},${r.fee_paid || 0},${bal},"${r.payment_status || 'UNPAID'}","${r.admit_card_eligible ? 'ELIGIBLE' : 'BLOCKED'}","${r.receipt_no || '-'}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvData);
  } catch (err) {
    console.error('exportCsv error:', err);
    return error(res, 'Failed to export CSV report.', 500);
  }
}

/**
 * Exam & University Registration Report
 * GET /api/reports/registrations
 */
async function getRegistrationsReport(req, res) {
  const { paymentStatus, branchId, search } = req.query;

  try {
    const sql = `
      SELECT 
        s.id AS student_id,
        s.reg_no,
        s.roll_no,
        s.full_name AS student_name,
        s.phone,
        COALESCE(p.name, 'B.Tech') AS course_name,
        COALESCE(p.code, 'BTECH') AS prog_code,
        COALESCE(d.name, 'General Engineering') AS branch_name,
        COALESCE(d.code, 'GEN') AS branch_code,
        COALESCE(s.current_semester_id, 1) AS semester_id,
        COALESCE(sem.label, CONCAT(
          COALESCE(s.current_semester_id, 1),
          CASE 
            WHEN COALESCE(s.current_semester_id, 1) = 1 THEN 'st'
            WHEN COALESCE(s.current_semester_id, 1) = 2 THEN 'nd'
            WHEN COALESCE(s.current_semester_id, 1) = 3 THEN 'rd'
            ELSE 'th'
          END,
          ' Semester'
        )) AS semester_label,
        sr.id AS registration_id,
        sr.reference_number,
        COALESCE(sr.academic_year, '2026-27') AS session,
        COALESCE(sr.academic_year, '2026-27') AS session_name,
        CASE
          WHEN COALESCE(s.current_semester_id, 1) <= 2 THEN '1st Year'
          WHEN COALESCE(s.current_semester_id, 1) <= 4 THEN '2nd Year'
          WHEN COALESCE(s.current_semester_id, 1) <= 6 THEN '3rd Year'
          ELSE '4th Year'
        END AS academic_year,
        sr.status AS reg_status,
        COALESCE(sr.exam_fee_amount, 1550.00) AS fee_amount,
        sr.exam_fee_status,
        sr.exam_receipt_no,
        sr.exam_fee_paid_at
      FROM students s
      LEFT JOIN programs p ON p.id = s.course_id
      LEFT JOIN departments d ON d.id = s.branch_id
      LEFT JOIN semesters sem ON sem.semester_number = s.current_semester_id
      LEFT JOIN (
        SELECT sr1.*
        FROM subject_registrations sr1
        INNER JOIN (
          SELECT student_id, MAX(id) AS max_id
          FROM subject_registrations
          GROUP BY student_id
        ) sr2 ON sr1.id = sr2.max_id
      ) sr ON sr.student_id = s.id
      ORDER BY s.id ASC
    `;

    const [rows] = await query(sql);

    let list = (rows || []).map(r => {
      const isPaid = (r.exam_fee_status === 'PAID') || (['CONFIRMED', 'EXAM_FEE_PAID'].includes(r.reg_status));
      const feeAmount = parseFloat(r.fee_amount) || 1550.00;
      const feePaid = isPaid ? feeAmount : 0.00;
      const payment_status = isPaid ? 'PAID' : 'UNPAID';
      const admit_card_eligible = isPaid;

      return {
        ...r,
        fee_amount: feeAmount,
        fee_paid: feePaid,
        payment_status,
        admit_card_eligible,
        is_registered: !!r.registration_id
      };
    });

    if (paymentStatus && paymentStatus !== 'ALL') {
      list = list.filter(r => r.payment_status === paymentStatus);
    }
    if (branchId) {
      list = list.filter(r => String(r.branch_code) === String(branchId) || String(r.branch_name).toLowerCase().includes(String(branchId).toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(r => 
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.reg_no && r.reg_no.toLowerCase().includes(q)) ||
        (r.roll_no && r.roll_no.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q))
      );
    }

    const totalRegistrations = list.length;
    const paidList = list.filter(r => r.payment_status === 'PAID');
    const unpaidList = list.filter(r => r.payment_status !== 'PAID');
    const totalFee = list.reduce((sum, r) => sum + parseFloat(r.fee_amount || 0), 0);
    const totalPaid = list.reduce((sum, r) => sum + parseFloat(r.fee_paid || 0), 0);
    const totalUnpaid = totalFee - totalPaid;

    return success(res, {
      totalRegistrations,
      paidCount: paidList.length,
      unpaidCount: unpaidList.length,
      totalFee,
      totalPaid,
      totalUnpaid,
      registrations: list
    }, 'Exam and registration fee report generated.');
  } catch (err) {
    console.error('getRegistrationsReport error:', err);
    return error(res, 'Failed to generate registration report.', 500);
  }
}

module.exports = {
  getCollectionsReport,
  getDefaultersReport,
  getRegistrationsReport,
  exportCsv
};
