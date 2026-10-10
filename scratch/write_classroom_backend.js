const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/routes/gatewayClassroom.js';

const code = `const express = require('express');
const router = express.Router();
const db = require('../../Hostel Management/backend/src/config/db');
const pool = db.pool;

/**
 * GET /api/classroom/subjects
 * Returns all subjects with note and doubt count summaries
 */
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await pool.query(\`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM classroom_notes n WHERE n.subject_id = s.id) as notes_count,
        (SELECT COUNT(*) FROM classroom_doubts d WHERE d.subject_id = s.id) as doubts_count
      FROM classroom_subjects s
      ORDER BY s.semester ASC, s.subject_code ASC
    \`);

    res.json({ success: true, subjects });
  } catch (err) {
    console.error('[Classroom - Subjects Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/classroom/notes
 * Returns lecture notes filtered by subjectId
 */
router.get('/notes', async (req, res) => {
  try {
    const { subjectId } = req.query;
    let query = \`
      SELECT n.*, s.subject_code, s.subject_name, s.branch, s.semester
      FROM classroom_notes n
      JOIN classroom_subjects s ON n.subject_id = s.id
    \`;
    const params = [];

    if (subjectId) {
      query += ' WHERE n.subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY n.id DESC';

    const [notes] = await pool.query(query, params);
    res.json({ success: true, notes });
  } catch (err) {
    console.error('[Classroom - Notes Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/classroom/notes/upload
 * Faculty publishes new lecture handout
 */
router.post('/notes/upload', async (req, res) => {
  try {
    const { subjectId, unitName, title, description, fileUrl, fileType, fileSize, uploadedBy } = req.body;
    if (!subjectId || !unitName || !title) {
      return res.status(400).json({ success: false, error: 'subjectId, unitName, and title are required' });
    }

    const defaultUrl = fileUrl || 'https://res.cloudinary.com/bec-campus/raw/upload/v1/notes/' + title.replace(/\\s+/g, '_') + '.pdf';

    const [result] = await pool.query(\`
      INSERT INTO classroom_notes 
      (subject_id, unit_name, title, description, file_url, file_type, file_size, download_count, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())
    \`, [
      subjectId,
      unitName,
      title,
      description || 'Official lecture material for students.',
      defaultUrl,
      fileType || 'PDF',
      fileSize || '3.5 MB',
      uploadedBy || 'Department Faculty'
    ]);

    res.json({
      success: true,
      message: 'Lecture note successfully published to the classroom repository!',
      noteId: result.insertId
    });
  } catch (err) {
    console.error('[Classroom - Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/classroom/doubts
 * Returns student questions and faculty replies
 */
router.get('/doubts', async (req, res) => {
  try {
    const { subjectId } = req.query;
    let query = \`
      SELECT d.*, s.subject_code, s.subject_name
      FROM classroom_doubts d
      JOIN classroom_subjects s ON d.subject_id = s.id
    \`;
    const params = [];

    if (subjectId) {
      query += ' WHERE d.subject_id = ?';
      params.push(subjectId);
    }

    query += ' ORDER BY d.id DESC';

    const [doubts] = await pool.query(query, params);

    // Fetch replies
    const [allReplies] = await pool.query(\`
      SELECT * FROM classroom_doubt_replies ORDER BY id ASC
    \`);

    const processed = doubts.map(d => {
      const replies = allReplies.filter(r => r.doubt_id === d.id);
      return {
        ...d,
        replies
      };
    });

    res.json({ success: true, doubts: processed });
  } catch (err) {
    console.error('[Classroom - Doubts Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/classroom/doubts/ask
 * Student posts a new question
 */
router.post('/doubts/ask', async (req, res) => {
  try {
    const { subjectId, studentName, rollNumber, questionTitle, questionDetails } = req.body;
    if (!subjectId || !questionTitle || !questionDetails) {
      return res.status(400).json({ success: false, error: 'subjectId, questionTitle, and questionDetails are required' });
    }

    const [result] = await pool.query(\`
      INSERT INTO classroom_doubts
      (subject_id, student_name, roll_number, question_title, question_details, upvotes, status, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 'OPEN', NOW())
    \`, [
      subjectId,
      studentName || 'Student',
      rollNumber || 'BEC26000',
      questionTitle,
      questionDetails
    ]);

    res.json({
      success: true,
      message: 'Your doubt has been submitted to the faculty board!',
      doubtId: result.insertId
    });
  } catch (err) {
    console.error('[Classroom - Ask Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/classroom/doubts/:id/reply
 * Faculty or peer answers doubt
 */
router.post('/doubts/:id/reply', async (req, res) => {
  try {
    const doubtId = req.params.id;
    const { authorName, authorRole, replyText } = req.body;
    if (!replyText) {
      return res.status(400).json({ success: false, error: 'replyText is required' });
    }

    await pool.query(\`
      INSERT INTO classroom_doubt_replies (doubt_id, author_name, author_role, reply_text, created_at)
      VALUES (?, ?, ?, ?, NOW())
    \`, [
      doubtId,
      authorName || 'Faculty Mentor',
      authorRole || 'Faculty',
      replyText
    ]);

    // Automatically mark doubt resolved if answered by Faculty
    if (!authorRole || authorRole.toLowerCase().includes('faculty') || authorRole.toLowerCase().includes('mentor')) {
      await pool.query('UPDATE classroom_doubts SET status = "RESOLVED" WHERE id = ?', [doubtId]);
    }

    res.json({
      success: true,
      message: 'Resolution reply recorded successfully!'
    });
  } catch (err) {
    console.error('[Classroom - Reply Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/classroom/doubts/:id/upvote
 */
router.post('/doubts/:id/upvote', async (req, res) => {
  try {
    const doubtId = req.params.id;
    await pool.query('UPDATE classroom_doubts SET upvotes = upvotes + 1 WHERE id = ?', [doubtId]);
    res.json({ success: true, message: 'Upvoted as helpful!' });
  } catch (err) {
    console.error('[Classroom - Upvote Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('gatewayClassroom.js created successfully!');
