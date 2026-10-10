const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/classroom.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Classroom Hub & Doubt Forum | GEN-Z UNIVERSITY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-accent: #2563eb;
      --primary-light: #eff6ff;
      --surface: #ffffff;
      --background: #f8fafc;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #16a34a;
      --warning: #d97706;
      --danger: #dc2626;
      --radius: 14px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--background);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-accent) 100%);
      color: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 800;
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.02em;
    }

    .brand-text p {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-nav {
      background: #f1f5f9;
      color: #334155;
      text-decoration: none;
      padding: 8px 14px;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-nav:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .badge-hub {
      background: #dbeafe;
      color: #1e40af;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    main {
      max-width: 1380px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px;
      flex: 1;
    }

    /* Hero Banner */
    .classroom-hero {
      background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
      border-radius: var(--radius);
      padding: 28px 32px;
      color: #fff;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 10px 25px rgba(30, 58, 138, 0.15);
    }

    .hero-title h2 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .hero-title p {
      font-size: 0.9rem;
      color: #bfdbfe;
      margin-top: 4px;
    }

    .hero-btn {
      background: #ffffff;
      color: var(--primary);
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .hero-btn:hover {
      background: #eff6ff;
      transform: translateY(-1px);
    }

    /* Tabs & Filters */
    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .tabs-nav {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .subject-filter select {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
      outline: none;
      cursor: pointer;
    }

    /* Notes Grid */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .note-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s;
    }

    .note-card:hover {
      border-color: #93c5fd;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.04);
    }

    .note-meta-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
    }

    .badge-code { background: #dbeafe; color: #1e40af; }
    .badge-unit { background: #fef3c7; color: #b45309; }
    .badge-type { background: #fee2e2; color: #b91c1c; }
    .badge-resolved { background: #dcfce7; color: #15803d; }
    .badge-open { background: #fef3c7; color: #b45309; }

    .note-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .note-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 18px;
    }

    .note-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #f1f5f9;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .btn-download {
      background: var(--primary-accent);
      color: #fff;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.82rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-download:hover {
      background: #1d4ed8;
    }

    /* Doubts Section */
    .doubts-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .doubt-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .doubt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .doubt-author {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .doubt-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #eff6ff;
      color: var(--primary-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    .doubt-q-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .doubt-q-text {
      font-size: 0.88rem;
      color: #334155;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .replies-thread {
      background: #f8fafc;
      border-radius: 10px;
      padding: 14px;
      margin-top: 14px;
      border: 1px solid #e2e8f0;
    }

    .reply-item {
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.85rem;
    }

    .reply-item:last-child { border-bottom: none; }

    .reply-author {
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }

    .reply-text {
      color: #334155;
      line-height: 1.4;
    }

    .doubt-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
    }

    .btn-upvote {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .reply-input-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .reply-input-row input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.85rem;
      font-family: inherit;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
    }

    .modal-card {
      background: #fff;
      border-radius: 14px;
      padding: 24px;
      max-width: 500px;
      width: 100%;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.85rem;
    }

    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      display: none;
      z-index: 9999;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand-wrap">
      <div class="brand-logo">
        <i class="fa-solid fa-book-open-reader"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Academic Classroom Hub • Lecture Handouts & Doubt Forum</p>
      </div>
    </div>
    <div class="nav-actions">
      <span class="badge-hub"><i class="fa-solid fa-cloud"></i> Cloudinary Sync</span>
      <a href="/staff" class="btn-nav"><i class="fa-solid fa-chalkboard-user"></i> Staff Hub</a>
      <a href="/warden" class="btn-nav"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
      <a href="/parent" class="btn-nav"><i class="fa-solid fa-users"></i> Parent Portal</a>
      <a href="/admin" class="btn-nav" style="background: var(--primary); color: #fff;"><i class="fa-solid fa-gauge-high"></i> Admin Hub</a>
    </div>
  </header>

  <main>
    
    <!-- Hero Banner -->
    <div class="classroom-hero">
      <div class="hero-title">
        <h2>Digital Classroom & Doubt Resolution Engine</h2>
        <p>Access official faculty lecture notes, laboratory assignments, and peer doubt clearance 24/7.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="openUploadModal()" class="hero-btn">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Note (Faculty)
        </button>
        <button onclick="openDoubtModal()" class="hero-btn" style="background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3);">
          <i class="fa-solid fa-circle-question"></i> Ask a Doubt
        </button>
      </div>
    </div>

    <!-- Controls Row -->
    <div class="controls-row">
      <div class="tabs-nav">
        <button class="tab-btn active" id="tabBtnNotes" onclick="switchClassTab('notes')">
          <i class="fa-solid fa-file-pdf"></i> Lecture Handouts & Notes
        </button>
        <button class="tab-btn" id="tabBtnDoubts" onclick="switchClassTab('doubts')">
          <i class="fa-solid fa-comments"></i> Student Doubt Forum
        </button>
      </div>

      <div class="subject-filter">
        <select id="subjectFilterSelect" onchange="filterBySubject(this.value)">
          <option value="">All Academic Subjects</option>
        </select>
      </div>
    </div>

    <!-- Tab 1: Lecture Notes Grid -->
    <div id="notesContainer" class="notes-grid">
      <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">
        Loading lecture notes repository...
      </div>
    </div>

    <!-- Tab 2: Doubts Forum List -->
    <div id="doubtsContainer" class="doubts-list" style="display: none;">
      <div style="text-align: center; color: #94a3b8; padding: 40px;">
        Loading student doubts...
      </div>
    </div>

  </main>

  <!-- Upload Modal -->
  <div class="modal-overlay" id="uploadModal">
    <div class="modal-card">
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Lecture Handout
      </h3>
      <form onsubmit="handleUploadNote(event)">
        <div class="form-group">
          <label>Subject *</label>
          <select id="modalUploadSubject" class="form-control" required></select>
        </div>
        <div class="form-group">
          <label>Unit / Module Name *</label>
          <input type="text" id="modalUploadUnit" class="form-control" placeholder="e.g. Unit 3: Graph Algorithms" required>
        </div>
        <div class="form-group">
          <label>Handout Title *</label>
          <input type="text" id="modalUploadTitle" class="form-control" placeholder="e.g. Dijkstra Shortest Path Notes" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="modalUploadDesc" class="form-control" style="height: 70px;" placeholder="Key topics covered, proofs, formulas..."></textarea>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 16px;">
          <button type="button" onclick="closeUploadModal()" style="flex: 1; padding: 10px; border: 1px solid var(--border); background: #f8fafc; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
          <button type="submit" style="flex: 1; padding: 10px; border: none; background: var(--primary-accent); color: #fff; border-radius: 8px; font-weight: 700; cursor: pointer;">Publish Note</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Ask Doubt Modal -->
  <div class="modal-overlay" id="doubtModal">
    <div class="modal-card">
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
        <i class="fa-solid fa-circle-question"></i> Post Academic Doubt
      </h3>
      <form onsubmit="handleAskDoubt(event)">
        <div class="form-group">
          <label>Subject *</label>
          <select id="modalDoubtSubject" class="form-control" required></select>
        </div>
        <div class="form-group">
          <label>Your Name & Roll No *</label>
          <input type="text" id="modalDoubtStudent" class="form-control" placeholder="e.g. Deepak Kumar Kabi (BEC26022)" required>
        </div>
        <div class="form-group">
          <label>Question Headline *</label>
          <input type="text" id="modalDoubtTitle" class="form-control" placeholder="e.g. Worst-case time complexity of QuickSelect" required>
        </div>
        <div class="form-group">
          <label>Detailed Question *</label>
          <textarea id="modalDoubtDetails" class="form-control" style="height: 90px;" placeholder="Explain where you got stuck..." required></textarea>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 16px;">
          <button type="button" onclick="closeDoubtModal()" style="flex: 1; padding: 10px; border: 1px solid var(--border); background: #f8fafc; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
          <button type="submit" style="flex: 1; padding: 10px; border: none; background: #16a34a; color: #fff; border-radius: 8px; font-weight: 700; cursor: pointer;">Submit Doubt</button>
        </div>
      </form>
    </div>
  </div>

  <div id="toast"></div>

  <script>
    let activeTab = 'notes';
    let currentSubjectId = '';

    function showToast(msg, isSuccess = true) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = isSuccess ? '#16a34a' : '#dc2626';
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    function switchClassTab(tab) {
      activeTab = tab;
      document.getElementById('tabBtnNotes').classList.toggle('active', tab === 'notes');
      document.getElementById('tabBtnDoubts').classList.toggle('active', tab === 'doubts');

      document.getElementById('notesContainer').style.display = tab === 'notes' ? 'grid' : 'none';
      document.getElementById('doubtsContainer').style.display = tab === 'doubts' ? 'flex' : 'none';

      if (tab === 'notes') loadNotes();
      else loadDoubts();
    }

    function filterBySubject(subjId) {
      currentSubjectId = subjId;
      if (activeTab === 'notes') loadNotes();
      else loadDoubts();
    }

    async function loadSubjects() {
      try {
        const res = await fetch('/api/classroom/subjects');
        const data = await res.json();
        if (data.success) {
          const filterSel = document.getElementById('subjectFilterSelect');
          const upSel = document.getElementById('modalUploadSubject');
          const dbtSel = document.getElementById('modalDoubtSubject');

          filterSel.innerHTML = '<option value="">All Academic Subjects</option>';
          upSel.innerHTML = '';
          dbtSel.innerHTML = '';

          data.subjects.forEach(s => {
            const opt = \`<option value="\${s.id}">\${s.subject_code} - \${s.subject_name}</option>\`;
            filterSel.innerHTML += opt;
            upSel.innerHTML += opt;
            dbtSel.innerHTML += opt;
          });
        }
      } catch (err) {
        console.error('Subjects error:', err);
      }
    }

    async function loadNotes() {
      try {
        const url = currentSubjectId ? '/api/classroom/notes?subjectId=' + currentSubjectId : '/api/classroom/notes';
        const res = await fetch(url);
        const data = await res.json();
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';

        if (!data.success || data.notes.length === 0) {
          container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No lecture notes uploaded for this selection.</div>';
          return;
        }

        data.notes.forEach(n => {
          const card = document.createElement('div');
          card.className = 'note-card';
          card.innerHTML = \`
            <div>
              <div class="note-meta-badges">
                <span class="badge badge-code">\${n.subject_code}</span>
                <span class="badge badge-unit">\${n.unit_name}</span>
                <span class="badge badge-type"><i class="fa-solid fa-file-pdf"></i> \${n.file_type} (\${n.file_size})</span>
              </div>
              <div class="note-title">\${n.title}</div>
              <div class="note-desc">\${n.description || ''}</div>
            </div>
            <div class="note-footer">
              <span><i class="fa-solid fa-user-tie"></i> \${n.uploaded_by}</span>
              <a href="\${n.file_url}" target="_blank" class="btn-download" onclick="recordDownload(\${n.id})">
                <i class="fa-solid fa-download"></i> View / Download
              </a>
            </div>
          \`;
          container.appendChild(card);
        });
      } catch (err) {
        console.error('Notes error:', err);
      }
    }

    async function loadDoubts() {
      try {
        const url = currentSubjectId ? '/api/classroom/doubts?subjectId=' + currentSubjectId : '/api/classroom/doubts';
        const res = await fetch(url);
        const data = await res.json();
        const container = document.getElementById('doubtsContainer');
        container.innerHTML = '';

        if (!data.success || data.doubts.length === 0) {
          container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;">No student doubts found. Be the first to ask!</div>';
          return;
        }

        data.doubts.forEach(d => {
          const card = document.createElement('div');
          card.className = 'doubt-card';

          const isResolved = d.status === 'RESOLVED';
          const statusBadge = isResolved
            ? '<span class="badge badge-resolved"><i class="fa-solid fa-circle-check"></i> Resolved by Faculty</span>'
            : '<span class="badge badge-open"><i class="fa-solid fa-clock"></i> Open for Discussion</span>';

          let repliesHtml = '';
          if (d.replies && d.replies.length > 0) {
            d.replies.forEach(r => {
              repliesHtml += \`
                <div class="reply-item">
                  <div class="reply-author">
                    <i class="fa-solid fa-user-graduate"></i> \${r.author_name} <small style="color: #64748b; font-weight: normal;">(\${r.author_role})</small>
                  </div>
                  <div class="reply-text">\${r.reply_text}</div>
                </div>
              \`;
            });
          } else {
            repliesHtml = '<div style="color: #94a3b8; font-size: 0.8rem;">No answers yet. Faculty mentor will address shortly.</div>';
          }

          card.innerHTML = \`
            <div class="doubt-header">
              <div class="doubt-author">
                <div class="doubt-avatar">\${d.student_name.charAt(0)}</div>
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem;">\${d.student_name}</div>
                  <div style="font-size: 0.78rem; color: #64748b;">\${d.roll_number} • \${d.subject_code}</div>
                </div>
              </div>
              <div>\${statusBadge}</div>
            </div>

            <div class="doubt-q-title">\${d.question_title}</div>
            <div class="doubt-q-text">\${d.question_details}</div>

            <div class="replies-thread">
              <div style="font-size: 0.8rem; font-weight: 800; color: #1e40af; margin-bottom: 8px;">
                <i class="fa-solid fa-comments"></i> Faculty & Peer Answers (\${d.replies ? d.replies.length : 0})
              </div>
              \${repliesHtml}

              <div class="reply-input-row">
                <input type="text" id="replyInput_\${d.id}" placeholder="Type an answer or faculty clarification...">
                <button onclick="submitReply(\${d.id})" class="btn-download" style="border: none; cursor: pointer;">
                  <i class="fa-solid fa-reply"></i> Reply
                </button>
              </div>
            </div>

            <div class="doubt-actions">
              <button onclick="upvoteDoubt(\${d.id})" class="btn-upvote">
                <i class="fa-solid fa-thumbs-up"></i> Helpful (\${d.upvotes})
              </button>
            </div>
          \`;
          container.appendChild(card);
        });
      } catch (err) {
        console.error('Doubts error:', err);
      }
    }

    async function submitReply(doubtId) {
      const input = document.getElementById('replyInput_' + doubtId);
      const text = input.value.trim();
      if (!text) return showToast('Please enter your reply', false);

      try {
        const res = await fetch('/api/classroom/doubts/' + doubtId + '/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorName: 'Prof. Dr. S. R. Jena',
            authorRole: 'Senior Faculty & HOD',
            replyText: text
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadDoubts();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Reply failed: ' + err.message, false);
      }
    }

    async function upvoteDoubt(doubtId) {
      try {
        const res = await fetch('/api/classroom/doubts/' + doubtId + '/upvote', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadDoubts();
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function handleUploadNote(e) {
      e.preventDefault();
      const subjectId = document.getElementById('modalUploadSubject').value;
      const unitName = document.getElementById('modalUploadUnit').value.trim();
      const title = document.getElementById('modalUploadTitle').value.trim();
      const description = document.getElementById('modalUploadDesc').value.trim();

      try {
        const res = await fetch('/api/classroom/notes/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId,
            unitName,
            title,
            description,
            uploadedBy: 'Prof. Dr. S. R. Jena'
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          closeUploadModal();
          loadNotes();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Upload error: ' + err.message, false);
      }
    }

    async function handleAskDoubt(e) {
      e.preventDefault();
      const subjectId = document.getElementById('modalDoubtSubject').value;
      const studentStr = document.getElementById('modalDoubtStudent').value.trim();
      const questionTitle = document.getElementById('modalDoubtTitle').value.trim();
      const questionDetails = document.getElementById('modalDoubtDetails').value.trim();

      try {
        const res = await fetch('/api/classroom/doubts/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId,
            studentName: studentStr.split('(')[0].trim(),
            rollNumber: (studentStr.match(/\\(([^)]+)\\)/) || [])[1] || 'BEC26022',
            questionTitle,
            questionDetails
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          closeDoubtModal();
          switchClassTab('doubts');
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Error asking doubt: ' + err.message, false);
      }
    }

    function recordDownload(id) {
      showToast('Downloading verified GENZ Lecture Note PDF...', true);
    }

    function openUploadModal() { document.getElementById('uploadModal').style.display = 'flex'; }
    function closeUploadModal() { document.getElementById('uploadModal').style.display = 'none'; }
    function openDoubtModal() { document.getElementById('doubtModal').style.display = 'flex'; }
    function closeDoubtModal() { document.getElementById('doubtModal').style.display = 'none'; }

    // Init
    loadSubjects();
    loadNotes();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('classroom.html created successfully!');
