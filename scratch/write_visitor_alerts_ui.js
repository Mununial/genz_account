const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin-visitor-alerts.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visitor Overstay Radar & Security Telemetry | GEN-Z UNIVERSITY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-accent: #2563eb;
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

    .radar-badge {
      background: #fee2e2;
      color: #b91c1c;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      animation: pulseAlert 2s infinite;
    }

    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
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

    .icon-red { background: #fee2e2; color: #b91c1c; }
    .icon-amber { background: #fef3c7; color: #b45309; }
    .icon-green { background: #dcfce7; color: #15803d; }
    .icon-blue { background: #dbeafe; color: #1d4ed8; }

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

    /* Controls Bar */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 14px;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-group select {
      background: #f8fafc;
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
      outline: none;
      cursor: pointer;
    }

    .btn-action-primary {
      background: var(--primary-accent);
      color: #fff;
      text-decoration: none;
      padding: 9px 16px;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action-primary:hover {
      background: #1d4ed8;
    }

    /* Visitor Cards Grid */
    .visitors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }

    .visitor-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: all 0.2s;
    }

    .visitor-card.critical-card {
      border-color: #f87171;
      background: linear-gradient(180deg, #ffffff 0%, #fff5f5 100%);
    }

    .visitor-card.warning-card {
      border-color: #fbbf24;
      background: linear-gradient(180deg, #ffffff 0%, #fffdf5 100%);
    }

    .visitor-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .badge-critical { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .badge-warning { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-safe { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

    .visitor-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .visitor-phone {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 4px;
      font-weight: 600;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.82rem;
    }

    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: var(--text-muted); font-weight: 600; }
    .detail-val { font-weight: 700; color: var(--text-main); }

    /* Progress bar for time */
    .time-bar-bg {
      background: #f1f5f9;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      margin: 12px 0 16px 0;
    }

    .time-bar-fill {
      height: 100%;
      border-radius: 999px;
    }

    .time-bar-red { background: #dc2626; width: 100%; animation: blinkRed 1.5s infinite; }
    .time-bar-amber { background: #d97706; width: 85%; }
    .time-bar-green { background: #16a34a; width: 45%; }

    @keyframes blinkRed {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 14px;
    }

    .btn-action-card {
      padding: 9px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-patrol { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .btn-patrol:hover { background: #fecaca; }
    .btn-force-out { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .btn-force-out:hover { background: #dbeafe; }

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
        <i class="fa-solid fa-bell-concierge"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Campus Security Operations • Visitor Overstay Radar</p>
      </div>
    </div>
    <div class="nav-actions">
      <span class="radar-badge"><i class="fa-solid fa-radar"></i> Overstay Surveillance Active</span>
      <a href="/security" class="btn-nav"><i class="fa-solid fa-shield-halved"></i> Gate Desk</a>
      <a href="/warden" class="btn-nav"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
      <a href="/admin" class="btn-nav" style="background: var(--primary); color: #fff;"><i class="fa-solid fa-gauge-high"></i> Admin Hub</a>
    </div>
  </header>

  <main>
    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div>
          <div class="kpi-val" id="kpiCritical">0</div>
          <div class="kpi-label">Critical Breaches (+30m Overstay)</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-amber"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <div>
          <div class="kpi-val" id="kpiWarning">0</div>
          <div class="kpi-label">Amber Warnings (+15m Overstay)</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-green"><i class="fa-solid fa-circle-check"></i></div>
        <div>
          <div class="kpi-val" id="kpiNormal">0</div>
          <div class="kpi-label">On-Time Visitors Inside</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon icon-blue"><i class="fa-solid fa-clipboard-check"></i></div>
        <div>
          <div class="kpi-val" id="kpiCompleted">0</div>
          <div class="kpi-label">Completed Departures Today</div>
        </div>
      </div>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar">
      <div class="filter-group">
        <label style="font-size: 0.82rem; font-weight: 700; color: #475569;"><i class="fa-solid fa-filter"></i> Visitor Category:</label>
        <select id="typeFilter" onchange="loadTelemetry(this.value)">
          <option value="ALL">All Visitor Types</option>
          <option value="PARENT">Parents / Guardians</option>
          <option value="VENDOR">Vendors & Contractors</option>
          <option value="GUEST_FACULTY">Guest Faculty & Dignitaries</option>
          <option value="ALUMNI">Alumni & Guests</option>
        </select>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="/api/visitor-alerts/export-csv" class="btn-action-primary" download>
          <i class="fa-solid fa-file-csv"></i> Download Compliance Manifest (CSV)
        </a>
        <button onclick="loadTelemetry()" class="btn-action-primary" style="background: #f1f5f9; color: #334155;">
          <i class="fa-solid fa-rotate"></i> Refresh Radar
        </button>
      </div>
    </div>

    <!-- Active Visitors Grid -->
    <div id="visitorsGrid" class="visitors-grid">
      <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">
        Loading live visitor surveillance radar...
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

    async function loadTelemetry() {
      const type = document.getElementById('typeFilter').value;
      try {
        const url = type && type !== 'ALL' ? '/api/visitor-alerts/telemetry?visitorType=' + type : '/api/visitor-alerts/telemetry';
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          const stats = data.stats;
          document.getElementById('kpiCritical').innerText = stats.criticalCount;
          document.getElementById('kpiWarning').innerText = stats.warningCount;
          document.getElementById('kpiNormal').innerText = stats.normalCount;
          document.getElementById('kpiCompleted').innerText = stats.completedToday;

          const grid = document.getElementById('visitorsGrid');
          grid.innerHTML = '';

          if (data.visitors.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No visitors currently checked inside campus.</div>';
            return;
          }

          data.visitors.forEach(v => {
            const card = document.createElement('div');
            const isCrit = v.severity === 'CRITICAL';
            const isWarn = v.severity === 'WARNING';

            card.className = 'visitor-card ' + (isCrit ? 'critical-card' : (isWarn ? 'warning-card' : ''));

            let badgeHtml = '';
            let timeBarHtml = '';
            if (isCrit) {
              badgeHtml = \`<span class="badge-status badge-critical"><i class="fa-solid fa-triangle-exclamation"></i> Critical Overstay (+\${v.overdueMinutes}m)</span>\`;
              timeBarHtml = '<div class="time-bar-fill time-bar-red"></div>';
            } else if (isWarn) {
              badgeHtml = \`<span class="badge-status badge-warning"><i class="fa-solid fa-clock-rotate-left"></i> Overdue (+\${v.overdueMinutes}m)</span>\`;
              timeBarHtml = '<div class="time-bar-fill time-bar-amber"></div>';
            } else {
              badgeHtml = \`<span class="badge-status badge-safe"><i class="fa-solid fa-circle-check"></i> Safe (\${v.remainingMinutes}m left)</span>\`;
              timeBarHtml = '<div class="time-bar-fill time-bar-green"></div>';
            }

            card.innerHTML = \`
              <div>
                <div class="visitor-card-header">
                  <div>
                    <div class="visitor-name">\${v.visitorName}</div>
                    <div class="visitor-phone"><i class="fa-solid fa-phone"></i> \${v.visitorPhone} • \${v.visitorType}</div>
                  </div>
                  <div>\${badgeHtml}</div>
                </div>

                <div class="time-bar-bg">
                  \${timeBarHtml}
                </div>

                <div class="detail-row">
                  <span class="detail-label">Meeting Host</span>
                  <span class="detail-val">\${v.hostStudentName} (\${v.hostStudentRoll})</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Hostel Residence</span>
                  <span class="detail-val">\${v.hostelName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Stated Purpose</span>
                  <span class="detail-val">\${v.purpose}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check In Time</span>
                  <span class="detail-val">\${v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Expected Departure</span>
                  <span class="detail-val" style="color: \${isCrit ? '#dc2626' : (isWarn ? '#d97706' : '#16a34a')};">
                    \${v.expectedOutTime ? new Date(v.expectedOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                  </span>
                </div>
              </div>

              <div class="card-actions">
                <button onclick="handleDispatchPatrol(\${v.id}, '\${v.visitorName}', '\${v.hostelName}')" class="btn-action-card btn-patrol">
                  <i class="fa-solid fa-person-military-pointing"></i> Dispatch Patrol
                </button>
                <button onclick="handleForceCheckout(\${v.id})" class="btn-action-card btn-force-out">
                  <i class="fa-solid fa-right-from-bracket"></i> Force Check Out
                </button>
              </div>
            \`;
            grid.appendChild(card);
          });
        }
      } catch (err) {
        console.error('Telemetry error:', err);
      }
    }

    async function handleForceCheckout(visitId) {
      try {
        const res = await fetch('/api/visitor-alerts/force-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitId, reason: 'Force departure cleared by Security Desk' })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
          loadTelemetry();
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Checkout failed: ' + err.message, false);
      }
    }

    async function handleDispatchPatrol(visitId, visitorName, hostelName) {
      try {
        const res = await fetch('/api/visitor-alerts/dispatch-patrol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitId, visitorName, hostelName })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
        }
      } catch (err) {
        showToast('Patrol dispatch failed: ' + err.message, false);
      }
    }

    // Auto-refresh every 30s
    setInterval(loadTelemetry, 30000);
    loadTelemetry();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('admin-visitor-alerts.html created successfully!');
