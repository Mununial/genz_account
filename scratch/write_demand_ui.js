const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin-hostel-demand.html';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hostel Demand & Infrastructure Forecasting | GENZ</title>
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

    .btn-success {
      background: #16a34a;
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
    }

    .btn-success:hover {
      background: #15803d;
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

    /* Metric Grid (Key Specs) */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .metric-card-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .metric-card-val {
      font-size: 2.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 8px 0;
    }

    .metric-card-desc {
      font-size: 0.82rem;
      color: #475569;
      font-weight: 600;
    }

    /* Prediction Trend Card */
    .prediction-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 26px;
      box-shadow: 0 6px 20px rgba(30, 58, 138, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .prediction-left h3 {
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .prediction-left p {
      color: #bfdbfe;
      font-size: 0.92rem;
      max-width: 780px;
      line-height: 1.5;
    }

    .prediction-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 12px 18px;
      border-radius: 12px;
      text-align: center;
    }

    .stat-pill-label {
      font-size: 0.75rem;
      color: #93c5fd;
      font-weight: 700;
      text-transform: uppercase;
    }

    .stat-pill-val {
      font-size: 1.45rem;
      font-weight: 800;
      margin-top: 4px;
    }

    /* Two Column Split */
    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 30px;
    }

    .card-panel {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 22px 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .panel-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Bar Tracks */
    .bar-group {
      margin-bottom: 16px;
    }

    .bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }

    .bar-track {
      background: #e2e8f0;
      height: 10px;
      border-radius: 9999px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s ease;
    }

    /* Multi-year Table */
    .trend-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      text-align: left;
    }

    .trend-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 12px 14px;
      border-bottom: 2px solid #e2e8f0;
    }

    .trend-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
    }

    /* Roster Table */
    .table-card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      margin-bottom: 30px;
    }

    .table-card-header {
      padding: 18px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .app-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .app-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 12px 18px;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .app-table td {
      padding: 14px 18px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .app-table tr:hover td {
      background: #f8fafc;
    }

    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-allocated { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #ffedd5; color: #c2410c; }

    @media (max-width: 992px) {
      .two-col-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .hero-banner { flex-direction: column; align-items: flex-start; }
      .hero-controls { width: 100%; }
      .btn-action { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-logo-circle">
          <i class="fa-solid fa-chart-line"></i>
        </div>
        <div class="brand-titles">
          <h1>GEN-Z UNIVERSITY</h1>
          <p>Institutional Planning • Hostel Demand & Capacity Prediction Radar</p>
        </div>
      </div>
      <div class="header-actions">
        <a href="/admin/meal-planning" class="hub-link" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);">
          <i class="fa-solid fa-utensils"></i> Meal Radar
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
          <i class="fa-solid fa-city" style="color: #2563eb;"></i>
          Hostel Demand Forecast & Infrastructure Planning
        </h2>
        <p>Real-time applicant demand, capacity utilization, gender distribution, and predictive multi-year forecasting.</p>
      </div>
      <div class="hero-controls">
        <a href="/api/hostel-demand/export-csv" class="btn-action btn-success" download>
          <i class="fa-solid fa-file-csv"></i> Export Applications (CSV)
        </a>
        <button class="btn-action btn-secondary" onclick="loadDemandStats()">
          <i class="fa-solid fa-arrows-rotate"></i> Refresh Forecast
        </button>
      </div>
    </div>

    <!-- 4 High Impact Metric Cards (Fretbox Parity) -->
    <div class="metric-grid">
      <div class="metric-card" style="border-left: 5px solid #2563eb;">
        <div class="metric-card-title">
          <span>Total Applications</span>
          <i class="fa-solid fa-file-signature" style="color: #2563eb;"></i>
        </div>
        <div class="metric-card-val" id="valTotalApps">450</div>
        <div class="metric-card-desc">Academic Session 2026-27</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #16a34a;">
        <div class="metric-card-title">
          <span>Confirmed / Allocated</span>
          <i class="fa-solid fa-bed" style="color: #16a34a;"></i>
        </div>
        <div class="metric-card-val" id="valConfirmed" style="color: #16a34a;">320</div>
        <div class="metric-card-desc">Beds confirmed & fee realized</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #ea580c;">
        <div class="metric-card-title">
          <span>Pending Allocation</span>
          <i class="fa-solid fa-hourglass-half" style="color: #ea580c;"></i>
        </div>
        <div class="metric-card-val" id="valPending" style="color: #ea580c;">130</div>
        <div class="metric-card-desc">In review / awaiting room allotment</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #7c3aed;">
        <div class="metric-card-title">
          <span>Campus Bed Capacity</span>
          <i class="fa-solid fa-hotel" style="color: #7c3aed;"></i>
        </div>
        <div class="metric-card-val" id="valCapacity" style="color: #7c3aed;">500</div>
        <div class="metric-card-desc" id="valCapacitySub">180 unallocated beds available</div>
      </div>
    </div>

    <!-- Strategic Investment Prediction Banner -->
    <div class="prediction-card">
      <div class="prediction-left">
        <h3>
          <i class="fa-solid fa-brain"></i>
          AI Demand Trend & Capital Investment Advisory
        </h3>
        <p id="infraAdvisoryText">
          Analyzing Year-over-Year applicant momentum. Current trend shows 12.5% annual growth. Next year projected at 500 applicants. Strategic bed allocation required.
        </p>
      </div>
      <div class="prediction-stats">
        <div class="stat-pill">
          <div class="stat-pill-label">YoY Growth</div>
          <div class="stat-pill-val" id="valYoYGrowth">+12.5%</div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-label">2027-28 Forecast</div>
          <div class="stat-pill-val" id="valNextYearPred">500 Apps</div>
        </div>
        <div class="stat-pill">
          <div class="stat-pill-label">Occupancy Rate</div>
          <div class="stat-pill-val" id="valOccRate">64%</div>
        </div>
      </div>
    </div>

    <!-- 2 Column Split: Category Split & Multi-Year History -->
    <div class="two-col-grid">

      <!-- Col 1: Gender & Category Split -->
      <div class="card-panel">
        <div class="panel-title">
          <i class="fa-solid fa-venus-mars" style="color: #2563eb;"></i>
          Hostel Category & Gender Demand Breakdown
        </div>

        <div class="bar-group">
          <div class="bar-header">
            <span>👦 Boys Hostel Block-A (Capacity 250)</span>
            <span id="boysLabel">280 Apps (112% Demand)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" id="boysBar" style="width: 62%; background: #2563eb;"></div>
          </div>
        </div>

        <div class="bar-group" style="margin-top: 18px;">
          <div class="bar-header">
            <span>👧 Girls Hostel Block-B (Capacity 200)</span>
            <span id="girlsLabel">170 Apps (85% Demand)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" id="girlsBar" style="width: 38%; background: #7c3aed;"></div>
          </div>
        </div>

        <div class="panel-title" style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <i class="fa-solid fa-snowflake" style="color: #0284c7;"></i>
          Room Type Preference Distribution
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #16a34a;">AC Rooms</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #15803d; margin-top: 4px;" id="countAC">150</div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 10px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #2563eb;">Double Non-AC</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #1d4ed8; margin-top: 4px;" id="countDouble">150</div>
          </div>
          <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 10px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #7c3aed;">Triple Non-AC</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #6b21a8; margin-top: 4px;" id="countTriple">150</div>
          </div>
        </div>
      </div>

      <!-- Col 2: Multi-Year Predictive Trend -->
      <div class="card-panel">
        <div class="panel-title">
          <i class="fa-solid fa-timeline" style="color: #16a34a;"></i>
          Multi-Year Admissions & Accommodation Growth
        </div>
        <div style="overflow-x: auto;">
          <table class="trend-table">
            <thead>
              <tr>
                <th>Academic Session</th>
                <th>Applications</th>
                <th>Confirmed</th>
                <th>Capacity</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody id="multiYearTableBody">
              <!-- Dynamically Rendered -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Live Applications Sample Roster -->
    <div class="table-card">
      <div class="table-card-header">
        <h4 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-list-check" style="color: #2563eb;"></i>
          Verified Student Room Applications (Sample View)
        </h4>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #64748b;">Showing active applicants</span>
          <a href="/api/hostel-demand/export-csv" class="btn-action btn-secondary" style="padding: 6px 14px; font-size: 0.8rem;" download>
            <i class="fa-solid fa-download"></i> Download CSV
          </a>
        </div>
      </div>
      <div style="overflow-x: auto;">
        <table class="app-table">
          <thead>
            <tr>
              <th>App Number</th>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Branch</th>
              <th>Gender</th>
              <th>Preferred Hostel</th>
              <th>Room Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="appTableBody">
            <!-- Dynamically Rendered -->
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      loadDemandStats();
      loadApplications();
    });

    async function loadDemandStats() {
      try {
        const res = await fetch('/api/hostel-demand/stats');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const s = data.summary;

        document.getElementById('valTotalApps').innerText = s.totalApplications;
        document.getElementById('valConfirmed').innerText = s.confirmed;
        document.getElementById('valPending').innerText = s.pending;
        document.getElementById('valCapacity').innerText = s.totalCapacity;
        document.getElementById('valCapacitySub').innerText = s.availableCapacity + ' unallocated beds available';

        document.getElementById('valYoYGrowth').innerText = s.predictionGrowthPct || '+12.5%';
        document.getElementById('valNextYearPred').innerText = s.nextYearPrediction + ' Apps';
        document.getElementById('valOccRate').innerText = s.capacityUtilizationPct + '%';

        document.getElementById('infraAdvisoryText').innerText = s.infrastructureRecommendation;

        // Gender split
        const totalGender = s.boysApplications + s.girlsApplications;
        const boysPct = totalGender > 0 ? Math.round((s.boysApplications / totalGender) * 100) : 62;
        const girlsPct = totalGender > 0 ? Math.round((s.girlsApplications / totalGender) * 100) : 38;

        document.getElementById('boysLabel').innerText = s.boysApplications + ' Apps (' + boysPct + '% Demand)';
        document.getElementById('girlsLabel').innerText = s.girlsApplications + ' Apps (' + girlsPct + '% Demand)';
        document.getElementById('boysBar').style.width = boysPct + '%';
        document.getElementById('girlsBar').style.width = girlsPct + '%';

        // Room types
        document.getElementById('countAC').innerText = (data.roomTypes && data.roomTypes.AC) || 150;
        document.getElementById('countDouble').innerText = (data.roomTypes && data.roomTypes.DOUBLE) || 150;
        document.getElementById('countTriple').innerText = (data.roomTypes && data.roomTypes.TRIPLE) || 150;

        renderMultiYear(data.multiYearTrends);
      } catch (err) {
        console.error('Demand stats error:', err);
      }
    }

    function renderMultiYear(trends) {
      const tbody = document.getElementById('multiYearTableBody');
      tbody.innerHTML = '';
      trends.forEach(t => {
        const tr = document.createElement('tr');
        if (t.isProjected) tr.style.background = '#f0fdf4';

        tr.innerHTML = \`
          <td><strong>\${t.year}</strong> \${t.isProjected ? '<span style=\"font-size: 0.72rem; background: #bbf7d0; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: 800;\">AI PREDICTION</span>' : ''}</td>
          <td>\${t.applications}</td>
          <td>\${t.confirmed}</td>
          <td>\${t.capacity}</td>
          <td><span style=\"font-weight: 800; color: #16a34a;\">\${t.growthPct}</span></td>
        \`;
        tbody.appendChild(tr);
      });
    }

    async function loadApplications() {
      try {
        const res = await fetch('/api/hostel-demand/applications?limit=8');
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const tbody = document.getElementById('appTableBody');
        tbody.innerHTML = '';

        data.applications.forEach(a => {
          const isAllocated = a.status === 'ALLOCATED';
          const badgeClass = isAllocated ? 'badge-allocated' : 'badge-pending';
          const icon = isAllocated ? 'fa-check' : 'fa-hourglass-half';

          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td><strong>\${a.application_number}</strong></td>
            <td><strong>\${a.full_name || 'Student'}</strong></td>
            <td><span style=\"font-family: monospace; font-weight: 700;\">\${a.roll_number}</span></td>
            <td>\${a.branch}</td>
            <td>\${a.gender}</td>
            <td>\${a.preferred_hostel_name || 'Campus Hostel'}</td>
            <td><span style=\"font-weight: 700; color: #1e40af;\">\${a.room_type_preference}</span></td>
            <td>
              <span class=\"badge-status \${badgeClass}\">
                <i class=\"fa-solid \${icon}\"></i> \${a.status}
              </span>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('App load error:', err);
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(targetFile, htmlContent, 'utf8');
console.log('admin-hostel-demand.html created successfully!');
