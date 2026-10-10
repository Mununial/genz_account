const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin-polls.html';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Polls & Surveys Management | GENZ</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-accent: #2563eb;
      --primary-light: #eff6ff;
      --sky: #0284c7;
      --success: #16a34a;
      --warning: #d97706;
      --danger: #dc2626;
      --dark: #0f172a;
      --gray-border: #e2e8f0;
      --gray-bg: #f8fafc;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body {
      background-color: #f1f5f9;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: #ffffff;
      padding: 16px 24px;
      box-shadow: 0 4px 20px -2px rgba(30, 58, 138, 0.25);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo-circle {
      width: 44px;
      height: 44px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e3a8a;
      font-size: 1.3rem;
      font-weight: 800;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }

    .brand-titles h1 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .brand-titles p {
      font-size: 0.8rem;
      color: #93c5fd;
      font-weight: 600;
      letter-spacing: 0.4px;
    }

    .hub-link {
      background: #ffffff;
      color: #1e3a8a;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .hub-link:hover {
      background: #eff6ff;
      transform: translateY(-1px);
    }

    /* Main Container */
    main {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 20px;
      width: 100%;
      flex: 1;
    }

    /* Hero Banner */
    .hero-banner {
      background: #ffffff;
      border-radius: 16px;
      padding: 24px 28px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .hero-text h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hero-text p {
      color: #64748b;
      margin-top: 6px;
      font-size: 0.92rem;
    }

    .hero-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-action {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #ffffff;
      color: #1e3a8a;
      border: 1px solid #cbd5e1;
      box-shadow: none;
    }

    .btn-secondary:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    /* Use Cases Row */
    .use-cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .use-case-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 18px 20px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }

    .use-case-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .use-case-content h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }

    .use-case-content p {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 2px;
    }

    /* Two Column Layout */
    .two-col-layout {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 24px;
      align-items: start;
    }

    /* Poll Creator Card */
    .creator-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      position: sticky;
      top: 90px;
    }

    .creator-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }

    .form-control {
      width: 100%;
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      outline: none;
      font-family: inherit;
    }

    .form-control:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .options-builder {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .option-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-remove-opt {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-add-opt {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px dashed #93c5fd;
      padding: 8px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    /* Poll Cards List */
    .polls-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .poll-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      position: relative;
    }

    .poll-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .poll-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .poll-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-closed { background: #fee2e2; color: #b91c1c; }
    .badge-audience { background: #eff6ff; color: #1e40af; }
    .badge-time { background: #fef3c7; color: #b45309; }

    .poll-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .poll-question {
      font-size: 0.92rem;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    /* Option Items with Live Tally Bars */
    .poll-options-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .poll-option-row {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      background: #f8fafc;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }

    .poll-option-row:hover {
      border-color: #93c5fd;
      background: #f0f7ff;
    }

    .poll-option-row.voted-option {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .option-bar-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: rgba(37, 99, 235, 0.12);
      z-index: 1;
      transition: width 0.6s ease;
    }

    .option-content {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .option-text-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }

    .option-stats-wrap {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-shrink: 0;
    }

    .option-pct {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e3a8a;
    }

    .option-count {
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
    }

    .poll-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .total-votes-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #64748b;
    }

    /* Toast */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 14px 22px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      transform: translateY(120%);
      transition: transform 0.3s ease-out;
    }

    #toast.show { transform: translateY(0); }
    #toast.success { background: #15803d; }
    #toast.danger { background: #b91c1c; }

    @media (max-width: 992px) {
      .two-col-layout { grid-template-columns: 1fr; }
      .creator-card { position: static; }
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-logo-circle">
          <i class="fa-solid fa-square-poll-vertical"></i>
        </div>
        <div class="brand-titles">
          <h1>GEN-Z UNIVERSITY</h1>
          <p>Student Governance • Live Polls & Community Surveys</p>
        </div>
      </div>
      <div class="header-actions">
        <a href="/admin/hostel-demand" class="hub-link" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);">
          <i class="fa-solid fa-city"></i> Demand Radar
        </a>
        <a href="/admin.html" class="hub-link">
          <i class="fa-solid fa-gauge-high"></i> Admin Hub
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>

    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-text">
        <h2>
          <i class="fa-solid fa-check-to-slot" style="color: #2563eb;"></i>
          Instant Campus Polls & Survey Analytics
        </h2>
        <p>Democratize institutional decisions with verified student participation. Real-time count & percentages.</p>
      </div>
      <div class="hero-controls">
        <div style="font-size: 0.85rem; font-weight: 700; color: #475569;">
          Voting as:
          <select id="voterStudentSelect" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none;" onchange="loadPolls()">
            <option value="2mrsG0R7XVP7SoeTNgIfLjYPtKk1">Nandita Mistry (Roll: PENDING)</option>
            <option value="3x9pisMWMuN9rBzHXsTmZ8NHoG83">Swagatika Behera (Roll: PENDING)</option>
            <option value="2QFRjfIFOTYKqKOY8qR2J1uKTMs2">Om Prakash Sha (Roll: PENDING)</option>
          </select>
        </div>
        <button class="btn-action btn-secondary" onclick="loadPolls()">
          <i class="fa-solid fa-arrows-rotate"></i> Refresh Results
        </button>
      </div>
    </div>

    <!-- 3 Core Use Cases -->
    <div class="use-cases-grid">
      <div class="use-case-card">
        <div class="use-case-icon" style="background: #fef3c7; color: #b45309;">
          <i class="fa-solid fa-utensils"></i>
        </div>
        <div class="use-case-content">
          <h4>Mess Menu Voting</h4>
          <p>Weekly specials & festival dining preferences voted by hostel residents.</p>
        </div>
      </div>
      <div class="use-case-card">
        <div class="use-case-icon" style="background: #eff6ff; color: #1d4ed8;">
          <i class="fa-solid fa-calendar-star"></i>
        </div>
        <div class="use-case-content">
          <h4>Event Preferences</h4>
          <p>Annual fest themes, hackathon tracks, and cultural artist selection.</p>
        </div>
      </div>
      <div class="use-case-card">
        <div class="use-case-icon" style="background: #f0fdf4; color: #15803d;">
          <i class="fa-solid fa-building-circle-check"></i>
        </div>
        <div class="use-case-content">
          <h4>Facility Feedback</h4>
          <p>Gym timings, library weekend hours, and sports arena scheduling.</p>
        </div>
      </div>
    </div>

    <!-- Two Column Layout: Poll Creator (Col 1) + Live Polls List (Col 2) -->
    <div class="two-col-layout">

      <!-- Col 1: Admin Poll Creator -->
      <div class="creator-card">
        <div class="creator-title">
          <i class="fa-solid fa-plus-circle" style="color: #2563eb;"></i>
          Create New Campus Poll
        </div>

        <form id="pollCreateForm" onsubmit="handleCreatePoll(event)">
          <div class="form-group">
            <label>Poll Title / Subject</label>
            <input type="text" id="pollTitleInput" class="form-control" placeholder="e.g. Saturday Special Dinner Menu" required>
          </div>

          <div class="form-group">
            <label>Question for Students</label>
            <textarea id="pollQuestionInput" class="form-control" rows="3" placeholder="State the question clearly..." required></textarea>
          </div>

          <div class="form-group">
            <label>Voting Options (At least 2)</label>
            <div class="options-builder" id="optionsContainer">
              <div class="option-input-row">
                <input type="text" class="form-control opt-input" placeholder="Option A..." required>
              </div>
              <div class="option-input-row">
                <input type="text" class="form-control opt-input" placeholder="Option B..." required>
              </div>
              <div class="option-input-row">
                <input type="text" class="form-control opt-input" placeholder="Option C...">
                <button type="button" class="btn-remove-opt" onclick="removeOptionRow(this)"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
            <button type="button" class="btn-add-opt" onclick="addOptionRow()">
              <i class="fa-solid fa-plus"></i> Add Another Option
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>Duration</label>
              <select id="pollDurationInput" class="form-control">
                <option value="24" selected>24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">3 Days</option>
                <option value="168">7 Days</option>
              </select>
            </div>
            <div class="form-group">
              <label>Audience</label>
              <select id="pollAudienceInput" class="form-control">
                <option value="ALL">All Campus</option>
                <option value="HOSTEL">Hostel Residents</option>
                <option value="BATCH">Specific Batch</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-action" style="width: 100%; justify-content: center; margin-top: 8px;">
            <i class="fa-solid fa-bullhorn"></i> Publish Poll Immediately
          </button>
        </form>
      </div>

      <!-- Col 2: Live Polls List with Real-time Tallies -->
      <div class="polls-list" id="pollsContainer">
        <!-- Rendered Dynamically -->
      </div>

    </div>

  </main>

  <!-- Notification Toast -->
  <div id="toast">
    <i class="fa-solid fa-circle-check"></i>
    <span id="toastMsg">Notification message</span>
  </div>

  <script>
    let activePolls = [];

    document.addEventListener('DOMContentLoaded', () => {
      loadPolls();
    });

    async function loadPolls() {
      const studentId = document.getElementById('voterStudentSelect').value;
      try {
        const res = await fetch('/api/polls/list?studentId=' + studentId);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        activePolls = data.polls || [];
        renderPolls();
      } catch (err) {
        console.error('Error loading polls:', err);
        showToast('Error syncing polls: ' + err.message, 'danger');
      }
    }

    function renderPolls() {
      const container = document.getElementById('pollsContainer');
      container.innerHTML = '';

      if (activePolls.length === 0) {
        container.innerHTML = '<div style="background: #fff; padding: 40px; text-align: center; border-radius: 16px; color: #64748b;">No active polls found. Create one using the form on the left!</div>';
        return;
      }

      activePolls.forEach(p => {
        const card = document.createElement('div');
        card.className = 'poll-card';

        const statusBadge = p.isExpired
          ? '<span class="poll-badge badge-closed"><i class="fa-solid fa-lock"></i> Concluded</span>'
          : '<span class="poll-badge badge-active"><i class="fa-solid fa-circle-check"></i> Active</span>';

        const audienceIcon = p.audienceType === 'HOSTEL' ? 'fa-hotel' : (p.audienceType === 'BATCH' ? 'fa-graduation-cap' : 'fa-users');

        let optionsHtml = '';
        p.options.forEach(opt => {
          const isVoted = p.hasVoted && p.votedOptionIndex === opt.index;
          const votedClass = isVoted ? 'voted-option' : '';
          const checkIcon = isVoted ? '<i class="fa-solid fa-circle-check" style="color: #2563eb;"></i>' : '<i class="fa-regular fa-circle" style="color: #94a3b8;"></i>';

          optionsHtml += \`
            <div class="poll-option-row \${votedClass}" onclick="castVote(\${p.id}, \${opt.index}, '\${opt.text.replace(/'/g, "\\\\'")}')">
              <div class="option-bar-fill" style="width: \${opt.percentage}%;"></div>
              <div class="option-content">
                <div class="option-text-wrap">
                  \${checkIcon}
                  <span>\${opt.text}</span>
                </div>
                <div class="option-stats-wrap">
                  <span class="option-pct">\${opt.percentage}%</span>
                  <span class="option-count">(\${opt.count} votes)</span>
                </div>
              </div>
            </div>
          \`;
        });

        card.innerHTML = \`
          <div class="poll-header">
            <div class="poll-badges">
              \${statusBadge}
              <span class="poll-badge badge-audience">
                <i class="fa-solid \${audienceIcon}"></i> \${p.targetFilter || p.audienceType}
              </span>
              <span class="poll-badge badge-time">
                <i class="fa-solid fa-clock"></i> \${p.durationHours} Hours Duration
              </span>
            </div>
            <a href="/api/polls/\${p.id}/export-csv" class="btn-action btn-secondary" style="padding: 5px 12px; font-size: 0.78rem;" download>
              <i class="fa-solid fa-file-csv"></i> Export Results (CSV)
            </a>
          </div>

          <div class="poll-title">\${p.title}</div>
          <div class="poll-question">\${p.question}</div>

          <div class="poll-options-grid">
            \${optionsHtml}
          </div>

          <div class="poll-footer">
            <span class="total-votes-label">
              <i class="fa-solid fa-check-double" style="color: #2563eb;"></i>
              Total Verified Votes: <strong>\${p.totalVotes} students</strong>
            </span>
            <span style="font-size: 0.8rem; color: #64748b;">
              Created by \${p.createdBy}
            </span>
          </div>
        \`;

        container.appendChild(card);
      });
    }

    async function castVote(pollId, optionIndex, optionText) {
      const studentId = document.getElementById('voterStudentSelect').value;
      try {
        const res = await fetch('/api/polls/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pollId, studentId, optionIndex, optionText })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          loadPolls();
        } else {
          showToast(data.error, 'danger');
        }
      } catch (err) {
        showToast('Vote submission failed: ' + err.message, 'danger');
      }
    }

    async function handleCreatePoll(e) {
      e.preventDefault();
      const title = document.getElementById('pollTitleInput').value.trim();
      const question = document.getElementById('pollQuestionInput').value.trim();
      const durationHours = document.getElementById('pollDurationInput').value;
      const audienceType = document.getElementById('pollAudienceInput').value;

      const optInputs = document.querySelectorAll('.opt-input');
      const options = [];
      optInputs.forEach(i => {
        if (i.value.trim()) options.push(i.value.trim());
      });

      if (options.length < 2) {
        return showToast('Please provide at least 2 options for the poll', 'danger');
      }

      try {
        const res = await fetch('/api/polls/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            question,
            options,
            durationHours,
            audienceType,
            targetFilter: audienceType === 'HOSTEL' ? 'Hostel Residents' : (audienceType === 'BATCH' ? 'Batch 2026' : 'All Campus'),
            createdBy: 'Admin Hub'
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          document.getElementById('pollCreateForm').reset();
          loadPolls();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        showToast('Failed to create poll: ' + err.message, 'danger');
      }
    }

    function addOptionRow() {
      const container = document.getElementById('optionsContainer');
      const char = String.fromCharCode(65 + container.children.length);
      const row = document.createElement('div');
      row.className = 'option-input-row';
      row.innerHTML = \`
        <input type="text" class="form-control opt-input" placeholder="Option \${char}...">
        <button type="button" class="btn-remove-opt" onclick="removeOptionRow(this)"><i class="fa-solid fa-trash"></i></button>
      \`;
      container.appendChild(row);
    }

    function removeOptionRow(btn) {
      const row = btn.parentElement;
      if (document.querySelectorAll('.opt-input').length > 2) {
        row.remove();
      } else {
        showToast('At least 2 options are required', 'danger');
      }
    }

    function showToast(msg, type = 'success') {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toastMsg');
      toastMsg.innerText = msg;
      toast.className = 'show ' + type;
      setTimeout(() => {
        toast.className = '';
      }, 4000);
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(targetFile, htmlContent, 'utf8');
console.log('admin-polls.html created successfully!');
