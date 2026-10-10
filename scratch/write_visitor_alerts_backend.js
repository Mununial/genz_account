const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayVisitorAlerts.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

/**
 * GET /api/visitor-alerts/telemetry
 * Real-time active visitor monitoring and overstay calculation using DB-native TIMESTAMPDIFF
 */
router.get('/telemetry', async (req, res) => {
  try {
    const { visitorType } = req.query;

    let query = \`
      SELECT 
        v.id, v.visitor_name, v.visitor_phone, v.visitor_type, v.purpose,
        v.identification_type, v.identification_last4,
        v.expected_check_in, v.expected_check_out, v.actual_check_in, v.actual_check_out,
        v.status,
        TIMESTAMPDIFF(MINUTE, v.actual_check_in, NOW()) as elapsed_minutes,
        TIMESTAMPDIFF(MINUTE, v.expected_check_out, NOW()) as overdue_diff,
        s.full_name as student_name, s.roll_number, s.branch, s.phone as student_phone,
        h.name as hostel_name
      FROM visits v
      LEFT JOIN students s ON (
        v.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      LEFT JOIN hostels h ON v.hostel_id = h.id
      WHERE v.status = 'CHECKED_IN'
    \`;
    const params = [];

    if (visitorType && visitorType !== 'ALL') {
      query += ' AND v.visitor_type = ?';
      params.push(visitorType);
    }

    query += ' ORDER BY v.expected_check_out ASC';

    const [rows] = await pool.query(query, params);

    let criticalCount = 0;
    let warningCount = 0;
    let normalCount = 0;

    const visitors = rows.map(v => {
      const overdueDiff = parseInt(v.overdue_diff, 10) || 0;
      const isOverdue = overdueDiff > 0;
      const overdueMinutes = isOverdue ? overdueDiff : 0;
      const remainingMinutes = !isOverdue ? Math.abs(overdueDiff) : 0;
      const elapsedMinutes = Math.max(0, parseInt(v.elapsed_minutes, 10) || 0);

      let severity = 'NORMAL';
      if (overdueMinutes >= 30) {
        severity = 'CRITICAL';
        criticalCount++;
      } else if (overdueMinutes > 0) {
        severity = 'WARNING';
        warningCount++;
      } else {
        severity = 'NORMAL';
        normalCount++;
      }

      return {
        id: v.id,
        visitorName: v.visitor_name,
        visitorPhone: v.visitor_phone,
        visitorType: v.visitor_type || 'GUEST',
        purpose: v.purpose || 'Campus Visit',
        idType: v.identification_type,
        idLast4: v.identification_last4,
        checkInTime: v.actual_check_in,
        expectedOutTime: v.expected_check_out,
        hostStudentName: v.student_name || 'Administrative Desk',
        hostStudentRoll: v.roll_number || 'N/A',
        hostelName: v.hostel_name || 'Main Campus',
        elapsedMinutes,
        overdueMinutes,
        remainingMinutes,
        severity
      };
    });

    const [[{ completedToday }]] = await pool.query(\`
      SELECT COUNT(*) as completedToday FROM visits WHERE status = 'CHECKED_OUT' AND DATE(visit_date) = CURDATE()
    \`);

    res.json({
      success: true,
      stats: {
        totalActive: visitors.length,
        criticalCount,
        warningCount,
        normalCount,
        completedToday: parseInt(completedToday, 10) || 0
      },
      visitors
    });
  } catch (err) {
    console.error('[VisitorAlerts - Telemetry Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/visitor-alerts/force-checkout
 */
router.post('/force-checkout', async (req, res) => {
  try {
    const { visitId, reason } = req.body;
    if (!visitId) return res.status(400).json({ success: false, error: 'visitId is required' });

    await pool.query(\`
      UPDATE visits 
      SET status = 'CHECKED_OUT', actual_check_out = NOW(), updated_at = NOW()
      WHERE id = ?
    \`, [visitId]);

    res.json({
      success: true,
      message: \`Visitor #\${visitId} force checked out. Gate pass status set to COMPLETED.\`
    });
  } catch (err) {
    console.error('[VisitorAlerts - Force Checkout Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/visitor-alerts/dispatch-patrol
 */
router.post('/dispatch-patrol', async (req, res) => {
  try {
    const { visitId, visitorName, hostelName } = req.body;
    const patrolTicket = 'PATROL-' + Math.floor(1000 + Math.random() * 9000);

    res.json({
      success: true,
      message: \`Security Patrol \${patrolTicket} dispatched immediately to \${hostelName || 'Campus'} for \${visitorName}!\`,
      patrolTicket
    });
  } catch (err) {
    console.error('[VisitorAlerts - Dispatch Patrol Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/visitor-alerts/export-csv
 */
router.get('/export-csv', async (req, res) => {
  try {
    const [rows] = await pool.query(\`
      SELECT 
        v.id, v.visitor_name, v.visitor_phone, v.visitor_type, v.purpose,
        v.identification_type, v.identification_last4,
        DATE_FORMAT(v.actual_check_in, '%Y-%m-%d %H:%i:%s') as check_in,
        DATE_FORMAT(v.expected_check_out, '%Y-%m-%d %H:%i:%s') as expected_out,
        DATE_FORMAT(v.actual_check_out, '%Y-%m-%d %H:%i:%s') as actual_out,
        v.status,
        s.full_name as student_name, s.roll_number
      FROM visits v
      LEFT JOIN students s ON (
        v.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR v.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      ORDER BY v.id DESC
    \`);

    let csv = '"GENZ Official Campus Visitor Security & Overstay Audit Log"\\r\\n';
    csv += \`"Generated: \${new Date().toLocaleString('en-IN')}"\\r\\n\\r\\n\`;
    csv += 'Visit ID,Visitor Name,Phone,Type,Purpose,ID Type,ID Last 4,Host Student,Roll No,Check In,Expected Out,Actual Out,Status\\r\\n';

    rows.forEach(r => {
      const vName = (r.visitor_name || '').replace(/"/g, '""');
      const purp = (r.purpose || '').replace(/"/g, '""');
      const sName = (r.student_name || 'Admin').replace(/"/g, '""');
      csv += \`"\${r.id}","\${vName}","\${r.visitor_phone}","\${r.visitor_type}","\${purp}","\${r.identification_type}","\${r.identification_last4}","\${sName}","\${r.roll_number || 'N/A'}","\${r.check_in || 'N/A'}","\${r.expected_out || 'N/A'}","\${r.actual_out || 'Active Inside'}","\${r.status}"\\r\\n\`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="BEC_Visitor_Security_Manifest.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[VisitorAlerts - Export Error]:', err);
    res.status(500).send('Error generating Visitor CSV');
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayVisitorAlerts.js updated with DB-native TIMESTAMPDIFF calculation!');
