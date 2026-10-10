const fs = require('fs');
const path = require('path');

const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin-meal-planning.html';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meal Planning & Food Waste Forecast Dashboard | GENZ</title>
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
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

    /* Metric Grid */
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
      position: relative;
      overflow: hidden;
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

    /* 4-Meal Matrix Grid */
    .section-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .meals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .meal-box {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .meal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 12px;
      width: fit-content;
    }

    .badge-breakfast { background: #fef3c7; color: #b45309; }
    .badge-lunch { background: #dbeafe; color: #1d4ed8; }
    .badge-snacks { background: #ffedd5; color: #c2410c; }
    .badge-dinner { background: #f3e8ff; color: #7e22ce; }

    .meal-menu-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }

    .meal-menu-desc {
      font-size: 0.84rem;
      color: #64748b;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .meal-stats-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 12px;
    }

    .meal-count-highlight {
      font-size: 1.8rem;
      font-weight: 800;
      color: #1e3a8a;
    }

    .progress-bar-bg {
      background: #e2e8f0;
      height: 8px;
      border-radius: 9999px;
      overflow: hidden;
      margin: 8px 0;
    }

    .progress-bar-fill {
      background: #2563eb;
      height: 100%;
      border-radius: 9999px;
      transition: width 0.5s ease;
    }

    /* Student & Admin Interactive Split */
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
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    /* Student Preference Toggles */
    .meal-toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 12px;
      background: #f8fafc;
    }

    .meal-toggle-info strong {
      display: block;
      font-size: 0.95rem;
      color: #0f172a;
    }

    .meal-toggle-info span {
      font-size: 0.8rem;
      color: #64748b;
    }

    .toggle-group {
      display: flex;
      gap: 6px;
    }

    .btn-toggle {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }

    .btn-toggle.active-eat {
      background: #16a34a;
      color: #ffffff;
      border-color: #16a34a;
    }

    .btn-toggle.active-skip {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
    }

    /* Historical Trends Table */
    .trends-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      text-align: left;
    }

    .trends-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 12px 14px;
      border-bottom: 2px solid #e2e8f0;
    }

    .trends-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
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

    #toast.success { background: #15803d; }
    #toast.danger { background: #b91c1c; }

    @media (max-width: 992px) {
      .two-col-grid {
        grid-template-columns: 1fr;
      }
    }

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
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-logo-circle">
          <i class="fa-solid fa-utensils"></i>
        </div>
        <div class="brand-titles">
          <h1>GEN-Z UNIVERSITY</h1>
          <p>Mess & Catering Management • Smart Meal Planning & Food Waste Radar</p>
        </div>
      </div>
      <div class="header-actions">
        <a href="/warden" class="hub-link" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3);">
          <i class="fa-solid fa-shield-halved"></i> Warden Radar
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
          <i class="fa-solid fa-calculator" style="color: #2563eb;"></i>
          Tomorrow's Meal Planning & Food Waste Forecast
        </h2>
        <p>Live kitchen procurement based on verified student meal selections. Strict 10:00 PM previous day cutoff.</p>
      </div>
      <div class="hero-controls">
        <button class="btn-action btn-success" onclick="sendVendorSms()">
          <i class="fa-solid fa-paper-plane"></i> Dispatch SMS to Vendor
        </button>
        <button class="btn-action btn-secondary" onclick="loadMealForecast()">
          <i class="fa-solid fa-arrows-rotate"></i> Refresh Forecast
        </button>
      </div>
    </div>

    <!-- 4 High Impact Metric Cards -->
    <div class="metric-grid">
      <div class="metric-card" style="border-left: 5px solid #2563eb;">
        <div class="metric-card-title">
          <span>Tomorrow's Meals Needed</span>
          <i class="fa-solid fa-plate-wheat" style="color: #2563eb;"></i>
        </div>
        <div class="metric-card-val" id="valTotalMeals">608</div>
        <div class="metric-card-desc" id="valMealsSubtitle">Across Breakfast, Lunch, Snacks, Dinner</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #ea580c;">
        <div class="metric-card-title">
          <span>Confirmed Opt-Outs</span>
          <i class="fa-solid fa-ban" style="color: #ea580c;"></i>
        </div>
        <div class="metric-card-val" id="valOptOuts" style="color: #ea580c;">152</div>
        <div class="metric-card-desc">Students opted out before 10:00 PM</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #16a34a;">
        <div class="metric-card-title">
          <span>Food Waste Prevented</span>
          <i class="fa-solid fa-leaf" style="color: #16a34a;"></i>
        </div>
        <div class="metric-card-val" id="valWastePct" style="color: #16a34a;">20%</div>
        <div class="metric-card-desc">Zero surplus cooking; exact headcounts</div>
      </div>
      <div class="metric-card" style="border-left: 5px solid #7c3aed;">
        <div class="metric-card-title">
          <span>Estimated Cost Saved</span>
          <i class="fa-solid fa-indian-rupee-sign" style="color: #7c3aed;"></i>
        </div>
        <div class="metric-card-val" id="valCostSaved" style="color: #7c3aed;">₹9,880</div>
        <div class="metric-card-desc">Saved on raw material & prep wastage</div>
      </div>
    </div>

    <!-- 4-Meal Matrix -->
    <div class="section-title">
      <i class="fa-solid fa-kitchen-set" style="color: #1e3a8a;"></i>
      Tomorrow's Kitchen Production Schedule (Real Database Feed)
    </div>
    <div class="meals-grid" id="mealsGridContainer">
      <!-- Dynamically Rendered -->
    </div>

    <!-- 2 Column Interactive Grid: Student Self-Preference + Historical Trends -->
    <div class="two-col-grid">

      <!-- Col 1: Student Preference Kiosk/Portal -->
      <div class="card-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-user-check" style="color: #16a34a;"></i>
            Student Meal Preference Doorway
          </h3>
          <span style="font-size: 0.78rem; font-weight: 700; color: #b45309; background: #fef3c7; padding: 4px 10px; border-radius: 9999px;">
            <i class="fa-solid fa-clock"></i> Cutoff: 10:00 PM
          </span>
        </div>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 16px;">
          Choose whether you will dine in the mess tomorrow. Changes lock every evening at 10 PM.
        </p>

        <div style="margin-bottom: 16px;">
          <label style="font-size: 0.82rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Select Student (Demo / Kiosk Mode):</label>
          <select id="studentSelect" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem; outline: none;" onchange="loadStudentPreference()">
            <option value="2mrsG0R7XVP7SoeTNgIfLjYPtKk1">Nandita Mistry (Roll: PENDING - Girls Hostel B)</option>
            <option value="3x9pisMWMuN9rBzHXsTmZ8NHoG83">Swagatika Behera (Roll: PENDING - Girls Hostel B)</option>
            <option value="2QFRjfIFOTYKqKOY8qR2J1uKTMs2">Om Prakash Sha (Roll: PENDING - Boys Hostel A)</option>
          </select>
        </div>

        <div id="studentTogglesContainer">
          <!-- Breakfast Toggle -->
          <div class="meal-toggle-item">
            <div class="meal-toggle-info">
              <strong>Breakfast (07:30 - 09:30 am)</strong>
              <span>Aloo Paratha, Curd & Pickle</span>
            </div>
            <div class="toggle-group">
              <button class="btn-toggle active-eat" id="btn-eat-BREAKFAST" onclick="setPreference('BREAKFAST', 'TAKING')">
                <i class="fa-solid fa-check"></i> I'll Eat
              </button>
              <button class="btn-toggle" id="btn-skip-BREAKFAST" onclick="setPreference('BREAKFAST', 'NOT_TAKING')">
                <i class="fa-solid fa-xmark"></i> Skip
              </button>
            </div>
          </div>

          <!-- Lunch Toggle -->
          <div class="meal-toggle-item">
            <div class="meal-toggle-info">
              <strong>Lunch (12:30 - 02:30 pm)</strong>
              <span>Basmati Rice, Dal Makhani & Paneer</span>
            </div>
            <div class="toggle-group">
              <button class="btn-toggle active-eat" id="btn-eat-LUNCH" onclick="setPreference('LUNCH', 'TAKING')">
                <i class="fa-solid fa-check"></i> I'll Eat
              </button>
              <button class="btn-toggle" id="btn-skip-LUNCH" onclick="setPreference('LUNCH', 'NOT_TAKING')">
                <i class="fa-solid fa-xmark"></i> Skip
              </button>
            </div>
          </div>

          <!-- Snacks Toggle -->
          <div class="meal-toggle-item">
            <div class="meal-toggle-info">
              <strong>Evening Snacks (05:00 - 06:15 pm)</strong>
              <span>Veg Cutlet, Chutney & Chai</span>
            </div>
            <div class="toggle-group">
              <button class="btn-toggle active-eat" id="btn-eat-SNACKS" onclick="setPreference('SNACKS', 'TAKING')">
                <i class="fa-solid fa-check"></i> I'll Eat
              </button>
              <button class="btn-toggle" id="btn-skip-SNACKS" onclick="setPreference('SNACKS', 'NOT_TAKING')">
                <i class="fa-solid fa-xmark"></i> Skip
              </button>
            </div>
          </div>

          <!-- Dinner Toggle -->
          <div class="meal-toggle-item">
            <div class="meal-toggle-info">
              <strong>Dinner (08:00 - 10:00 pm)</strong>
              <span>Tandoori Roti, Jeera Rice & Mix Veg</span>
            </div>
            <div class="toggle-group">
              <button class="btn-toggle active-eat" id="btn-eat-DINNER" onclick="setPreference('DINNER', 'TAKING')">
                <i class="fa-solid fa-check"></i> I'll Eat
              </button>
              <button class="btn-toggle" id="btn-skip-DINNER" onclick="setPreference('DINNER', 'NOT_TAKING')">
                <i class="fa-solid fa-xmark"></i> Skip
              </button>
            </div>
          </div>
        </div>

        <button class="btn-action" style="width: 100%; justify-content: center; margin-top: 10px;" onclick="saveStudentPreference()">
          <i class="fa-solid fa-floppy-disk"></i> Confirm & Save My Tomorrow Preferences
        </button>
      </div>

      <!-- Col 2: Historical Day-of-Week Trends Table -->
      <div class="card-panel">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-chart-line" style="color: #2563eb;"></i>
          Historical Consumption Trends (Day-wise Baseline)
        </h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 16px;">
          Helps mess supervisors anticipate weekend drop-offs and special festival day spikes.
        </p>
        <div style="overflow-x: auto;">
          <table class="trends-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
                <th>Daily Total</th>
              </tr>
            </thead>
            <tbody id="trendsTableBody">
              <!-- Dynamically Populated -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </main>

  <!-- Notification Toast -->
  <div id="toast">
    <i class="fa-solid fa-circle-check"></i>
    <span id="toastMsg">Notification message</span>
  </div>

  <script>
    let forecastData = null;
    let studentPrefs = {
      BREAKFAST: 'TAKING',
      LUNCH: 'TAKING',
      SNACKS: 'TAKING',
      DINNER: 'TAKING'
    };

    document.addEventListener('DOMContentLoaded', () => {
      loadMealForecast();
      loadStudentPreference();
    });

    async function loadMealForecast() {
      try {
        const res = await fetch('/api/meal-planning/forecast');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load forecast');

        forecastData = data;
        const s = data.summary;

        document.getElementById('valTotalMeals').innerText = s.totalMealsNeeded.toLocaleString();
        document.getElementById('valOptOuts').innerText = s.totalOptOuts.toLocaleString();
        document.getElementById('valWastePct').innerText = s.wasteReductionPct + '%';
        document.getElementById('valCostSaved').innerText = '₹' + s.costSavedEstimate.toLocaleString();
        document.getElementById('valMealsSubtitle').innerText = 'Serving ' + s.registeredBoarders + ' resident boarders';

        renderMealBoxes(data.meals);
        renderTrends(data.historicalTrends);
      } catch (err) {
        console.error('Forecast load error:', err);
        showToast('Error syncing forecast: ' + err.message, 'danger');
      }
    }

    function renderMealBoxes(meals) {
      const container = document.getElementById('mealsGridContainer');
      container.innerHTML = '';

      const configs = {
        BREAKFAST: { label: 'Breakfast', badge: 'badge-breakfast', icon: 'fa-mug-hot', time: '07:30 - 09:30 AM' },
        LUNCH: { label: 'Lunch', badge: 'badge-lunch', icon: 'fa-bowl-rice', time: '12:30 - 02:30 PM' },
        SNACKS: { label: 'Evening Snacks', badge: 'badge-snacks', icon: 'fa-cookie-bite', time: '05:00 - 06:15 PM' },
        DINNER: { label: 'Dinner', badge: 'badge-dinner', icon: 'fa-moon', time: '08:00 - 10:00 PM' }
      };

      Object.keys(meals).forEach(key => {
        const m = meals[key];
        const cfg = configs[key] || { label: key, badge: 'badge-breakfast', icon: 'fa-utensils', time: 'Standard' };

        const box = document.createElement('div');
        box.className = 'meal-box';
        box.innerHTML = \`
          <div>
            <div class="meal-badge \${cfg.badge}">
              <i class="fa-solid \${cfg.icon}"></i> \${cfg.label} • \${cfg.time}
            </div>
            <div class="meal-menu-name">\${m.menuName}</div>
            <div class="meal-menu-desc">\${m.description}</div>
          </div>
          <div>
            <div class="meal-stats-row">
              <div>
                <span class="meal-count-highlight">\${m.takingCount}</span>
                <span style="font-size: 0.85rem; font-weight: 700; color: #475569;"> Plates Needed</span>
              </div>
              <div style="font-size: 0.82rem; font-weight: 700; color: #ea580c;">
                \${m.optOutCount} Opt-outs (\${m.takingPct}% Dining)
              </div>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: \${m.takingPct}%;"></div>
            </div>
          </div>
        \`;
        container.appendChild(box);
      });
    }

    function renderTrends(trends) {
      const tbody = document.getElementById('trendsTableBody');
      tbody.innerHTML = '';
      trends.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td><strong>\${t.day}</strong></td>
          <td>\${t.breakfast}</td>
          <td>\${t.lunch}</td>
          <td>\${t.dinner}</td>
          <td><strong>\${t.total} plates</strong></td>
        \`;
        tbody.appendChild(tr);
      });
    }

    async function loadStudentPreference() {
      const studentId = document.getElementById('studentSelect').value;
      try {
        const res = await fetch('/api/meal-planning/student-preference?studentId=' + studentId);
        const data = await res.json();
        if (data.success && data.preferences) {
          studentPrefs = data.preferences;
          updateToggleButtons();
        }
      } catch (err) {
        console.error('Student pref load error:', err);
      }
    }

    function setPreference(mealType, status) {
      studentPrefs[mealType] = status;
      updateToggleButtons();
    }

    function updateToggleButtons() {
      ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'].forEach(mt => {
        const eatBtn = document.getElementById('btn-eat-' + mt);
        const skipBtn = document.getElementById('btn-skip-' + mt);
        if (!eatBtn || !skipBtn) return;

        if (studentPrefs[mt] === 'TAKING') {
          eatBtn.className = 'btn-toggle active-eat';
          skipBtn.className = 'btn-toggle';
        } else {
          eatBtn.className = 'btn-toggle';
          skipBtn.className = 'btn-toggle active-skip';
        }
      });
    }

    async function saveStudentPreference() {
      const studentId = document.getElementById('studentSelect').value;
      try {
        const res = await fetch('/api/meal-planning/save-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            hostelId: 1,
            preferences: studentPrefs
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Preferences updated! Recomputing kitchen forecast...', 'success');
          loadMealForecast();
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        showToast('Error saving preferences: ' + err.message, 'danger');
      }
    }

    async function sendVendorSms() {
      if (!forecastData || !forecastData.summary) return;
      const s = forecastData.summary;
      const m = forecastData.meals;

      try {
        const res = await fetch('/api/meal-planning/notify-vendor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetDate: forecastData.targetDate,
            breakfast: m.BREAKFAST ? m.BREAKFAST.takingCount : 148,
            lunch: m.LUNCH ? m.LUNCH.takingCount : 155,
            snacks: m.SNACKS ? m.SNACKS.takingCount : 155,
            dinner: m.DINNER ? m.DINNER.takingCount : 150,
            totalMeals: s.totalMealsNeeded
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        showToast('Failed to dispatch vendor SMS: ' + err.message, 'danger');
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
console.log('admin-meal-planning.html created successfully!');
