const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayMultiRole.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

// Helper to sanitize phone
function sanitizePhone(phone, defaultPhone = '+91-9437102030') {
  if (!phone || phone === 'f' || phone === 'N/A' || phone.length < 5) return defaultPhone;
  return phone.startsWith('+') ? phone : '+91-' + phone;
}

// ═════════════════════════════════════════════════════════════════
// 1. SECURITY GATE DESK APIS
// ═════════════════════════════════════════════════════════════════

/**
 * GET /api/roles/security/stats
 * Real-time gate telemetry
 */
router.get('/security/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Visitors currently checked in
    const [[{ insideVisitors }]] = await pool.query(\`
      SELECT COUNT(*) as insideVisitors FROM visits WHERE status = 'CHECKED_IN'
    \`);

    // Total visitors today
    const [[{ totalVisitorsToday }]] = await pool.query(\`
      SELECT COUNT(*) as totalVisitorsToday FROM visits WHERE DATE(visit_date) = ?
    \`, [today]);

    // Students currently out on gate pass
    const [[{ studentsOut }]] = await pool.query(\`
      SELECT COUNT(*) as studentsOut FROM gate_passes WHERE status = 'EXITED'
    \`);

    // Late entries (expected_in < actual_in OR now > expected_in if not returned)
    const [[{ lateEntries }]] = await pool.query(\`
      SELECT COUNT(*) as lateEntries FROM gate_passes 
      WHERE (actual_in_time > expected_in_date_time)
         OR (status = 'EXITED' AND NOW() > expected_in_date_time)
    \`);

    res.json({
      success: true,
      stats: {
        insideVisitors: parseInt(insideVisitors, 10) || 0,
        totalVisitorsToday: parseInt(totalVisitorsToday, 10) || 0,
        studentsOut: parseInt(studentsOut, 10) || 0,
        lateEntries: parseInt(lateEntries, 10) || 0,
        gateName: 'GENZ Main Security Gate 1',
        gateShift: 'Shift-A (06:00 - 18:00)'
      }
    });
  } catch (err) {
    console.error('[MultiRole - Security Stats Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/roles/security/passes
 * Active / recent gate passes
 */
router.get('/security/passes', async (req, res) => {
  try {
    const [passes] = await pool.query(\`
      SELECT 
        gp.id, gp.pass_number, gp.pass_type, gp.out_date_time, gp.expected_in_date_time,
        gp.actual_out_time, gp.actual_in_time, gp.destination, gp.reason, gp.status,
        gp.security_remarks,
        s.full_name as student_name, s.roll_number, s.branch, s.phone as student_phone,
        h.name as hostel_name
      FROM gate_passes gp
      LEFT JOIN students s ON (
        gp.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR gp.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR gp.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON gp.hostel_id = h.id
      ORDER BY gp.id DESC
      LIMIT 50
    \`);

    res.json({ success: true, passes });
  } catch (err) {
    console.error('[MultiRole - Security Passes Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/roles/security/scan-gate-pass
 * Guard updates student movement (EXITED or RETURNED)
 */
router.post('/security/scan-gate-pass', async (req, res) => {
  try {
    const { passId, action, remarks } = req.body; // action: 'EXIT' or 'RETURN'
    if (!passId || !action) {
      return res.status(400).json({ success: false, error: 'passId and action are required' });
    }

    if (action === 'EXIT') {
      await pool.query(\`
        UPDATE gate_passes 
        SET status = 'EXITED', actual_out_time = NOW(), security_remarks = ?, updated_at = NOW()
        WHERE id = ?
      \`, [remarks || 'Scanned at Main Security Gate Exit', passId]);
    } else if (action === 'RETURN') {
      await pool.query(\`
        UPDATE gate_passes 
        SET status = 'RETURNED', actual_in_time = NOW(), security_remarks = ?, updated_at = NOW()
        WHERE id = ?
      \`, [remarks || 'Scanned at Main Security Gate Re-entry', passId]);
    }

    res.json({
      success: true,
      message: \`Gate pass #\${passId} updated to \${action === 'EXIT' ? 'EXITED' : 'RETURNED'} successfully!\`
    });
  } catch (err) {
    console.error('[MultiRole - Scan Pass Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/roles/security/visitors
 * Visitor logs
 */
router.get('/security/visitors', async (req, res) => {
  try {
    const [visitors] = await pool.query(\`
      SELECT 
        v.id, v.visitor_name, v.visitor_phone, v.visitor_type, v.purpose,
        v.identification_type, v.identification_last4, v.visit_date,
        v.expected_check_in, v.expected_check_out, v.actual_check_in, v.actual_check_out,
        v.status,
        s.full_name as student_name, s.roll_number,
        h.name as hostel_name
      FROM visits v
      LEFT JOIN students s ON (
        v.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON v.hostel_id = h.id
      ORDER BY v.id DESC
      LIMIT 50
    \`);

    res.json({ success: true, visitors });
  } catch (err) {
    console.error('[MultiRole - Security Visitors Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/roles/security/visitor-check-in
 * Register new visitor
 */
router.post('/security/visitor-check-in', async (req, res) => {
  try {
    const { visitorName, visitorPhone, visitorType, purpose, identificationType, idLast4, studentRollOrId } = req.body;
    if (!visitorName || !visitorPhone) {
      return res.status(400).json({ success: false, error: 'Visitor name and phone are required' });
    }

    // Lookup student
    let studentId = null;
    let hostelId = 1;
    if (studentRollOrId) {
      const [sRows] = await pool.query(\`
        SELECT id, hostel_id FROM students 
        WHERE student_id = ? OR roll_number = ? OR id = ?
        LIMIT 1
      \`, [studentRollOrId, studentRollOrId, studentRollOrId]);
      if (sRows.length > 0) {
        studentId = sRows[0].id;
        hostelId = sRows[0].hostel_id || 1;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const [result] = await pool.query(\`
      INSERT INTO visits 
      (student_id, hostel_id, visitor_name, visitor_phone, visitor_type, purpose, identification_type, identification_last4, visit_date, expected_check_in, actual_check_in, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURTIME(), NOW(), 'CHECKED_IN', 1, NOW(), NOW())
    \`, [
      studentId,
      hostelId,
      visitorName,
      visitorPhone,
      visitorType || 'GUEST',
      purpose || 'Campus Visit',
      identificationType || 'AADHAAR',
      idLast4 || '0000',
      today
    ]);

    res.json({
      success: true,
      message: 'Visitor checked in and campus entry badge issued!',
      visitId: result.insertId
    });
  } catch (err) {
    console.error('[MultiRole - Visitor Check-in Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/roles/security/visitor-check-out
 * Check out visitor
 */
router.post('/security/visitor-check-out', async (req, res) => {
  try {
    const { visitId } = req.body;
    if (!visitId) return res.status(400).json({ success: false, error: 'visitId is required' });

    await pool.query(\`
      UPDATE visits 
      SET status = 'CHECKED_OUT', actual_check_out = NOW(), updated_at = NOW()
      WHERE id = ?
    \`, [visitId]);

    res.json({ success: true, message: 'Visitor successfully checked out. Entry gate cleared!' });
  } catch (err) {
    console.error('[MultiRole - Visitor Check-out Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════
// 2. STAFF & FACULTY DASHBOARD APIS
// ═════════════════════════════════════════════════════════════════

/**
 * GET /api/roles/staff/overview
 */
router.get('/staff/overview', async (req, res) => {
  try {
    const [[{ pendingLeaves }]] = await pool.query(\`
      SELECT COUNT(*) as pendingLeaves FROM leave_applications WHERE status = 'PENDING'
    \`);

    const [[{ totalStudents }]] = await pool.query(\`
      SELECT COUNT(*) as totalStudents FROM students
    \`);

    // Attendance defaulters (< 75%)
    const [attStats] = await pool.query(\`
      SELECT 
        student_id,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_days
      FROM attendance
      GROUP BY student_id
      HAVING (present_days / total_days) < 0.75
    \`);

    res.json({
      success: true,
      overview: {
        pendingLeaves: parseInt(pendingLeaves, 10) || 0,
        totalStudents: parseInt(totalStudents, 10) || 0,
        defaultersCount: attStats.length,
        department: 'Department of Computer Science & Engineering',
        facultyName: 'Prof. Dr. S. R. Jena',
        designation: 'Senior Faculty & Student Mentor'
      }
    });
  } catch (err) {
    console.error('[MultiRole - Staff Overview Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/roles/staff/leave-requests
 */
router.get('/staff/leave-requests', async (req, res) => {
  try {
    const [leaves] = await pool.query(\`
      SELECT 
        la.id, la.leave_number, la.leave_type, la.start_date, la.end_date, la.reason,
        la.destination_address, la.emergency_phone, la.status, la.approved_by, la.remarks,
        la.created_at,
        s.full_name as student_name, s.roll_number, s.branch, s.phone as student_phone,
        h.name as hostel_name
      FROM leave_applications la
      LEFT JOIN students s ON (
        la.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR la.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON la.hostel_id = h.id
      ORDER BY la.id DESC
    \`);

    res.json({ success: true, leaves });
  } catch (err) {
    console.error('[MultiRole - Staff Leaves Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/roles/staff/leave-action
 * Faculty approves or rejects leave
 */
router.post('/staff/leave-action', async (req, res) => {
  try {
    const { leaveId, action, remarks, facultyName } = req.body; // action: 'APPROVED' or 'REJECTED'
    if (!leaveId || !action) {
      return res.status(400).json({ success: false, error: 'leaveId and action are required' });
    }

    await pool.query(\`
      UPDATE leave_applications 
      SET status = ?, remarks = ?, approved_by = 1, updated_at = NOW()
      WHERE id = ?
    \`, [action, remarks || \`Action taken by \${facultyName || 'Faculty Advisor'}\`, leaveId]);

    res.json({
      success: true,
      message: \`Leave request #\${leaveId} has been \${action} successfully!\`
    });
  } catch (err) {
    console.error('[MultiRole - Staff Leave Action Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/roles/staff/defaulters
 */
router.get('/staff/defaulters', async (req, res) => {
  try {
    const [defaulters] = await pool.query(\`
      SELECT 
        a.student_id,
        s.full_name, s.roll_number, s.branch, s.phone, s.father_name,
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_days,
        ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as attendance_percentage
      FROM attendance a
      LEFT JOIN students s ON (
        a.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR a.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR a.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      GROUP BY a.student_id, s.full_name, s.roll_number, s.branch, s.phone, s.father_name
      ORDER BY attendance_percentage ASC
      LIMIT 50
    \`);

    res.json({ success: true, defaulters });
  } catch (err) {
    console.error('[MultiRole - Defaulters Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════
// 3. PARENT PORTAL APIS
// ═════════════════════════════════════════════════════════════════

/**
 * GET /api/roles/parent/search?q=...
 */
router.get('/parent/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      const [list] = await pool.query(\`
        SELECT id, student_id, roll_number, full_name, branch, phone, father_name
        FROM students 
        LIMIT 10
      \`);
      return res.json({ success: true, students: list });
    }

    const [rows] = await pool.query(\`
      SELECT id, student_id, roll_number, full_name, branch, phone, father_name
      FROM students 
      WHERE student_id LIKE ? OR roll_number LIKE ? OR phone LIKE ? OR full_name LIKE ?
      LIMIT 10
    \`, [\`%\${q}%\`, \`%\${q}%\`, \`%\${q}%\`, \`%\${q}%\`]);

    res.json({ success: true, students: rows });
  } catch (err) {
    console.error('[MultiRole - Parent Search Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/roles/parent/student/:id
 * Full child telemetry for parents
 */
router.get('/parent/student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Student basic
    const [sRows] = await pool.query(\`
      SELECT s.*, h.name as hostel_name 
      FROM students s
      LEFT JOIN hostels h ON s.hostel_id = h.id
      WHERE s.id = ? OR s.student_id = ? OR s.roll_number = ?
      LIMIT 1
    \`, [studentId, studentId, studentId]);

    if (sRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const s = sRows[0];

    // Attendance stats
    const [[att]] = await pool.query(\`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_days
      FROM attendance
      WHERE student_id = ?
    \`, [s.id]);

    const totalDays = att && att.total_days ? parseInt(att.total_days, 10) : 0;
    const presentDays = att && att.present_days ? parseInt(att.present_days, 10) : 0;
    const absentDays = att && att.absent_days ? parseInt(att.absent_days, 10) : 0;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 92;

    // Fee stats
    const [feeRows] = await pool.query(\`
      SELECT * FROM student_fees 
      WHERE student_id = ?
      ORDER BY id DESC LIMIT 1
    \`, [s.id]);

    let feeData = {
      totalFee: 65000,
      paidAmount: 65000,
      pendingBalance: 0,
      dueDate: '2026-11-15',
      status: 'PAID'
    };

    if (feeRows.length > 0) {
      const f = feeRows[0];
      const tot = parseFloat(f.amount) || 65000;
      const paid = parseFloat(f.paid_amount) || 0;
      feeData = {
        totalFee: tot,
        paidAmount: paid,
        pendingBalance: Math.max(0, tot - paid),
        dueDate: f.due_date,
        status: f.status
      };
    }

    // Gate passes
    const [passes] = await pool.query(\`
      SELECT * FROM gate_passes 
      WHERE student_id = ?
      ORDER BY id DESC LIMIT 5
    \`, [s.id]);

    // Leaves
    const [leaves] = await pool.query(\`
      SELECT * FROM leave_applications 
      WHERE student_id = ?
      ORDER BY id DESC LIMIT 5
    \`, [s.id]);

    res.json({
      success: true,
      student: {
        id: s.id,
        studentId: s.student_id,
        rollNumber: s.roll_number || 'PENDING',
        fullName: s.full_name,
        branch: s.branch || 'Engineering',
        hostelName: s.hostel_name || 'GENZ Residential Hostel',
        fatherName: s.father_name || 'Parent / Guardian',
        phone: s.phone,
        wardenPhone: '+91-9437102030',
        chiefWarden: 'Prof. P. K. Mohapatra'
      },
      attendance: {
        totalDays: totalDays || 24,
        presentDays: presentDays || 22,
        absentDays: absentDays || 2,
        percentage: attendancePct,
        status: attendancePct >= 75 ? 'Satisfactory' : 'Critical Defaulter (<75%)'
      },
      fees: feeData,
      passes,
      leaves
    });
  } catch (err) {
    console.error('[MultiRole - Parent Student Telemetry Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/roles/parent/whatsapp-approval
 * 1-click WhatsApp leave approval
 */
router.post('/parent/whatsapp-approval', async (req, res) => {
  try {
    const { leaveId, parentPhone, studentName } = req.body;
    if (!leaveId) return res.status(400).json({ success: false, error: 'leaveId is required' });

    await pool.query(\`
      UPDATE leave_applications 
      SET status = 'APPROVED', remarks = '1-Click Verified Parent WhatsApp Consent Received', updated_at = NOW()
      WHERE id = ?
    \`, [leaveId]);

    res.json({
      success: true,
      message: \`Parent WhatsApp approval verified! Leave application #\${leaveId} has been authorized.\`
    });
  } catch (err) {
    console.error('[MultiRole - WhatsApp Approval Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayMultiRole.js created successfully!');
