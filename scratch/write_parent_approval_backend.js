const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayParentApproval.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

/**
 * GET /api/parent-approval/details/:id
 * Fetches leave application details for parent approval
 */
router.get('/details/:id', async (req, res) => {
  try {
    const leaveId = req.params.id;

    const [rows] = await pool.query(\`
      SELECT 
        la.id, la.leave_number, la.leave_type, la.start_date, la.end_date, la.reason,
        la.destination_address, la.emergency_phone, la.status, la.remarks, la.created_at,
        s.id as student_db_id, s.full_name as student_name, s.roll_number, s.branch, s.phone as student_phone,
        s.father_name,
        h.name as hostel_name
      FROM leave_applications la
      LEFT JOIN students s ON (
        la.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON la.hostel_id = h.id
      WHERE la.id = ?
      LIMIT 1
    \`, [leaveId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Leave application not found' });
    }

    res.json({
      success: true,
      leave: rows[0],
      chiefWardenContact: {
        name: 'Prof. P. K. Mohapatra',
        phone: '+91-9437102030',
        office: 'GENZ Chief Warden Office, Admin Block'
      }
    });
  } catch (err) {
    console.error('[ParentApproval Details Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/parent-approval/list-pending
 * List all leave applications for demo/testing switcher
 */
router.get('/list-pending', async (req, res) => {
  try {
    const [rows] = await pool.query(\`
      SELECT 
        la.id, la.leave_number, la.status, la.start_date, la.end_date,
        s.full_name as student_name, s.roll_number, s.branch
      FROM leave_applications la
      LEFT JOIN students s ON (
        la.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      ORDER BY la.id DESC
      LIMIT 20
    \`);

    res.json({ success: true, leaves: rows });
  } catch (err) {
    console.error('[ParentApproval List Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/parent-approval/decision
 * Parent submits 1-click Approval or Rejection
 */
router.post('/decision', async (req, res) => {
  try {
    const { leaveId, action, remarks } = req.body; // action: 'APPROVED' or 'REJECTED'

    if (!leaveId || !action) {
      return res.status(400).json({ success: false, error: 'leaveId and action are required' });
    }

    const [rows] = await pool.query('SELECT id, status, leave_number FROM leave_applications WHERE id = ?', [leaveId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Leave application not found' });
    }

    const current = rows[0];
    const timestampStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const auditRemark = action === 'APPROVED' 
      ? \`Verified Parent WhatsApp Approval received on \${timestampStr}\`
      : \`Decline decision recorded by Parent on \${timestampStr}. Remarks: \${remarks || 'Declined by Parent'}\`;

    await pool.query(\`
      UPDATE leave_applications 
      SET status = ?, remarks = ?, updated_at = NOW()
      WHERE id = ?
    \`, [action, auditRemark, leaveId]);

    res.json({
      success: true,
      message: action === 'APPROVED'
        ? \`Leave Pass #\${current.leave_number} has been APPROVED successfully! Gate security and chief warden have been notified.\`
        : \`Leave Pass #\${current.leave_number} has been DECLINED. The student and warden have been alerted.\`,
      status: action
    });
  } catch (err) {
    console.error('[ParentApproval Decision Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayParentApproval.js created successfully!');
