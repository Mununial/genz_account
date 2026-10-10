const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public';
const targetFile = path.join(targetDir, 'warden-dashboard.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warden Console - Night Curfew & Student Safety | GENZ</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-accent: #2563eb;
      --primary-light: #eff6ff;
      --sky: #0284c7;
      --danger: #dc2626;
      --warning: #d97706;
      --success: #16a34a;
      --dark: #0f172a;
      --gray-light: #f8fafc;
      --gray-border: #e2e8f0;
      --gray-text: #64748b;
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

    /* Top Brand Header */
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .curfew-badge {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fecaca;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .curfew-pulse {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulseAnim 1.5s infinite;
    }

    @keyframes pulseAnim {
      0% { transform: scale(0.9); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
      100% { transform: scale(0.9); opacity: 1; }
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

    /* Executive Hero Banner */
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
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #dc2626;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
    }

    .btn-danger:hover {
      background: #b91c1c;
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

    /* Curfew Timeline Escalation Bar */
    .timeline-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 20px 24px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .timeline-header h3 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timeline-stages {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .stage-box {
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      position: relative;
      transition: transform 0.2s;
    }

    .stage-box:hover {
      transform: translateY(-2px);
    }

    .stage-box.stage-curfew {
      border-left: 5px solid #f59e0b;
    }

    .stage-box.stage-30m {
      border-left: 5px solid #ea580c;
    }

    .stage-box.stage-60m {
      border-left: 5px solid #dc2626;
      background: #fff5f5;
    }

    .stage-box.stage-girls {
      border-left: 5px solid #7c3aed;
      background: #faf5ff;
    }

    .stage-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stage-count {
      font-size: 1.9rem;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0;
    }

    .stage-desc {
      font-size: 0.82rem;
      color: #475569;
      font-weight: 500;
    }

    /* Filters Bar */
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.84rem;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .tab-btn.active {
      background: #1e3a8a;
      color: #ffffff;
      border-color: #1e3a8a;
    }

    .search-input-box {
      position: relative;
      min-width: 260px;
    }

    .search-input-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-input-box input {
      width: 100%;
      padding: 8px 14px 8px 36px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.88rem;
      outline: none;
    }

    /* Missing Students Table Card */
    .table-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      overflow: hidden;
      margin-bottom: 30px;
    }

    .table-card-header {
      padding: 16px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .table-card-header h4 {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    .curfew-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .curfew-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 14px 18px;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .curfew-table td {
      padding: 16px 18px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .curfew-table tr:hover td {
      background: #f8fafc;
    }

    .student-badge-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .student-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #1e3a8a;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .student-avatar.female-avatar {
      background: #faf5ff;
      border-color: #e9d5ff;
      color: #7c3aed;
    }

    .student-meta .student-name {
      font-weight: 800;
      color: #0f172a;
    }

    .student-meta .student-roll {
      font-size: 0.78rem;
      color: #64748b;
      font-weight: 600;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-curfew {
      background: #fef3c7;
      color: #b45309;
    }

    .badge-warning {
      background: #ffedd5;
      color: #c2410c;
    }

    .badge-critical {
      background: #fee2e2;
      color: #b91c1c;
      animation: pulseCritical 2s infinite;
    }

    @keyframes pulseCritical {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }

    .phone-cell {
      font-family: monospace;
      font-weight: 700;
      color: #334155;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-table-action {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.78rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }

    .btn-table-action:hover {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
    }

    .btn-table-sms {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }

    .btn-table-sms:hover {
      background: #10b981;
      color: #ffffff;
      border-color: #10b981;
    }

    .btn-table-return {
      background: #f8fafc;
      color: #475569;
      border-color: #cbd5e1;
    }

    .btn-table-return:hover {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    /* Notification Toast */
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

    #toast.show {
      transform: translateY(0);
    }

    #toast.success {
      background: #15803d;
    }

    #toast.danger {
      background: #b91c1c;
    }

    /* Empty state */
    .empty-state {
      padding: 48px 20px;
      text-align: center;
      color: #64748b;
    }

    .empty-state i {
      font-size: 3rem;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-controls {
        width: 100%;
      }
      .btn-action {
        width: 100%;
        justify-content: center;
      }
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  </style>
</head>
<body>

  <!-- Top Brand Navigation -->
  <header>
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-logo-circle">
          <i class="fa-solid fa-building-shield"></i>
        </div>
        <div class="brand-titles">
          <h1>GEN-Z UNIVERSITY</h1>
          <p>Warden Operations Console • Night Safety & Curfew Intelligence</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="curfew-badge">
          <div class="curfew-pulse"></div>
          <span>Curfew 09:00 PM • <span id="headerLiveTime">--:--:--</span></span>
        </div>
        <a href="/admin.html" class="hub-link">
          <i class="fa-solid fa-gauge-high"></i> Admin Hub
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>

    <!-- Hero Command Banner -->
    <div class="hero-banner">
      <div class="hero-text">
        <h2>
          <i class="fa-solid fa-person-shelter" style="color: #2563eb;"></i>
          Missing Students Alert & Night Curfew Monitor
        </h2>
        <p>Real-time automated curfew surveillance across all Residential Blocks. Zero manual checking needed.</p>
      </div>
      <div class="hero-controls">
        <button class="btn-action btn-danger" onclick="triggerWardenSmsAlert()">
          <i class="fa-solid fa-paper-plane"></i> SMS to Chief Warden
        </button>
        <button class="btn-action" onclick="triggerBatchParentSms()">
          <i class="fa-solid fa-bell"></i> Auto-SMS Missing Parents
        </button>
        <button class="btn-action btn-secondary" onclick="loadCurfewData()">
          <i class="fa-solid fa-arrows-rotate"></i> Refresh Radar
        </button>
      </div>
    </div>

    <!-- Escalation Stages Timeline (Fretbox Parity) -->
    <div class="timeline-card">
      <div class="timeline-header">
        <h3>
          <i class="fa-solid fa-shield-halved" style="color: #1e3a8a;"></i>
          Automated Curfew Escalation Levels
        </h3>
        <span style="font-size: 0.85rem; font-weight: 700; color: #64748b;" id="lastUpdatedLabel">Last synced: Just now</span>
      </div>
      <div class="timeline-stages">
        <div class="stage-box stage-curfew">
          <div class="stage-title">Curfew Overdue (&lt;30m)</div>
          <div class="stage-count" id="countCurfewOverdue" style="color: #d97706;">0</div>
          <div class="stage-desc">Students not back at curfew. Gate entry pending.</div>
        </div>
        <div class="stage-box stage-30m">
          <div class="stage-title">Missing Stage (+30m)</div>
          <div class="stage-count" id="countMissing30m" style="color: #ea580c;">0</div>
          <div class="stage-desc">Still missing after 30 min. Auto-SMS dispatched to parents.</div>
        </div>
        <div class="stage-box stage-60m">
          <div class="stage-title">Critical Escalation (+60m)</div>
          <div class="stage-count" id="countCritical60m" style="color: #dc2626;">0</div>
          <div class="stage-desc">High alert. Warden & Campus Security escalation.</div>
        </div>
        <div class="stage-box stage-girls">
          <div class="stage-title">Girls Hostel Block-B</div>
          <div class="stage-count" id="countGirlsMissing" style="color: #7c3aed;">0</div>
          <div class="stage-desc">Lady students safety priority monitor.</div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button class="tab-btn active" onclick="setFilter('ALL')">
          <i class="fa-solid fa-list-ul"></i> All Checked Out (<span id="tabCountAll">0</span>)
        </button>
        <button class="tab-btn" onclick="setFilter('OVERDUE')">
          <i class="fa-solid fa-clock"></i> Overdue (<span id="tabCountOverdue">0</span>)
        </button>
        <button class="tab-btn" onclick="setFilter('WARNING_30M')">
          <i class="fa-solid fa-triangle-exclamation"></i> +30m Missing (<span id="tabCount30m">0</span>)
        </button>
        <button class="tab-btn" onclick="setFilter('CRITICAL_60M')">
          <i class="fa-solid fa-radiation"></i> +60m Critical (<span id="tabCount60m">0</span>)
        </button>
        <button class="tab-btn" onclick="setFilter('FEMALE')">
          <i class="fa-solid fa-venus"></i> Girls Hostel Only (<span id="tabCountFemale">0</span>)
        </button>
      </div>
      <div class="search-input-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="searchInput" placeholder="Search student name, roll, room..." oninput="handleSearch()">
      </div>
    </div>

    <!-- Missing Students Live Table -->
    <div class="table-card">
      <div class="table-card-header">
        <h4>
          <i class="fa-solid fa-users-viewfinder" style="color: #2563eb;"></i>
          Live Missing Students Roster (Real Database Feed)
        </h4>
        <span class="badge-status badge-curfew" id="tableStatusTag">Monitoring Real-Time</span>
      </div>
      <div class="table-responsive">
        <table class="curfew-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Hostel & Room</th>
              <th>Gate Out Time</th>
              <th>Expected In</th>
              <th>Overdue Delay</th>
              <th>Parent Mobile</th>
              <th>Status / Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="studentsTableBody">
            <tr>
              <td colspan="8" class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Loading real-time curfew surveillance data...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <!-- Notification Toast -->
  <div id="toast">
    <i class="fa-solid fa-circle-check"></i>
    <span id="toastMsg">Action completed successfully</span>
  </div>

  <script>
    let allStudents = [];
    let currentFilter = 'ALL';
    let searchQuery = '';

    // Live clock in header
    setInterval(() => {
      const now = new Date();
      document.getElementById('headerLiveTime').innerText = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }, 1000);

    // Initial Load
    document.addEventListener('DOMContentLoaded', () => {
      loadCurfewData();
      // Auto-refresh every 30 seconds
      setInterval(loadCurfewData, 30000);
    });

    // Fetch data from real backend API
    async function loadCurfewData() {
      try {
        const res = await fetch('/api/curfew-alerts/status');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch data');

        allStudents = data.students || [];
        const s = data.summary;

        // Populate summary counters
        document.getElementById('countCurfewOverdue').innerText = s.curfewOverdue;
        document.getElementById('countMissing30m').innerText = s.missing30m;
        document.getElementById('countCritical60m').innerText = s.critical60m;
        document.getElementById('countGirlsMissing').innerText = s.girlsHostelMissing;

        document.getElementById('tabCountAll').innerText = allStudents.length;
        document.getElementById('tabCountOverdue').innerText = allStudents.filter(st => st.overdueMinutes > 0).length;
        document.getElementById('tabCount30m').innerText = s.missing30m;
        document.getElementById('tabCount60m').innerText = s.critical60m;
        document.getElementById('tabCountFemale').innerText = allStudents.filter(st => st.gender === 'FEMALE').length;

        document.getElementById('lastUpdatedLabel').innerText = 'Last synced: ' + new Date().toLocaleTimeString('en-IN');

        renderTable();
      } catch (err) {
        console.error('Curfew load error:', err);
        showToast('Error syncing curfew radar: ' + err.message, 'danger');
      }
    }

    function setFilter(filter) {
      currentFilter = filter;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.currentTarget.classList.add('active');
      renderTable();
    }

    function handleSearch() {
      searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
      renderTable();
    }

    function renderTable() {
      const tbody = document.getElementById('studentsTableBody');
      let filtered = [...allStudents];

      // Apply Filter Tab
      if (currentFilter === 'OVERDUE') {
        filtered = filtered.filter(s => s.overdueMinutes > 0);
      } else if (currentFilter === 'WARNING_30M') {
        filtered = filtered.filter(s => s.stage === 'WARNING_30M');
      } else if (currentFilter === 'CRITICAL_60M') {
        filtered = filtered.filter(s => s.stage === 'CRITICAL_60M');
      } else if (currentFilter === 'FEMALE') {
        filtered = filtered.filter(s => s.gender === 'FEMALE');
      }

      // Apply Search Query
      if (searchQuery) {
        filtered = filtered.filter(s => 
          s.studentName.toLowerCase().includes(searchQuery) ||
          s.rollNumber.toLowerCase().includes(searchQuery) ||
          s.roomNumber.toLowerCase().includes(searchQuery) ||
          s.hostelName.toLowerCase().includes(searchQuery) ||
          s.parentPhone.toLowerCase().includes(searchQuery)
        );
      }

      if (filtered.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="8" class="empty-state">
              <i class="fa-solid fa-user-check" style="color: #16a34a;"></i>
              <p><strong>All clear!</strong> No students currently missing under the selected filter criteria.</p>
            </td>
          </tr>
        \`;
        return;
      }

      tbody.innerHTML = '';
      filtered.forEach(s => {
        const isFemale = s.gender === 'FEMALE';
        const avatarClass = isFemale ? 'student-avatar female-avatar' : 'student-avatar';
        const initial = s.studentName ? s.studentName.charAt(0).toUpperCase() : 'S';

        let badgeClass = 'badge-curfew';
        let badgeIcon = 'fa-clock';
        let badgeText = s.overdueMinutes + ' min overdue';

        if (s.stage === 'CRITICAL_60M') {
          badgeClass = 'badge-critical';
          badgeIcon = 'fa-radiation';
          badgeText = '+' + s.overdueMinutes + 'm Critical Escalation';
        } else if (s.stage === 'WARNING_30M') {
          badgeClass = 'badge-warning';
          badgeIcon = 'fa-triangle-exclamation';
          badgeText = '+' + s.overdueMinutes + 'm Auto-SMS Alert';
        } else if (s.overdueMinutes === 0) {
          badgeClass = 'badge-curfew';
          badgeIcon = 'fa-check';
          badgeText = 'On Time';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>
            <div class="student-badge-cell">
              <div class="\${avatarClass}">
                \${isFemale ? '<i class=\"fa-solid fa-shield-cat\"></i>' : initial}
              </div>
              <div class="student-meta">
                <div class="student-name">\${s.studentName} \${isFemale ? '<span style=\"color: #7c3aed; font-size: 0.75rem;\"><i class=\"fa-solid fa-venus\"></i></span>' : ''}</div>
                <div class="student-roll">Roll: \${s.rollNumber} • Pass: \${s.passNumber}</div>
              </div>
            </div>
          </td>
          <td>
            <strong>\${s.hostelName}</strong><br>
            <span style="color: #64748b; font-size: 0.8rem;">Room \${s.roomNumber} (Bed \${s.bedNumber})</span>
          </td>
          <td><strong>\${s.lastSeenAtGate}</strong></td>
          <td>
            <strong>\${s.expectedInTime}</strong><br>
            <span style="font-size: 0.78rem; color: #64748b;">\${s.destination}</span>
          </td>
          <td>
            <span class="badge-status \${badgeClass}">
              <i class="fa-solid \${badgeIcon}"></i> \${badgeText}
            </span>
          </td>
          <td>
            <span class="phone-cell">\${s.parentPhone}</span>
          </td>
          <td>
            <span style="font-size: 0.82rem; font-weight: 700; color: \${s.severity === 'critical' ? '#dc2626' : (s.severity === 'high' ? '#ea580c' : '#475569')};">
              \${s.stageLabel}
            </span>
          </td>
          <td>
            <div class="action-group">
              <button class="btn-table-action btn-table-sms" onclick="sendIndividualParentSms(\${s.passId}, '\${s.studentName}', '\${s.rollNumber}', '\${s.parentPhone}', \${s.overdueMinutes})">
                <i class="fa-solid fa-paper-plane"></i> SMS Parent
              </button>
              <button class="btn-table-action btn-table-return" onclick="markStudentReturned(\${s.passId}, '\${s.studentName}')">
                <i class="fa-solid fa-check"></i> Returned
              </button>
            </div>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // Trigger SMS to Chief Warden
    async function triggerWardenSmsAlert() {
      try {
        const res = await fetch('/api/curfew-alerts/notify-warden', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostelName: 'GENZ Campus Hostels' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        showToast('Failed to send warden alert: ' + err.message, 'danger');
      }
    }

    // Trigger Auto-SMS to parents of missing students
    async function triggerBatchParentSms() {
      const missingList = allStudents.filter(s => s.overdueMinutes >= 30);
      if (missingList.length === 0) {
        return showToast('No students currently overdue by 30+ minutes.', 'success');
      }

      let count = 0;
      for (const st of missingList) {
        await sendIndividualParentSms(st.passId, st.studentName, st.rollNumber, st.parentPhone, st.overdueMinutes, false);
        count++;
      }
      showToast(\`Dispatched emergency curfew SMS to parents of \${count} missing students.\`, 'success');
    }

    // Send single parent SMS
    async function sendIndividualParentSms(passId, studentName, rollNumber, parentPhone, overdueMinutes, notifyToast = true) {
      try {
        const res = await fetch('/api/curfew-alerts/notify-parents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId, studentName, rollNumber, parentPhone, overdueMinutes })
        });
        const data = await res.json();
        if (data.success) {
          if (notifyToast) showToast(data.message, 'success');
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        if (notifyToast) showToast('SMS error: ' + err.message, 'danger');
      }
    }

    // Mark student returned
    async function markStudentReturned(passId, studentName) {
      if (!confirm(\`Confirm that \${studentName} has returned and entered the hostel?\`)) return;

      try {
        const res = await fetch('/api/curfew-alerts/mark-returned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId })
        });
        const data = await res.json();
        if (data.success) {
          showToast(\`\${studentName} marked returned. Curfew alert cleared.\`, 'success');
          loadCurfewData();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        showToast('Error marking returned: ' + err.message, 'danger');
      }
    }

    // Toast Helper
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
console.log('warden-dashboard.html created successfully!');
