const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/staff-dashboard.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff & Faculty Portal | GEN-Z UNIVERSITY</title>
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
      background: #eff6ff;
      color: #1d4ed8;
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
    .icon-amber { background: #fef3c7; color: #b45309; }
    .icon-green { background: #dcfce7; color: #15803d; }
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

    /* Panel */
    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
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
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Tabs */
    .tabs-nav {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 20px;
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

    /* Table */
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

    .badge-approved { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }
    .badge-defaulter { background: #fee2e2; color: #b91c1c; }
    .badge-good { background: #dcfce7; color: #15803d; }

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

    .btn-approve { background: #dcfce7; color: #15803d; }
    .btn-approve:hover { background: #bbf7d0; }
    .btn-reject { background: #fee2e2; color: #b91c1c; }
    .btn-reject:hover { background: #fecaca; }

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
        <i class="fa-solid fa-chalkboard-user"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Faculty & Student Mentorship Hub • Prof. Dr. S. R. Jena</p>
      </div>
    </div>
    <div class="nav-actions">
      <span class="role-badge"><i class="fa-solid fa-user-tie"></i> Faculty / Mentor</span>
      <a href="/security" class="btn-nav"><i class="fa-solid fa-shield-halved"></i> Gate Desk</a>
      <a href="/warden" class="btn-nav"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
      <a href="/parent" class="btn-nav"><i class="fa-solid fa-users"></i> Parent Portal</a>
      <a href="/admin" class="btn-nav" style="background: var(--primary); color: #fff;"><i class="fa-solid fa-gauge-high"></i> Admin Hub</a>
    </div>
  </header>

  <main>
    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon icon-amber"><i class="fa-solid fa-envelope-open-text"></i></div>
        <div>
          <div class="kpi-val" id="kpiPendingLeaves">0</div>
          <div class="kpi-label">Pending Leave Approvals</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-blue"><i class="fa-solid fa-user-graduate"></i></div>
        <div>
          <div class="kpi-val" id="kpiTotalStudents">0</div>
          <div class="kpi-label">Mentored Students</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-green"><i class="fa-solid fa-calendar-check"></i></div>
        <div>
          <div class="kpi-val">4</div>
          <div class="kpi-label">Lecture Classes Today</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
          <div class="kpi-val" id="kpiDefaulters">0</div>
          <div class="kpi-label">Attendance Defaulters (&lt;75%)</div>
        </div>
      </div>
    </div>

    <!-- Main Panel -->
    <div class="panel">
      <div class="tabs-nav">
        <button class="tab-btn active" onclick="switchStaffTab('leaves')"><i class="fa-solid fa-file-signature"></i> Student Leave Requests</button>
        <button class="tab-btn" onclick="switchStaffTab('defaulters')"><i class="fa-solid fa-triangle-exclamation"></i> Low Attendance Defaulter Radar</button>
      </div>

      <!-- Tab 1: Leaves -->
      <div id="leavesTab">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Leave No.</th>
                <th>Student Details</th>
                <th>Dates & Type</th>
                <th>Reason / Destination</th>
                <th>Status</th>
                <th>Faculty Decision</th>
              </tr>
            </thead>
            <tbody id="leavesTableBody">
              <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Loading leave requests...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Defaulters -->
      <div id="defaultersTab" style="display: none;">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll No / Branch</th>
                <th>Classes Attended</th>
                <th>Attendance %</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="defaultersTableBody">
              <tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">Loading attendance radar...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>

  <div id="toast"></div>

  <script>
    function showToast(msg, isSuccess = true) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = isSuccess ? '#16a34a' : '#dc2626';
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    function switchStaffTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      if (tab === 'leaves') {
        document.getElementById('leavesTab').style.display = 'block';
        document.getElementById('defaultersTab').style.display = 'none';
        loadLeaves();
      } else {
        document.getElementById('leavesTab').style.display = 'none';
        document.getElementById('defaultersTab').style.display = 'block';
        loadDefaulters();
      }
    }

    async function loadOverview() {
      try {
        const res = await fetch('/api/roles/staff/overview');
        const data = await res.json();
        if (data.success) {
          document.getElementById('kpiPendingLeaves').innerText = data.overview.pendingLeaves;
          document.getElementById('kpiTotalStudents').innerText = data.overview.totalStudents;
          document.getElementById('kpiDefaulters').innerText = data.overview.defaultersCount;
        }
      } catch (e) {
        console.error('Overview error:', e);
      }
    }

    async function loadLeaves() {
      try {
        const res = await fetch('/api/roles/staff/leave-requests');
        const data = await res.json();
        const tbody = document.getElementById('leavesTableBody');
        tbody.innerHTML = '';

        if (!data.success || data.leaves.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No student leave requests found.</td></tr>';
          return;
        }

        data.leaves.forEach(l => {
          const tr = document.createElement('tr');
          const isPending = l.status === 'PENDING';
          const isApproved = l.status === 'APPROVED';

          const badgeClass = isApproved ? 'badge-approved' : (isPending ? 'badge-pending' : 'badge-rejected');
          
          let actionBtn = '';
          if (isPending) {
            actionBtn = \`
              <button onclick="handleLeaveAction(\${l.id}, 'APPROVED')" class="action-btn btn-approve"><i class="fa-solid fa-check"></i> Approve</button>
              <button onclick="handleLeaveAction(\${l.id}, 'REJECTED')" class="action-btn btn-reject" style="margin-left: 5px;"><i class="fa-solid fa-xmark"></i> Reject</button>
            \`;
          } else {
            actionBtn = \`<span style="font-size: 0.78rem; font-weight: 700; color: \${isApproved ? '#16a34a' : '#dc2626'}">\${l.status}</span>\`;
          }

          tr.innerHTML = \`
            <td><strong>#\${l.id}</strong><br><small style="color: #64748b;">\${l.leave_number}</small></td>
            <td><strong>\${l.student_name || 'Verified Student'}</strong><br><small style="color: #64748b;">Roll: \${l.roll_number || 'PENDING'} • \${l.branch || 'Engineering'}</small></td>
            <td><strong>\${l.leave_type}</strong><br><small style="color: #64748b;">\${l.start_date} to \${l.end_date}</small></td>
            <td>\${l.reason}<br><small style="color: #64748b;"><i class="fa-solid fa-location-dot"></i> \${l.destination_address}</small></td>
            <td><span class="badge \${badgeClass}">\${l.status}</span></td>
            <td>\${actionBtn}</td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error('Leaves error:', e);
      }
    }

    async function loadDefaulters() {
      try {
        const res = await fetch('/api/roles/staff/defaulters');
        const data = await res.json();
        const tbody = document.getElementById('defaultersTableBody');
        tbody.innerHTML = '';

        if (!data.success || data.defaulters.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No attendance records found.</td></tr>';
          return;
        }

        data.defaulters.forEach(d => {
          const tr = document.createElement('tr');
          const isDefaulter = d.attendance_percentage < 75;
          const badgeClass = isDefaulter ? 'badge-defaulter' : 'badge-good';
          const badgeText = isDefaulter ? 'Low Attendance Defaulter' : 'Regular';

          tr.innerHTML = \`
            <td><strong>\${d.full_name || 'Student'}</strong><br><small style="color: #64748b;">Parent: \${d.father_name || 'N/A'}</small></td>
            <td><strong>\${d.roll_number || 'PENDING'}</strong><br><small style="color: #64748b;">\${d.branch || 'Engineering'}</small></td>
            <td>\${d.present_days} / \${d.total_days} sessions</td>
            <td><strong style="color: \${isDefaulter ? '#dc2626' : '#16a34a'}; font-size: 1rem;">\${d.attendance_percentage}%</strong></td>
            <td><span class="badge \${badgeClass}">\${badgeText}</span></td>
            <td>
              <button onclick="sendParentAlert('\${d.phone || '+91-9437102030'}', '\${d.full_name}')" class="action-btn" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
                <i class="fa-brands fa-whatsapp"></i> Alert Parent
              </button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (e) {
        console.error('Defaulters error:', e);
      }
    }

    async function handleLeaveAction(leaveId, action) {
      try {
        const res = await fetch('/api/roles/staff/leave-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaveId, action, remarks: 'Verified by Academic Faculty Advisor' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadLeaves();
          loadOverview();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Action failed: ' + err.message, false);
      }
    }

    function sendParentAlert(phone, studentName) {
      showToast('WhatsApp low attendance alert sent to parent of ' + studentName + ' (' + phone + ')', true);
    }

    // Init
    loadOverview();
    loadLeaves();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('staff-dashboard.html created successfully!');
