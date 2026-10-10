const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/parent-portal.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent Telemetry & Student Safety | GEN-Z UNIVERSITY</title>
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

    .role-badge {
      background: #fdf2f8;
      color: #be185d;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    main {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px;
      flex: 1;
    }

    /* Student Selector Hero */
    .hero-selector {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      border-radius: var(--radius);
      padding: 24px 28px;
      color: #fff;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 18px;
      box-shadow: 0 10px 25px rgba(30, 58, 138, 0.15);
    }

    .hero-title h2 {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .hero-title p {
      font-size: 0.88rem;
      color: #bfdbfe;
      margin-top: 4px;
    }

    .selector-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      padding: 6px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.25);
    }

    .selector-box select {
      background: transparent;
      color: #fff;
      border: none;
      font-size: 0.9rem;
      font-weight: 700;
      padding: 6px 10px;
      outline: none;
      cursor: pointer;
    }

    .selector-box select option {
      background: #1e3a8a;
      color: #fff;
    }

    /* Grid Layout */
    .parent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Progress bar */
    .progress-bar-bg {
      background: #f1f5f9;
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      margin: 14px 0 10px 0;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb 0%, #16a34a 100%);
      border-radius: 999px;
      transition: width 0.6s ease;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.88rem;
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-label {
      color: var(--text-muted);
      font-weight: 600;
    }

    .stat-val {
      font-weight: 700;
      color: var(--text-main);
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

    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }

    .btn-action {
      width: 100%;
      padding: 12px;
      border-radius: 9px;
      font-size: 0.88rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      margin-top: 14px;
    }

    .btn-whatsapp {
      background: #25d366;
      color: #fff;
    }

    .btn-whatsapp:hover {
      background: #1eb956;
    }

    .btn-pay {
      background: var(--primary-accent);
      color: #fff;
    }

    .btn-pay:hover {
      background: #1d4ed8;
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
        <i class="fa-solid fa-people-roof"></i>
      </div>
      <div class="brand-text">
        <h1>GEN-Z UNIVERSITY</h1>
        <p>Parent Telemetry & Student Safety Monitoring Desk</p>
      </div>
    </div>
    <div class="nav-actions">
      <span class="role-badge"><i class="fa-solid fa-heart"></i> Parent Portal</span>
      <a href="/warden" class="btn-nav"><i class="fa-solid fa-hotel"></i> Warden Portal</a>
      <a href="/security" class="btn-nav"><i class="fa-solid fa-shield-halved"></i> Gate Desk</a>
      <a href="/staff" class="btn-nav"><i class="fa-solid fa-chalkboard-user"></i> Staff Hub</a>
      <a href="/admin" class="btn-nav" style="background: var(--primary); color: #fff;"><i class="fa-solid fa-gauge-high"></i> Admin Hub</a>
    </div>
  </header>

  <main>
    <!-- Hero Student Selector -->
    <div class="hero-selector">
      <div class="hero-title">
        <h2 id="heroStudentName">SOBHARANI BHUMIJ</h2>
        <p><i class="fa-solid fa-id-card"></i> Roll No: <span id="heroRoll">PENDING</span> • Branch: <span id="heroBranch">Civil Engineering</span></p>
      </div>
      <div class="selector-box">
        <label style="font-size: 0.8rem; font-weight: 700; color: #dbeafe;"><i class="fa-solid fa-child"></i> Switch Ward:</label>
        <select id="studentSelect" onchange="loadChildTelemetry(this.value)">
          <option value="">Loading students...</option>
        </select>
      </div>
    </div>

    <!-- 3-Col Parent Grid -->
    <div class="parent-grid">
      
      <!-- Card 1: Attendance Radar -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-calendar-check" style="color: #2563eb;"></i> Academic Attendance</div>
          <span id="attBadge" class="badge badge-success">Satisfactory</span>
        </div>
        <div style="text-align: center; margin: 12px 0;">
          <span id="attPct" style="font-size: 2.4rem; font-weight: 800; color: #1e3a8a;">100%</span>
          <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Overall Semester Attendance</div>
        </div>
        <div class="progress-bar-bg">
          <div id="attProgressFill" class="progress-bar-fill" style="width: 100%;"></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Days Conducted</span>
          <span class="stat-val" id="attTotalDays">5 Days</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Days Present</span>
          <span class="stat-val" id="attPresentDays" style="color: #16a34a;">5 Days</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Days Absent</span>
          <span class="stat-val" id="attAbsentDays" style="color: #dc2626;">0 Days</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Minimum Requirement</span>
          <span class="stat-val">75.0% Mandatory</span>
        </div>
      </div>

      <!-- Card 2: Hostel & Academic Fees -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-wallet" style="color: #16a34a;"></i> Hostel & Mess Dues</div>
          <span id="feeBadge" class="badge badge-success">Paid in Full</span>
        </div>
        <div style="text-align: center; margin: 12px 0;">
          <span id="feePending" style="font-size: 2.4rem; font-weight: 800; color: #16a34a;">₹0</span>
          <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Outstanding Dues</div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Annual Fee</span>
          <span class="stat-val" id="feeTotal">₹65,000</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Amount Cleared</span>
          <span class="stat-val" id="feePaid">₹65,000</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Due Date</span>
          <span class="stat-val" id="feeDue">15 Nov 2026</span>
        </div>
        <button onclick="downloadReceipt()" class="btn-action btn-pay">
          <i class="fa-solid fa-file-invoice-dollar"></i> Download Official GENZ Receipt
        </button>
      </div>

      <!-- Card 3: Safety & Curfew Gatepass -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-shield-cat" style="color: #2563eb;"></i> Campus Safety & Passes</div>
          <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Safe Inside Hostel</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Hostel Residence</span>
          <span class="stat-val" id="hostelName">GENZ Residential Hostel Block</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Night Curfew Threshold</span>
          <span class="stat-val" style="color: #d97706; font-weight: 700;">09:00 PM Sharp</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Chief Warden Hotline</span>
          <span class="stat-val" style="color: #1e3a8a;"><a href="tel:+919437102030" style="color: inherit; text-decoration: none;">+91-9437102030</a></span>
        </div>

        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-radius: 9px; border: 1px solid #bfdbfe;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #1e40af; margin-bottom: 4px;">
            <i class="fa-brands fa-whatsapp"></i> 1-Click WhatsApp Leave Consent
          </div>
          <p style="font-size: 0.76rem; color: #3b82f6; line-height: 1.4;">
            Authorize weekend leave requests with verified parent consent.
          </p>
          <button onclick="handleParentWhatsAppApproval()" class="btn-action btn-whatsapp" style="margin-top: 10px;">
            <i class="fa-brands fa-whatsapp"></i> Grant Verified Parent Consent
          </button>
        </div>
      </div>

    </div>
  </main>

  <div id="toast"></div>

  <script>
    let currentStudentId = '';

    function showToast(msg, isSuccess = true) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = isSuccess ? '#16a34a' : '#dc2626';
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    async function loadStudentList() {
      try {
        const res = await fetch('/api/roles/parent/search');
        const data = await res.json();
        const sel = document.getElementById('studentSelect');
        sel.innerHTML = '';

        if (data.success && data.students.length > 0) {
          data.students.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.innerText = \`\${s.full_name} (\${s.student_id})\`;
            sel.appendChild(opt);
          });

          currentStudentId = data.students[0].id;
          loadChildTelemetry(currentStudentId);
        }
      } catch (err) {
        console.error('Student list load error:', err);
      }
    }

    async function loadChildTelemetry(studentId) {
      currentStudentId = studentId;
      try {
        const res = await fetch('/api/roles/parent/student/' + studentId);
        const data = await res.json();
        if (data.success) {
          const s = data.student;
          const a = data.attendance;
          const f = data.fees;

          document.getElementById('heroStudentName').innerText = s.fullName;
          document.getElementById('heroRoll').innerText = s.rollNumber;
          document.getElementById('heroBranch').innerText = s.branch;
          document.getElementById('hostelName').innerText = s.hostelName;

          // Attendance
          document.getElementById('attPct').innerText = a.percentage + '%';
          document.getElementById('attProgressFill').style.width = a.percentage + '%';
          document.getElementById('attTotalDays').innerText = a.totalDays + ' Days';
          document.getElementById('attPresentDays').innerText = a.presentDays + ' Days';
          document.getElementById('attAbsentDays').innerText = a.absentDays + ' Days';

          const attBadge = document.getElementById('attBadge');
          if (a.percentage >= 75) {
            attBadge.className = 'badge badge-success';
            attBadge.innerText = 'Satisfactory';
          } else {
            attBadge.className = 'badge badge-danger';
            attBadge.innerText = 'Critical Defaulter (<75%)';
          }

          // Fees
          document.getElementById('feePending').innerText = '₹' + f.pendingBalance.toLocaleString();
          document.getElementById('feeTotal').innerText = '₹' + f.totalFee.toLocaleString();
          document.getElementById('feePaid').innerText = '₹' + f.paidAmount.toLocaleString();
          document.getElementById('feeDue').innerText = f.dueDate || '15 Nov 2026';

          const feeBadge = document.getElementById('feeBadge');
          if (f.pendingBalance <= 0) {
            feeBadge.className = 'badge badge-success';
            feeBadge.innerText = 'Paid in Full';
            document.getElementById('feePending').style.color = '#16a34a';
          } else {
            feeBadge.className = 'badge badge-danger';
            feeBadge.innerText = 'Pending Dues';
            document.getElementById('feePending').style.color = '#dc2626';
          }
        }
      } catch (err) {
        console.error('Child telemetry error:', err);
      }
    }

    async function handleParentWhatsAppApproval() {
      try {
        const res = await fetch('/api/roles/parent/whatsapp-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaveId: 1 })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, true);
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Approval trigger failed: ' + err.message, false);
      }
    }

    function downloadReceipt() {
      showToast('Downloading verified GENZ Fee Payment Receipt PDF...', true);
    }

    loadStudentList();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('parent-portal.html created successfully!');
