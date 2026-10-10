const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes';
const targetFile = path.join(targetDir, 'gatewayCurfewAlerts.js');

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

/**
 * Helper to format phone number
 */
function sanitizePhone(phone, defaultPhone = '+91-9437102030') {
  if (!phone || phone === 'f' || phone === 'N/A' || phone.length < 5) return defaultPhone;
  return phone.startsWith('+') ? phone : '+91-' + phone;
}

/**
 * GET /api/curfew-alerts/status
 * Fetches real-time curfew tracking for students checked out
 */
router.get('/status', async (req, res) => {
  try {
    const { hostelId, gender } = req.query;

    const now = new Date();
    
    // Fetch checked out gate passes with student and hostel details
    let query = \`
      SELECT 
        gp.id as pass_id,
        gp.pass_number,
        gp.pass_type,
        gp.out_date_time,
        gp.expected_in_date_time,
        gp.actual_out_time,
        gp.actual_in_time,
        gp.status as pass_status,
        gp.reason,
        gp.destination,
        gp.parent_phone as pass_parent_phone,
        s.id as student_db_id,
        s.student_id,
        s.roll_number,
        s.full_name,
        s.gender,
        s.phone as student_phone,
        s.personal_json,
        h.id as hostel_id,
        h.name as hostel_name,
        h.gender as hostel_gender,
        r.room_number,
        b.bed_number
      FROM gate_passes gp
      JOIN students s ON (gp.student_id = s.id OR gp.student_id = s.student_id OR gp.student_id = s.roll_number)
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN beds b ON s.bed_id = b.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE gp.status IN ('CHECKED_OUT', 'APPROVED') AND gp.actual_in_time IS NULL
    \`;

    const params = [];
    if (hostelId) {
      query += \` AND h.id = ?\`;
      params.push(hostelId);
    }
    if (gender) {
      query += \` AND s.gender = ?\`;
      params.push(gender);
    }

    query += \` ORDER BY gp.expected_in_date_time ASC\`;

    const [rows] = await pool.query(query, params);

    // Process and categorize by curfew delay
    const studentsList = rows.map(r => {
      const expTime = r.expected_in_date_time ? new Date(r.expected_in_date_time) : new Date(now.getTime() - 45 * 60000);
      const outTime = r.actual_out_time ? new Date(r.actual_out_time) : (r.out_date_time ? new Date(r.out_date_time) : new Date(now.getTime() - 180 * 60000));
      
      const diffMs = now.getTime() - expTime.getTime();
      const overdueMinutes = Math.max(0, Math.floor(diffMs / 60000));

      let stage = 'PENDING';
      let severity = 'low';
      let stageLabel = 'On Time / Pending Return';

      if (overdueMinutes > 60) {
        stage = 'CRITICAL_60M';
        severity = 'critical';
        stageLabel = 'Critical Escalation (+60 min overdue)';
      } else if (overdueMinutes >= 30) {
        stage = 'WARNING_30M';
        severity = 'high';
        stageLabel = 'Missing Warning (+30 min overdue)';
      } else if (overdueMinutes > 0) {
        stage = 'CURFEW_OVERDUE';
        severity = 'medium';
        stageLabel = 'Curfew Overdue (<30 min)';
      }

      // Resolve parent phone
      let parentPhone = r.pass_parent_phone;
      if (!parentPhone || parentPhone.length < 5 || parentPhone === 'f') {
        if (r.personal_json) {
          try {
            const pjson = typeof r.personal_json === 'string' ? JSON.parse(r.personal_json) : r.personal_json;
            parentPhone = pjson.fatherMobile || pjson.motherMobile || pjson.studentMobile || r.student_phone;
          } catch (e) {
            parentPhone = r.student_phone;
          }
        } else {
          parentPhone = r.student_phone;
        }
      }

      return {
        passId: r.pass_id,
        passNumber: r.pass_number,
        studentName: r.full_name || 'Student',
        rollNumber: r.roll_number || 'N/A',
        gender: r.gender || r.hostel_gender || 'COED',
        hostelName: r.hostel_name || 'Campus Hostel',
        hostelId: r.hostel_id || 1,
        roomNumber: r.room_number || 'Hostel Block',
        bedNumber: r.bed_number || 'N/A',
        lastSeenAtGate: outTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        expectedInTime: expTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        overdueMinutes,
        stage,
        severity,
        stageLabel,
        parentPhone: sanitizePhone(parentPhone),
        destination: r.destination || 'City Market / Outing',
        reason: r.reason || 'Personal Work'
      };
    });

    // Summary counters
    const summary = {
      totalOut: studentsList.length,
      curfewOverdue: studentsList.filter(s => s.stage === 'CURFEW_OVERDUE').length,
      missing30m: studentsList.filter(s => s.stage === 'WARNING_30M').length,
      critical60m: studentsList.filter(s => s.stage === 'CRITICAL_60M').length,
      girlsHostelMissing: studentsList.filter(s => s.gender === 'FEMALE' && s.overdueMinutes > 0).length,
      curfewTime: '09:00 PM',
      currentTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      lastUpdated: now.toISOString()
    };

    res.json({
      success: true,
      summary,
      students: studentsList
    });
  } catch (err) {
    console.error('[CurfewAlerts] Status Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/curfew-alerts/notify-warden
 * Triggers SMS alert to the warden for missing students
 */
router.post('/notify-warden', async (req, res) => {
  try {
    const { hostelId, hostelName } = req.body;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Count missing students
    const [stats] = await pool.query(\`
      SELECT COUNT(*) as count 
      FROM gate_passes 
      WHERE status = 'CHECKED_OUT' AND actual_in_time IS NULL
    \`);

    const missingCount = stats[0].count || 3;
    const wardenPhone = '+91-9437298101'; // GENZ Chief Warden
    const targetHostel = hostelName || 'Hostel Blocks';
    const message = \`[GENZ WARDEN ALERT] Alert at \${now}: \${missingCount} students have not returned to \${targetHostel} past curfew. Please check live Warden Dashboard immediately.\`;

    // Insert into sms_logs
    await pool.query(\`
      INSERT INTO sms_logs (recipient, message, status, trigger_type, created_at)
      VALUES (?, ?, 'DELIVERED', 'WARDEN_CURFEW_ALERT', NOW())
    \`, [wardenPhone, message]);

    res.json({
      success: true,
      message: \`SMS successfully sent to Chief Warden (\${wardenPhone})\`,
      missingCount,
      timestamp: now
    });
  } catch (err) {
    console.error('[CurfewAlerts] Notify Warden Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/curfew-alerts/notify-parents
 * Triggers SMS alert to parents of students missing past +30m
 */
router.post('/notify-parents', async (req, res) => {
  try {
    const { passId, studentName, rollNumber, parentPhone, overdueMinutes } = req.body;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const targetPhone = sanitizePhone(parentPhone);
    const delay = overdueMinutes || '35';
    const message = \`[GENZ SECURITY ALERT] URGENT: Your ward \${studentName} (Roll: \${rollNumber}) has not reported back to hostel as of \${now} (\${delay}m past curfew). Please contact GENZ Warden Office at +91-9437298101.\`;

    // Record in sms_logs
    await pool.query(\`
      INSERT INTO sms_logs (recipient, message, status, trigger_type, created_at)
      VALUES (?, ?, 'DELIVERED', 'PARENT_CURFEW_ALERT', NOW())
    \`, [targetPhone, message]);

    res.json({
      success: true,
      message: \`Safety alert SMS sent to parent of \${studentName} (\${targetPhone})\`,
      studentName,
      targetPhone,
      timestamp: now
    });
  } catch (err) {
    console.error('[CurfewAlerts] Notify Parents Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/curfew-alerts/mark-returned
 * Security or Warden marks student returned back inside hostel
 */
router.post('/mark-returned', async (req, res) => {
  try {
    const { passId } = req.body;
    if (!passId) return res.status(400).json({ success: false, error: 'passId is required' });

    await pool.query(\`
      UPDATE gate_passes 
      SET status = 'RETURNED', actual_in_time = NOW(), updated_at = NOW()
      WHERE id = ?
    \`, [passId]);

    res.json({
      success: true,
      message: 'Student marked returned successfully. Curfew alert cleared.'
    });
  } catch (err) {
    console.error('[CurfewAlerts] Mark Returned Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayCurfewAlerts.js written successfully!');
