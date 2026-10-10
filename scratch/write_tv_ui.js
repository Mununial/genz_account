const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/tv.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GEN-Z UNIVERSITY - Campus Digital Signage</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-light: #2563eb;
      --primary-dark: #0f172a;
      --accent: #3b82f6;
      --amber: #f59e0b;
      --rose: #ef4444;
      --emerald: #10b981;
      --bg-dark: #090d16;
      --surface-dark: #111827;
      --card-dark: #1e293b;
      --border-dark: rgba(255, 255, 255, 0.1);
      --text-main: #ffffff;
      --text-muted: #94a3b8;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Top Brand & Telemetry Bar */
    header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      border-bottom: 2px solid #2563eb;
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5);
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo {
      width: 52px;
      height: 52px;
      background: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(37, 99, 235, 0.4);
      color: #1e3a8a;
      font-size: 26px;
    }

    .brand-text h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #ffffff;
      line-height: 1.2;
    }

    .brand-text p {
      font-size: 13px;
      font-weight: 500;
      color: #93c5fd;
      letter-spacing: 0.5px;
    }

    .live-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .weather-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.08);
      padding: 8px 16px;
      border-radius: 10px;
      border: 1px solid var(--border-dark);
      font-size: 13px;
    }

    .clock-widget {
      text-align: right;
    }

    .clock-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1;
    }

    .clock-date {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      margin-top: 4px;
    }

    .fs-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid var(--border-dark);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .fs-btn:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    /* Urgent Ticker Banner */
    .ticker-bar {
      background: #7f1d1d;
      border-bottom: 1px solid #b91c1c;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      overflow: hidden;
      white-space: nowrap;
    }

    .ticker-label {
      background: #dc2626;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 4px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .ticker-content {
      font-size: 13px;
      font-weight: 600;
      color: #fecaca;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    /* Main Display Layout */
    .signage-main {
      flex: 1;
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 24px;
      padding: 24px 28px;
      max-width: 1920px;
      margin: 0 auto;
      width: 100%;
    }

    /* Left Side: Broadcast & Notice Carousel */
    .left-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .signage-card {
      background: var(--surface-dark);
      border: 1px solid var(--border-dark);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #93c5fd;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Featured Notice Showcase */
    .featured-notice-box {
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 14px;
      padding: 26px;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .notice-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 4px;
      background: #3b82f6;
      width: 0%;
      transition: width 0.1s linear;
    }

    .notice-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .priority-badge {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .priority-URGENT {
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
    }

    .priority-IMPORTANT {
      background: #f59e0b;
      color: #000000;
    }

    .priority-GENERAL {
      background: #3b82f6;
      color: #ffffff;
    }

    .notice-time {
      font-size: 12px;
      color: #94a3b8;
    }

    .notice-headline {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.3;
      color: #ffffff;
      margin-bottom: 14px;
    }

    .notice-description {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 20px;
      flex: 1;
    }

    .notice-carousel-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 14px;
    }

    .carousel-indicators {
      display: flex;
      gap: 8px;
    }

    .indicator-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s;
    }

    .indicator-dot.active {
      background: #3b82f6;
      width: 24px;
      border-radius: 6px;
    }

    .carousel-controls {
      display: flex;
      gap: 8px;
    }

    .ctrl-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s;
    }

    .ctrl-btn:hover {
      background: #3b82f6;
    }

    /* Upcoming Notices Feed */
    .notices-stream-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 14px;
    }

    .stream-item {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .stream-item:hover {
      background: rgba(30, 41, 59, 0.9);
      border-color: rgba(59, 130, 246, 0.4);
    }

    .stream-title {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
    }

    .stream-date {
      font-size: 12px;
      color: #94a3b8;
      white-space: nowrap;
      margin-left: 12px;
    }

    /* Right Column: Curfew & Mess & Telemetry */
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Curfew Countdown Card */
    .curfew-card {
      background: linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%);
      border: 1px solid rgba(139, 92, 246, 0.4);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .curfew-glow {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
      border-radius: 50%;
    }

    .curfew-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .curfew-title {
      font-size: 14px;
      font-weight: 700;
      color: #c4b5fd;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .curfew-countdown-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(167, 139, 250, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .countdown-timer {
      font-family: 'JetBrains Mono', monospace;
      font-size: 32px;
      font-weight: 800;
      color: #a78bfa;
      letter-spacing: 1px;
    }

    .countdown-target {
      text-align: right;
    }

    .target-time {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }

    .target-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    /* Dining Mess Menu Card */
    .menu-card {
      background: var(--surface-dark);
      border: 1px solid var(--border-dark);
      border-radius: 16px;
      padding: 24px;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 14px;
    }

    .meal-box {
      background: var(--card-dark);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      transition: all 0.2s;
    }

    .meal-box.active-meal {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%);
      border: 1px solid #3b82f6;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
    }

    .active-badge {
      position: absolute;
      top: 10px;
      right: 12px;
      background: #2563eb;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .meal-type {
      font-size: 11px;
      font-weight: 700;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }

    .meal-name {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .meal-desc {
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Telemetry KPI Strip */
    .telemetry-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .kpi-tile {
      background: var(--surface-dark);
      border: 1px solid var(--border-dark);
      border-radius: 12px;
      padding: 14px 16px;
      text-align: center;
      transition: transform 0.2s;
    }

    .kpi-tile:hover {
      transform: translateY(-2px);
    }

    .kpi-number {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
    }

    .kpi-title {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    /* Footer Bottom Bar */
    footer {
      background: #090d16;
      border-top: 1px solid var(--border-dark);
      padding: 10px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
    }

    .footer-links a {
      color: #3b82f6;
      text-decoration: none;
      margin-left: 16px;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .signage-main {
        grid-template-columns: 1fr;
      }
      .telemetry-strip {
        grid-template-columns: repeat(2, 1fr);
      }
      .menu-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Top Header Bar -->
  <header>
    <div class="brand-wrap">
      <div class="brand-logo">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Institutional Digital Signage • Central Terminal Node</p>
      </div>
    </div>

    <div class="header-right">
      <div class="live-status-pill">
        <span class="pulse-dot"></span>
        <span id="liveStatusText">Live Feed Active</span>
      </div>

      <div class="weather-widget">
        <i class="fa-solid fa-cloud-sun" style="color: #f59e0b; font-size: 18px;"></i>
        <div>
          <strong id="weatherTemp">31°C</strong>
          <span style="color: #94a3b8; margin-left: 4px;" id="weatherLoc">Bhubaneswar</span>
        </div>
      </div>

      <div class="clock-widget">
        <div class="clock-time" id="clockTime">--:--:--</div>
        <div class="clock-date" id="clockDate">-- --- ----</div>
      </div>

      <button class="fs-btn" id="fsBtn" title="Fullscreen (Press F)">
        <i class="fa-solid fa-expand"></i>
      </button>
    </div>
  </header>

  <!-- Urgent Broadcast Ticker -->
  <div class="ticker-bar" id="tickerBar">
    <div class="ticker-label">
      <i class="fa-solid fa-bullhorn"></i> Campus Broadcast
    </div>
    <div class="ticker-content" id="tickerText">
      Mandatory 20:30 IST Night Curfew enforced across all halls • Central Library extended study halls open till 23:00 IST • TCS & Infosys Pre-Placement Talk Monday 10:00 AM in Main Auditorium
    </div>
  </div>

  <!-- Main Signage Grid -->
  <main class="signage-main">

    <!-- Left Column: Carousel & Notice Stream -->
    <div class="left-column">
      
      <!-- Featured Notice Carousel -->
      <div class="signage-card">
        <div class="card-header-row">
          <div class="card-title">
            <i class="fa-solid fa-newspaper" style="color: #3b82f6;"></i>
            <span>Featured Notice Announcement</span>
          </div>
          <div style="font-size: 12px; color: #94a3b8;" id="carouselCounter">
            Notice 1 of 5
          </div>
        </div>

        <div class="featured-notice-box" id="featuredNoticeBox">
          <div class="notice-progress-bar" id="noticeProgressBar"></div>
          
          <div>
            <div class="notice-badge-row">
              <span class="priority-badge priority-URGENT" id="featuredBadge">URGENT</span>
              <span class="notice-time" id="featuredDate"><i class="fa-regular fa-clock"></i> Just Now</span>
            </div>
            <div class="notice-headline" id="featuredTitle">
              Mandatory Campus Night Curfew Enforcement (20:30 IST)
            </div>
            <div class="notice-description" id="featuredDesc">
              All resident scholars must be inside hostel premises by 8:30 PM sharp. Gate scanners and biometric access logging will operate strictly under Security Operations protocol.
            </div>
          </div>

          <div class="notice-carousel-footer">
            <div class="carousel-indicators" id="carouselIndicators">
              <!-- Dots dynamically inserted -->
            </div>
            <div class="carousel-controls">
              <button class="ctrl-btn" id="prevBtn"><i class="fa-solid fa-chevron-left"></i></button>
              <button class="ctrl-btn" id="nextBtn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Campus Notices Stream -->
      <div class="signage-card">
        <div class="card-header-row" style="margin-bottom: 8px;">
          <div class="card-title">
            <i class="fa-solid fa-list-check" style="color: #10b981;"></i>
            <span>All Published Notices</span>
          </div>
          <span style="font-size: 12px; color: #94a3b8;" id="totalNoticesCount">5 Active Notices</span>
        </div>

        <div class="notices-stream-list" id="noticesStreamList">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>

    <!-- Right Column: Curfew Countdown, Mess Menu, Telemetry -->
    <div class="right-column">
      
      <!-- Curfew Countdown Banner -->
      <div class="curfew-card">
        <div class="curfew-glow"></div>
        <div class="curfew-header">
          <div class="curfew-title">
            <i class="fa-solid fa-shield-halved"></i>
            <span id="curfewLabel">Hostel In-Time & Curfew Countdown</span>
          </div>
          <span style="font-size: 11px; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 4px; font-weight: 700;">DAILY PROTOCOL</span>
        </div>

        <div class="curfew-countdown-box">
          <div>
            <div class="countdown-timer" id="curfewCountdown">08h 55m</div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Time Remaining until Gate Closure</div>
          </div>
          <div class="countdown-target">
            <div class="target-time">20:30 IST</div>
            <div class="target-sub">Evening Curfew</div>
          </div>
        </div>

        <div style="margin-top: 14px; font-size: 12px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #a78bfa;"></i>
          <span id="curfewInstructions">All resident scholars must be logged in past turnstiles before 8:30 PM sharp.</span>
        </div>
      </div>

      <!-- Today's Mess Menu -->
      <div class="menu-card">
        <div class="card-header-row" style="margin-bottom: 8px;">
          <div class="card-title">
            <i class="fa-solid fa-utensils" style="color: #f59e0b;"></i>
            <span>Dining Mess Menu (Today)</span>
          </div>
          <span style="font-size: 12px; color: #f59e0b; font-weight: 600;" id="activeMealHint">Active: Lunch</span>
        </div>

        <div class="menu-grid" id="messMenuGrid">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Live Campus Telemetry Strip -->
      <div class="telemetry-strip">
        <div class="kpi-tile">
          <div class="kpi-number" id="kpiStudents">--</div>
          <div class="kpi-title">Scholars Enrolled</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-number" id="kpiVisitors">--</div>
          <div class="kpi-title">Visitors On-Site</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-number" id="kpiLeaves">--</div>
          <div class="kpi-title">Approved Passes</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-number" id="kpiNotes">--</div>
          <div class="kpi-title">Class Notes</div>
        </div>
      </div>

    </div>

  </main>

  <!-- Footer -->
  <footer>
    <div>
      <span>GEN-Z UNIVERSITY • Autonomous Institution</span>
      <span style="margin: 0 8px;">|</span>
      <span>Live Screen Node: MAIN-LOBBY-01</span>
    </div>
    <div class="footer-links">
      <a href="/admin"><i class="fa-solid fa-sliders"></i> Admin Hub</a>
      <a href="/security"><i class="fa-solid fa-shield"></i> Security Desk</a>
      <a href="/warden"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
    </div>
  </footer>

  <script>
    // State
    let notices = [];
    let currentIndex = 0;
    let carouselTimer = null;
    let progressTimer = null;
    const ROTATION_INTERVAL = 8000; // 8 seconds per notice

    // Clock
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      document.getElementById('clockTime').textContent = timeStr;
      document.getElementById('clockDate').textContent = dateStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Fullscreen support
    const fsBtn = document.getElementById('fsBtn');
    fsBtn.addEventListener('click', toggleFullScreen);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') toggleFullScreen();
    });

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        }
      }
    }

    // Load Data
    async function loadSignageData() {
      try {
        const res = await fetch('/api/tv/signage');
        const data = await res.json();
        if (!data.success) return;

        // Telemetry
        document.getElementById('kpiStudents').textContent = data.telemetry.total_students || 148;
        document.getElementById('kpiVisitors').textContent = data.telemetry.active_visitors || 3;
        document.getElementById('kpiLeaves').textContent = data.telemetry.approved_leaves || 12;
        document.getElementById('kpiNotes').textContent = data.telemetry.classroom_notes || 5;

        // Curfew
        if (data.curfew) {
          document.getElementById('curfewCountdown').textContent = data.curfew.countdown_text;
          document.getElementById('curfewInstructions').textContent = data.curfew.instructions;
          document.getElementById('curfewLabel').textContent = data.curfew.label;
        }

        // Weather
        if (data.weather) {
          document.getElementById('weatherTemp').textContent = data.weather.temp;
          document.getElementById('weatherLoc').textContent = data.weather.location;
        }

        // Notices
        if (data.notices && data.notices.length > 0) {
          notices = data.notices;
          document.getElementById('totalNoticesCount').textContent = \`\${notices.length} Active Notices\`;
          setupCarousel();
          renderStreamList();
          updateTicker();
        }

        // Menu
        if (data.menu && data.menu.length > 0) {
          renderMessMenu(data.menu);
        }

      } catch (err) {
        console.error('Error fetching signage feed:', err);
      }
    }

    // Ticker update
    function updateTicker() {
      if (notices.length === 0) return;
      const urgentList = notices.filter(n => n.priority === 'URGENT' || n.priority === 'IMPORTANT');
      if (urgentList.length > 0) {
        document.getElementById('tickerText').textContent = urgentList.map(n => n.title).join('  •  ');
      }
    }

    // Carousel Setup
    function setupCarousel() {
      const indicators = document.getElementById('carouselIndicators');
      indicators.innerHTML = notices.map((_, i) => \`<div class="indicator-dot \${i === 0 ? 'active' : ''}"></div>\`).join('');
      renderCurrentNotice();
      startCarouselLoop();
    }

    function renderCurrentNotice() {
      if (notices.length === 0) return;
      const n = notices[currentIndex];

      document.getElementById('carouselCounter').textContent = \`Notice \${currentIndex + 1} of \${notices.length}\`;
      const badge = document.getElementById('featuredBadge');
      badge.textContent = n.priority;
      badge.className = \`priority-badge priority-\${n.priority}\`;

      document.getElementById('featuredTitle').textContent = n.title;
      document.getElementById('featuredDesc').textContent = n.description || 'No additional details provided.';
      
      const pubDate = n.published_at ? new Date(n.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
      document.getElementById('featuredDate').innerHTML = \`<i class="fa-regular fa-clock"></i> \${pubDate}\`;

      // Update dots
      const dots = document.querySelectorAll('.indicator-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

      // Reset progress bar animation
      resetProgressBar();
    }

    function resetProgressBar() {
      const bar = document.getElementById('noticeProgressBar');
      bar.style.width = '0%';
      let start = Date.now();
      clearInterval(progressTimer);
      progressTimer = setInterval(() => {
        let elapsed = Date.now() - start;
        let pct = Math.min(100, (elapsed / ROTATION_INTERVAL) * 100);
        bar.style.width = pct + '%';
        if (pct >= 100) clearInterval(progressTimer);
      }, 50);
    }

    function startCarouselLoop() {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(() => {
        nextNotice();
      }, ROTATION_INTERVAL);
    }

    function nextNotice() {
      currentIndex = (currentIndex + 1) % notices.length;
      renderCurrentNotice();
      startCarouselLoop();
    }

    function prevNotice() {
      currentIndex = (currentIndex - 1 + notices.length) % notices.length;
      renderCurrentNotice();
      startCarouselLoop();
    }

    document.getElementById('nextBtn').addEventListener('click', nextNotice);
    document.getElementById('prevBtn').addEventListener('click', prevNotice);

    // Render Notices Stream List
    function renderStreamList() {
      const container = document.getElementById('noticesStreamList');
      container.innerHTML = notices.slice(0, 4).map(n => {
        const dateStr = n.published_at ? new Date(n.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
        const icon = n.priority === 'URGENT' ? 'fa-triangle-exclamation' : (n.priority === 'IMPORTANT' ? 'fa-star' : 'fa-info-circle');
        const color = n.priority === 'URGENT' ? '#ef4444' : (n.priority === 'IMPORTANT' ? '#f59e0b' : '#3b82f6');
        return \`
          <div class="stream-item">
            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
              <i class="fa-solid \${icon}" style="color: \${color}; font-size: 14px; flex-shrink: 0;"></i>
              <div class="stream-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                \${escapeHtml(n.title)}
              </div>
            </div>
            <div class="stream-date">\${dateStr}</div>
          </div>
        \`;
      }).join('');
    }

    // Render Mess Menu
    function renderMessMenu(meals) {
      const container = document.getElementById('messMenuGrid');
      const nowH = new Date().getHours();
      
      // Determine active meal
      let currentMealType = 'LUNCH';
      if (nowH < 10) currentMealType = 'BREAKFAST';
      else if (nowH < 15) currentMealType = 'LUNCH';
      else if (nowH < 18) currentMealType = 'SNACKS';
      else currentMealType = 'DINNER';

      document.getElementById('activeMealHint').textContent = \`Active: \${currentMealType}\`;

      container.innerHTML = meals.map(m => {
        const isActive = m.meal_type.toUpperCase() === currentMealType;
        const icon = m.meal_type === 'BREAKFAST' ? 'fa-egg' : (m.meal_type === 'LUNCH' ? 'fa-bowl-rice' : (m.meal_type === 'SNACKS' ? 'fa-mug-hot' : 'fa-utensils'));
        return \`
          <div class="meal-box \${isActive ? 'active-meal' : ''}">
            \${isActive ? '<span class="active-badge">CURRENT</span>' : ''}
            <div>
              <div class="meal-type"><i class="fa-solid \${icon}"></i> \${m.meal_type}</div>
              <div class="meal-name">\${escapeHtml(m.meal_name)}</div>
            </div>
            <div class="meal-desc">\${escapeHtml(m.description || '')}</div>
          </div>
        \`;
      }).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Auto-refresh telemetry every 30s
    loadSignageData();
    setInterval(loadSignageData, 30000);
  </script>
</body>
</html>
`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('Successfully wrote public/tv.html!');
