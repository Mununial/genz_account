const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/security-dashboard.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Gate Desk | GEN-Z UNIVERSITY</title>
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

    /* Top Nav */
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

    .role-badge {
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

    /* Main Container */
    main {
      max-width: 1380px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px;
      flex: 1;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }

    .kpi-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .icon-blue { background: #dbeafe; color: #1d4ed8; }
    .icon-green { background: #dcfce7; color: #15803d; }
    .icon-amber { background: #fef3c7; color: #b45309; }
    .icon-red { background: #fee2e2; color: #b91c1c; }

    .kpi-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 3px;
    }

    /* Dashboard Layout */
    .dashboard-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .dashboard-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Panels */
    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      margin-bottom: 24px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .panel-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 14px;
    }

    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: 9px;
      font-family: inherit;
      font-size: 0.88rem;
      background: #f8fafc;
      color: var(--text-main);
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-accent);
      background: #fff;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }

    .btn-submit {
      width: 100%;
      background: var(--primary-accent);
      color: #fff;
      border: none;
      padding: 12px;
      border-radius: 9px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .btn-submit:hover {
      background: #1d4ed8;
    }

    /* Tabs */
    .tabs-nav {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 16px;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 10px 18px;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }

    .tab-btn.active {
      color: var(--primary-accent);
      border-bottom-color: var(--primary-accent);
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 12px 14px;
      border-bottom: 2px solid var(--border);
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      color: #1e293b;
      vertical-align: middle;
    }

    tr:hover td {
      background: #f8fafc;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
    }

    .badge-in { background: #dcfce7; color: #15803d; }
    .badge-out { background: #fee2e2; color: #b91c1c; }
    .badge-completed { background: #f1f5f9; color: #475569; }
    .badge-pending { background: #fef3c7; color: #b45309; }

    .action-btn {
      padding: 6px 12px;
      border-radius: 7px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }

    .btn-return { background: #dcfce7; color: #15803d; }
    .btn-return:hover { background: #bbf7d0; }
    .btn-exit { background: #fee2e2; color: #b91c1c; }
    .btn-exit:hover { background: #fecaca; }
    .btn-checkout { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .btn-checkout:hover { background: #dbeafe; }

    /* Toast */
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
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Main Security Gate Desk • Fast Scanner & Visitor Log</p>
      </div>
    </div>
    <div class="nav-actions">
      <span class="role-badge"><i class="fa-solid fa-gate"></i> Gate 1 • Shift-A</span>
      <a href="/warden" class="btn-nav"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
      <a href="/staff" class="btn-nav"><i class="fa-solid fa-chalkboard-user"></i> Staff Hub</a>
      <a href="/parent" class="btn-nav"><i class="fa-solid fa-users"></i> Parent Portal</a>
      <a href="/admin" class="btn-nav" style="background: var(--primary); color: #fff;"><i class="fa-solid fa-gauge-high"></i> Admin Hub</a>
    </div>
  </header>

  <main>
    <!-- KPI Overview -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon icon-blue"><i class="fa-solid fa-user-check"></i></div>
        <div>
          <div class="kpi-val" id="statInsideVisitors">0</div>
          <div class="kpi-label">Inside Campus Visitors</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-green"><i class="fa-solid fa-clipboard-list"></i></div>
        <div>
          <div class="kpi-val" id="statTotalVisitorsToday">0</div>
          <div class="kpi-label">Total Visitors Today</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-amber"><i class="fa-solid fa-person-walking-arrow-right"></i></div>
        <div>
          <div class="kpi-val" id="statStudentsOut">0</div>
          <div class="kpi-label">Students Out on Pass</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
          <div class="kpi-val" id="statLateEntries">0</div>
          <div class="kpi-label">Overdue / Late Entries</div>
        </div>
      </div>
    </div>

    <!-- Main 2-Col Layout -->
    <div class="dashboard-layout">
      
      <!-- Left Column: Actions -->
      <div>
        <!-- Quick Fast Scanner Panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title"><i class="fa-solid fa-barcode"></i> Fast Gate Pass Scanner</div>
          </div>
          <div class="form-group">
            <label>Scan Barcode / Enter Pass ID</label>
            <input type="text" id="scanPassIdInput" class="form-control" placeholder="e.g. 1 or GP-2026-001">
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="handleScanPass('EXIT')" class="btn-submit" style="background: #dc2626; flex: 1;">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Mark Student Exit
            </button>
            <button onclick="handleScanPass('RETURN')" class="btn-submit" style="background: #16a34a; flex: 1;">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Mark Returned
            </button>
          </div>
        </div>

        <!-- Visitor Registration Panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title"><i class="fa-solid fa-id-card-clip"></i> Register New Visitor</div>
          </div>
          <form id="visitorForm" onsubmit="handleVisitorCheckin(event)">
            <div class="form-group">
              <label>Visitor Full Name *</label>
              <input type="text" id="vName" class="form-control" placeholder="e.g. Ramesh Chandra Sethi" required>
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" id="vPhone" class="form-control" placeholder="e.g. +91-9861011223" required>
            </div>
            <div class="form-group">
              <label>Visitor Type</label>
              <select id="vType" class="form-control">
                <option value="PARENT">Parent / Guardian</option>
                <option value="VENDOR">Vendor / Contractor</option>
                <option value="GUEST_FACULTY">Guest Faculty / Academic</option>
                <option value="OFFICIAL">Government / Inspection Official</option>
                <option value="ALUMNI">Alumni / General Guest</option>
              </select>
            </div>
            <div class="form-group">
              <label>Student Roll / ID to Visit (Optional)</label>
              <input type="text" id="vStudent" class="form-control" placeholder="e.g. BEC26204">
            </div>
            <div class="form-group">
              <label>Purpose of Visit</label>
              <input type="text" id="vPurpose" class="form-control" placeholder="e.g. Fee clearance & hostel meeting">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label>ID Proof</label>
                <select id="vIdType" class="form-control">
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PAN">PAN Card</option>
                </select>
              </div>
              <div class="form-group">
                <label>Last 4 Digits</label>
                <input type="text" id="vIdLast4" class="form-control" maxlength="4" placeholder="e.g. 4892">
              </div>
            </div>
            <button type="submit" class="btn-submit">
              <i class="fa-solid fa-shield-check"></i> Grant Gate Pass & Check In
            </button>
          </form>
        </div>
      </div>

      <!-- Right Column: Live Movement Logs -->
      <div>
        <div class="panel">
          <div class="tabs-nav">
            <button class="tab-btn active" onclick="switchTab('passes')"><i class="fa-solid fa-person-walking-dashed-line-arrow-right"></i> Student Movement Passes</button>
            <button class="tab-btn" onclick="switchTab('visitors')"><i class="fa-solid fa-clipboard-user"></i> Active Visitors Inside Campus</button>
          </div>

          <!-- Tab 1: Passes -->
          <div id="passesTab">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pass ID</th>
                    <th>Student Name</th>
                    <th>Hostel / Branch</th>
                    <th>Expected In</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="passesTableBody">
                  <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Loading student passes...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab 2: Visitors -->
          <div id="visitorsTab" style="display: none;">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>Phone / Type</th>
                    <th>Meeting With</th>
                    <th>Check In Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="visitorsTableBody">
                  <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Loading visitors...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  </main>

  <div id="toast"></div>

  <script>
    let activeTab = 'passes';

    function showToast(msg, isSuccess = true) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = isSuccess ? '#16a34a' : '#dc2626';
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      if (tab === 'passes') {
        document.getElementById('passesTab').style.display = 'block';
        document.getElementById('visitorsTab').style.display = 'none';
        loadPasses();
      } else {
        document.getElementById('passesTab').style.display = 'none';
        document.getElementById('visitorsTab').style.display = 'block';
        loadVisitors();
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/roles/security/stats');
        const data = await res.json();
        if (data.success) {
          document.getElementById('statInsideVisitors').innerText = data.stats.insideVisitors;
          document.getElementById('statTotalVisitorsToday').innerText = data.stats.totalVisitorsToday;
          document.getElementById('statStudentsOut').innerText = data.stats.studentsOut;
          document.getElementById('statLateEntries').innerText = data.stats.lateEntries;
        }
      } catch (e) {
        console.error('Stats error:', e);
      }
    }

    async function loadPasses() {
      try {
        const res = await fetch('/api/roles/security/passes');
        const data = await res.json();
        const tbody = document.getElementById('passesTableBody');
        tbody.innerHTML = '';

        if (!data.success || data.passes.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No active student gate passes recorded.</td></tr>';
          return;
        }

        data.passes.forEach(p => {
          const tr = document.createElement('tr');
          const isOut = p.status === 'EXITED';
          const isReturned = p.status === 'RETURNED';

          const badgeClass = isOut ? 'badge-out' : (isReturned ? 'badge-completed' : 'badge-pending');
          const badgeText = isOut ? 'Currently Out' : (isReturned ? 'Returned' : 'Approved (At Gate)');

          let actionBtn = '';
          if (!isReturned) {
            if (!isOut) {
              actionBtn = \`<button onclick="updatePassAction(\${p.id}, 'EXIT')" class="action-btn btn-exit"><i class="fa-solid fa-arrow-right-from-bracket"></i> Exit</button>\`;
            } else {
              actionBtn = \`<button onclick="updatePassAction(\${p.id}, 'RETURN')" class="action-btn btn-return"><i class="fa-solid fa-arrow-right-to-bracket"></i> Return</button>\`;
            }
          } else {
            actionBtn = '<span style="font-size: 0.75rem; color: #16a34a; font-weight: 700;">Completed</span>';
          }

          tr.innerHTML = \`
            <td><strong>#\${p.id}</strong><br><small style="color: #64748b;">\${p.pass_number || 'GP-GENZ'}</small></td>
            <td><strong>\${p.student_name || 'Verified Student'}</strong><br><small style="color: #64748b;">Roll: \${p.roll_number || 'PENDING'}</small></td>
            <td>\${p.hostel_name || 'Hostel Block'}<br><small style="color: #64748b;">\${p.branch || 'Engineering'}</small></td>
            <td>\${p.expected_in_date_time ? new Date(p.expected_in_date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '09:00 PM'}</td>
            <td><span class="badge \${badgeClass}">\${badgeText}</span></td>
            <td>\${actionBtn}</td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error('Passes error:', e);
      }
    }

    async function loadVisitors() {
      try {
        const res = await fetch('/api/roles/security/visitors');
        const data = await res.json();
        const tbody = document.getElementById('visitorsTableBody');
        tbody.innerHTML = '';

        if (!data.success || data.visitors.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No visitors currently registered.</td></tr>';
          return;
        }

        data.visitors.forEach(v => {
          const tr = document.createElement('tr');
          const isInside = v.status === 'CHECKED_IN';
          const badgeClass = isInside ? 'badge-in' : 'badge-completed';
          const badgeText = isInside ? 'Inside Campus' : 'Checked Out';

          const actionBtn = isInside
            ? \`<button onclick="handleVisitorCheckout(\${v.id})" class="action-btn btn-checkout"><i class="fa-solid fa-right-from-bracket"></i> Check Out</button>\`
            : '<span style="font-size: 0.75rem; color: #64748b; font-weight: 700;">Cleared Gate</span>';

          tr.innerHTML = \`
            <td><strong>\${v.visitor_name}</strong><br><small style="color: #64748b;">ID: \${v.identification_type} (...\${v.identification_last4})</small></td>
            <td>\${v.visitor_phone}<br><span class="badge" style="background: #eff6ff; color: #1d4ed8;">\${v.visitor_type}</span></td>
            <td>\${v.student_name ? v.student_name : 'Administrative Guest'}<br><small style="color: #64748b;">\${v.purpose}</small></td>
            <td>\${v.actual_check_in ? new Date(v.actual_check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '10:00 AM'}</td>
            <td><span class="badge \${badgeClass}">\${badgeText}</span></td>
            <td>\${actionBtn}</td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error('Visitors error:', e);
      }
    }

    async function updatePassAction(passId, action) {
      try {
        const res = await fetch('/api/roles/security/scan-gate-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId, action })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadPasses();
          loadStats();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Operation failed: ' + err.message, false);
      }
    }

    async function handleScanPass(action) {
      const passId = document.getElementById('scanPassIdInput').value.trim();
      if (!passId) return showToast('Please enter or scan a Pass ID', false);
      await updatePassAction(passId, action);
      document.getElementById('scanPassIdInput').value = '';
    }

    async function handleVisitorCheckin(e) {
      e.preventDefault();
      const payload = {
        visitorName: document.getElementById('vName').value.trim(),
        visitorPhone: document.getElementById('vPhone').value.trim(),
        visitorType: document.getElementById('vType').value,
        studentRollOrId: document.getElementById('vStudent').value.trim(),
        purpose: document.getElementById('vPurpose').value.trim(),
        identificationType: document.getElementById('vIdType').value,
        idLast4: document.getElementById('vIdLast4').value.trim()
      };

      try {
        const res = await fetch('/api/roles/security/visitor-check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          document.getElementById('visitorForm').reset();
          loadStats();
          if (activeTab === 'visitors') loadVisitors();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Check-in failed: ' + err.message, false);
      }
    }

    async function handleVisitorCheckout(visitId) {
      try {
        const res = await fetch('/api/roles/security/visitor-check-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitId })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadStats();
          loadVisitors();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Checkout failed: ' + err.message, false);
      }
    }

    // Init
    loadStats();
    loadPasses();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('security-dashboard.html created successfully!');
