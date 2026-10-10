const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayTvSignage.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

// Resilient query wrapper to auto-recover from Hostinger idle socket resets (ECONNRESET)
async function safeQuery(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || (err.message && err.message.includes('ECONNRESET'))) {
      await new Promise(r => setTimeout(r, 250));
      return await pool.query(sql, params);
    }
    throw err;
  }
}

/**
 * GET /api/tv/signage
 * Comprehensive TV Signage data feed: Real-time notices, today's dining mess menu,
 * night curfew countdown telemetry, and campus operational stats.
 */
router.get('/signage', async (req, res) => {
  try {
    // 1. Fetch Active Published Notices (Urgent first)
    const [notices] = await safeQuery(\`
      SELECT 
        id, title, description, priority, status, published_at, created_at
      FROM notices 
      WHERE status = 'PUBLISHED' 
      ORDER BY 
        CASE priority 
          WHEN 'URGENT' THEN 1 
          WHEN 'IMPORTANT' THEN 2 
          ELSE 3 
        END,
        published_at DESC, 
        id DESC 
      LIMIT 12
    \`);

    // 2. Fetch Today's Dining Mess Menu (use today's date or fallback to latest available date)
    const today = new Date().toISOString().split('T')[0];
    let [menus] = await safeQuery(\`
      SELECT id, hostel_id, menu_date, meal_type, meal_name, description, is_available
      FROM mess_menus
      WHERE menu_date = ?
      ORDER BY FIELD(meal_type, 'BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')
    \`, [today]);

    // Fallback if no exact date match
    if (!menus || menus.length === 0) {
      const [latest] = await safeQuery('SELECT MAX(menu_date) as max_date FROM mess_menus');
      const maxDate = latest[0]?.max_date || today;
      const [fallbackMenus] = await safeQuery(\`
        SELECT id, hostel_id, menu_date, meal_type, meal_name, description, is_available
        FROM mess_menus
        WHERE menu_date = ?
        ORDER BY FIELD(meal_type, 'BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER')
      \`, [maxDate]);
      menus = fallbackMenus;
    }

    // Deduplicate meals by meal_type if multiple hostels share identical items
    const menuMap = {};
    menus.forEach(m => {
      const type = (m.meal_type || '').toUpperCase();
      if (!menuMap[type] && m.meal_name) {
        menuMap[type] = {
          meal_type: type,
          meal_name: m.meal_name,
          description: m.description || '',
          is_available: m.is_available === 1
        };
      }
    });

    const orderedMeals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER']
      .filter(type => menuMap[type])
      .map(type => menuMap[type]);

    // 3. Real-Time Institutional Telemetry
    const [studentsRow] = await safeQuery('SELECT COUNT(*) as total FROM students');
    const [visitorsRow] = await safeQuery("SELECT COUNT(*) as active FROM visits WHERE status = 'CHECKED_IN'");
    const [overdueRow] = await safeQuery("SELECT COUNT(*) as overdue FROM visits WHERE status = 'CHECKED_IN' AND expected_check_out < NOW()");
    const [leavesRow] = await safeQuery("SELECT COUNT(*) as leaves FROM leave_applications WHERE status = 'APPROVED'");
    const [notesRow] = await safeQuery("SELECT COUNT(*) as notes FROM classroom_notes");

    // 4. Curfew Determination (IST target: 20:30)
    const now = new Date();
    const istTimeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    const [istH, istM, istS] = istTimeStr.split(':').map(Number);
    const totalMinutesNow = istH * 60 + istM;
    const curfewMinutes = 20 * 60 + 30; // 20:30 -> 1230 minutes
    const diffMinutes = curfewMinutes - totalMinutesNow;

    const isCurfewActive = diffMinutes <= 0;
    const hoursRemaining = Math.max(0, Math.floor(diffMinutes / 60));
    const minsRemaining = Math.max(0, diffMinutes % 60);

    return res.json({
      success: true,
      college: 'GEN-Z UNIVERSITY',
      tagline: 'Autonomous Engineering Institution • Campus Digital Signage',
      weather: {
        location: 'Bhubaneswar, Odisha',
        temp: '31°C',
        condition: 'Humid & Sunny',
        air_quality: 'AQI 46 (Good)'
      },
      curfew: {
        target: '20:30 IST',
        label: 'Mandatory Hostel Night Curfew',
        is_curfew_active: isCurfewActive,
        diff_minutes: diffMinutes,
        countdown_text: isCurfewActive ? 'CURFEW IN EFFECT' : \`\${hoursRemaining}h \${minsRemaining}m\`,
        instructions: 'All resident scholars must be logged in past turnstiles before 8:30 PM sharp.'
      },
      telemetry: {
        total_students: studentsRow[0]?.total || 0,
        active_visitors: visitorsRow[0]?.active || 0,
        overdue_visitors: overdueRow[0]?.overdue || 0,
        approved_leaves: leavesRow[0]?.leaves || 0,
        classroom_notes: notesRow[0]?.notes || 0,
        security_status: (overdueRow[0]?.overdue || 0) > 0 ? 'ATTENTION REQUIRED' : 'NORMAL'
      },
      notices: notices.map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        priority: n.priority,
        published_at: n.published_at || n.created_at
      })),
      menu: orderedMeals
    });
  } catch (err) {
    console.error('TV Signage Telemetry Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/tv/broadcast
 * Instantly broadcasts an urgent alert banner to all Smart TV displays across campus
 */
router.post('/broadcast', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Broadcast title required' });
    }

    const [result] = await safeQuery(\`
      INSERT INTO notices (title, description, created_by, hostel_id, priority, status, published_at, created_at, updated_at)
      VALUES (?, ?, 1, NULL, ?, 'PUBLISHED', NOW(), NOW(), NOW())
    \`, [title, description || '', priority || 'URGENT']);

    return res.json({
      success: true,
      message: 'Urgent broadcast sent to campus Smart TV displays',
      notice_id: result.insertId
    });
  } catch (err) {
    console.error('TV Broadcast Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayTvSignage.js updated with resilient safeQuery!');
