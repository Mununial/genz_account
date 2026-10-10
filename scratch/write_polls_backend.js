const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayPolls.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

/**
 * GET /api/polls/list
 * Returns all active and recent campus polls with live vote tallies & percentages
 */
router.get('/list', async (req, res) => {
  try {
    const { studentId } = req.query;

    const [polls] = await pool.query(\`
      SELECT 
        id, title, question, options_json, audience_type, target_filter, 
        duration_hours, expires_at, status, created_by, created_at
      FROM campus_polls 
      ORDER BY id DESC
    \`);

    const [allVotes] = await pool.query(\`
      SELECT poll_id, selected_option_index, selected_option_text, COUNT(*) as vote_count
      FROM campus_poll_votes
      GROUP BY poll_id, selected_option_index, selected_option_text
    \`);

    let studentVotes = [];
    if (studentId) {
      const [sv] = await pool.query(\`
        SELECT poll_id, selected_option_index, selected_option_text 
        FROM campus_poll_votes 
        WHERE student_id = ?
      \`, [studentId]);
      studentVotes = sv;
    }

    const processedPolls = polls.map(p => {
      let options = [];
      try {
        options = typeof p.options_json === 'string' ? JSON.parse(p.options_json) : p.options_json;
      } catch (e) {
        options = ['Option A', 'Option B', 'Option C'];
      }

      // Votes for this poll
      const pVotes = allVotes.filter(v => v.poll_id === p.id);
      const totalVotes = pVotes.reduce((acc, curr) => acc + curr.vote_count, 0);

      const optionsTally = options.map((optText, idx) => {
        const found = pVotes.find(v => v.selected_option_index === idx);
        const count = found ? found.vote_count : 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return {
          index: idx,
          text: optText,
          count,
          percentage: pct
        };
      });

      // Check if student has voted
      const userVote = studentVotes.find(v => v.poll_id === p.id);
      const now = new Date();
      const expires = new Date(p.expires_at);
      const isExpired = now > expires;

      return {
        id: p.id,
        title: p.title,
        question: p.question,
        audienceType: p.audience_type,
        targetFilter: p.target_filter,
        durationHours: p.duration_hours,
        expiresAt: p.expires_at,
        isExpired,
        status: isExpired ? 'CLOSED' : p.status,
        createdBy: p.created_by,
        createdAt: p.created_at,
        totalVotes,
        options: optionsTally,
        hasVoted: !!userVote,
        votedOptionIndex: userVote ? userVote.selected_option_index : null
      };
    });

    res.json({
      success: true,
      polls: processedPolls
    });
  } catch (err) {
    console.error('[CampusPolls] List Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/polls/create
 * Admin creates a new poll
 */
router.post('/create', async (req, res) => {
  try {
    const { title, question, options, audienceType, targetFilter, durationHours, createdBy } = req.body;

    if (!title || !question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, error: 'Title, question and at least 2 options are required' });
    }

    const duration = parseInt(durationHours, 10) || 24;
    const expiresAt = new Date(Date.now() + duration * 3600000);

    const [result] = await pool.query(\`
      INSERT INTO campus_polls 
      (title, question, options_json, audience_type, target_filter, duration_hours, expires_at, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, NOW(), NOW())
    \`, [
      title,
      question,
      JSON.stringify(options),
      audienceType || 'ALL',
      targetFilter || 'All Campus',
      duration,
      expiresAt,
      createdBy || 'Admin Hub'
    ]);

    res.json({
      success: true,
      message: 'Campus Poll published successfully!',
      pollId: result.insertId
    });
  } catch (err) {
    console.error('[CampusPolls] Create Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/polls/vote
 * Student votes for an option (strictly 1 vote per student)
 */
router.post('/vote', async (req, res) => {
  try {
    const pollId = req.body.pollId || req.body.poll_id;
    const studentId = req.body.studentId || req.body.student_id;
    const optionIndex = req.body.optionIndex !== undefined ? req.body.optionIndex : req.body.option_index;
    const optionText = req.body.optionText || req.body.option_text;

    if (!pollId || !studentId || optionIndex === undefined) {
      return res.status(400).json({ success: false, error: 'pollId, studentId, and optionIndex are required' });
    }

    // Check if poll is expired
    const [pollRows] = await pool.query('SELECT expires_at, status FROM campus_polls WHERE id = ?', [pollId]);
    if (pollRows.length === 0) return res.status(404).json({ success: false, error: 'Poll not found' });

    if (new Date() > new Date(pollRows[0].expires_at) || pollRows[0].status === 'CLOSED') {
      return res.status(400).json({ success: false, error: 'This poll has concluded and is closed for voting' });
    }

    // Insert vote with unique constraint guard
    try {
      await pool.query(\`
        INSERT INTO campus_poll_votes (poll_id, student_id, selected_option_index, selected_option_text, voted_at)
        VALUES (?, ?, ?, ?, NOW())
      \`, [pollId, studentId, optionIndex, optionText || 'Option ' + (parseInt(optionIndex, 10) + 1)]);
    } catch (insertErr) {
      if (insertErr.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, error: 'You have already voted in this poll. Multiple voting is prevented.' });
      }
      throw insertErr;
    }

    res.json({
      success: true,
      message: 'Your vote has been cast and recorded successfully!'
    });
  } catch (err) {
    console.error('[CampusPolls] Vote Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/polls/:id/export-csv
 * Exports results of a poll to CSV
 */
router.get('/:id/export-csv', async (req, res) => {
  try {
    const pollId = req.params.id;

    const [pollRows] = await pool.query('SELECT title, question FROM campus_polls WHERE id = ?', [pollId]);
    if (pollRows.length === 0) return res.status(404).send('Poll not found');

    const [votes] = await pool.query(\`
      SELECT 
        cpv.id as vote_id,
        cpv.student_id,
        s.full_name,
        s.roll_number,
        s.branch,
        cpv.selected_option_index,
        cpv.selected_option_text,
        DATE_FORMAT(cpv.voted_at, '%Y-%m-%d %H:%i:%s') as voted_at
      FROM campus_poll_votes cpv
      LEFT JOIN students s ON (
        cpv.student_id COLLATE utf8mb4_unicode_ci = CAST(s.id AS CHAR) COLLATE utf8mb4_unicode_ci 
        OR cpv.student_id COLLATE utf8mb4_unicode_ci = s.student_id COLLATE utf8mb4_unicode_ci 
        OR cpv.student_id COLLATE utf8mb4_unicode_ci = s.roll_number COLLATE utf8mb4_unicode_ci
      )
      WHERE cpv.poll_id = ?
      ORDER BY cpv.id ASC
    \`, [pollId]);

    let csv = \`"Poll Results: \${(pollRows[0].title || '').replace(/"/g, '""')}"\\r\\n\`;
    csv += \`"Question: \${(pollRows[0].question || '').replace(/"/g, '""')}"\\r\\n\\r\\n\`;
    csv += 'Vote ID,Student Name,Roll Number,Branch,Option Index,Selected Option,Voted At\\r\\n';

    votes.forEach(v => {
      const sName = (v.full_name || 'Verified Student').replace(/"/g, '""');
      const opt = (v.selected_option_text || '').replace(/"/g, '""');
      csv += \`"\${v.vote_id}","\${sName}","\${v.roll_number || 'N/A'}","\${v.branch || 'N/A'}",\${v.selected_option_index},"\${opt}","\${v.voted_at}"\\r\\n\`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', \`attachment; filename="BEC_Poll_\${pollId}_Results.csv"\`);
    res.send(csv);
  } catch (err) {
    console.error('[CampusPolls] Export CSV Error:', err);
    res.status(500).send('Error generating Poll CSV');
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayPolls.js updated successfully with collation fix and flexible params!');
