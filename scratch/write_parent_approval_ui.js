const fs = require('fs');
const targetFile = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/parent-approval.html';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parent Leave Authorization | GEN-Z UNIVERSITY</title>
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
      --danger: #dc2626;
      --warning: #d97706;
      --radius: 16px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--background);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }

    .container {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    /* Official GENZ Header */
    .header-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      margin-bottom: 16px;
      position: relative;
    }

    .college-logo {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-accent) 100%);
      color: #fff;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .college-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.02em;
    }

    .college-sub {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 2px;
    }

    .whatsapp-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #15803d;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      margin-top: 10px;
    }

    /* Quick Demo Switcher */
    .switcher-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 8px 12px;
      margin-bottom: 16px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #1e40af;
    }

    .switcher-row select {
      background: #fff;
      border: 1px solid #93c5fd;
      color: #1e40af;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      outline: none;
    }

    /* Main Pass Card */
    .pass-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.04);
      margin-bottom: 16px;
    }

    .student-badge-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 18px;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 18px;
    }

    .student-avatar {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #dbeafe;
      color: #1d4ed8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    .student-info h2 {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .student-info p {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 3px;
      font-weight: 600;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 18px;
    }

    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
    }

    .info-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .info-val {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .reason-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 20px;
    }

    .status-banner {
      padding: 12px;
      border-radius: 10px;
      text-align: center;
      font-size: 0.88rem;
      font-weight: 800;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .status-pending { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-approved { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .status-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

    /* Action Buttons */
    .btn-approve {
      width: 100%;
      background: #16a34a;
      color: #fff;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
      transition: all 0.2s;
      margin-bottom: 12px;
    }

    .btn-approve:hover {
      background: #15803d;
      transform: translateY(-1px);
    }

    .btn-decline {
      width: 100%;
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      padding: 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      margin-bottom: 12px;
    }

    .btn-decline:hover {
      background: #fecaca;
    }

    .btn-warden {
      width: 100%;
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      padding: 12px;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-warden:hover {
      background: #dbeafe;
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
      max-width: 450px;
      width: 100%;
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

  <div class="container">
    
    <!-- Header -->
    <div class="header-card">
      <div class="college-logo">
        <i class="fa-solid fa-graduation-cap"></i>
      </div>
      <h1 class="college-title">GEN-Z UNIVERSITY</h1>
      <p class="college-sub">Official Student Leave Pass & Safety Verification</p>
      <div class="whatsapp-badge">
        <i class="fa-brands fa-whatsapp"></i> Verified Parent WhatsApp Gateway
      </div>
    </div>

    <!-- Quick Pass Switcher (for preview/testing) -->
    <div class="switcher-row">
      <span><i class="fa-solid fa-file-invoice"></i> Select Application:</span>
      <select id="leaveSelect" onchange="loadLeaveDetails(this.value)">
        <option value="">Loading leaves...</option>
      </select>
    </div>

    <!-- Pass Card -->
    <div class="pass-card">
      
      <div class="student-badge-wrap">
        <div class="student-avatar" id="avatarLetter">S</div>
        <div class="student-info">
          <h2 id="studentName">SOBHARANI BHUMIJ</h2>
          <p id="studentMeta"><i class="fa-solid fa-id-card"></i> Roll: PENDING • Civil Engineering</p>
          <p id="hostelMeta" style="color: #2563eb; margin-top: 2px;"><i class="fa-solid fa-hotel"></i> GENZ Boys Hostel Block-A</p>
        </div>
      </div>

      <div class="status-banner status-pending" id="statusBanner">
        <i class="fa-solid fa-hourglass-half"></i> Pending Parent Authorization
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div class="info-label"><i class="fa-solid fa-plane-departure"></i> Departure Date</div>
          <div class="info-val" id="startDate">03 Oct 2026</div>
        </div>
        <div class="info-box">
          <div class="info-label"><i class="fa-solid fa-plane-arrival"></i> Expected Return</div>
          <div class="info-val" id="endDate">05 Oct 2026</div>
        </div>
      </div>

      <div class="reason-box">
        <div class="info-label" style="margin-bottom: 6px;"><i class="fa-solid fa-location-dot"></i> Destination Address</div>
        <div class="info-val" id="destination" style="font-size: 0.88rem; margin-bottom: 12px; font-weight: 600;">
          Plot 42, Cuttack Road, Bhubaneswar
        </div>

        <div class="info-label" style="margin-bottom: 6px;"><i class="fa-solid fa-clipboard-question"></i> Stated Reason for Leave</div>
        <div class="info-val" id="reason" style="font-size: 0.88rem; font-weight: 500; color: #334155; line-height: 1.4;">
          Family festival celebration and medical health checkup in hometown.
        </div>
      </div>

      <!-- Action Buttons -->
      <div id="actionButtonsContainer">
        <button onclick="handleDecision('APPROVED')" class="btn-approve">
          <i class="fa-solid fa-circle-check"></i> Approve Leave Application
        </button>
        <button onclick="openDeclineModal()" class="btn-decline">
          <i class="fa-solid fa-circle-xmark"></i> Decline Leave Request
        </button>
      </div>

      <a href="tel:+919437102030" class="btn-warden">
        <i class="fa-solid fa-phone-volume"></i> Speak to Chief Warden (+91-9437102030)
      </a>

    </div>

    <!-- Return to admin link -->
    <div style="text-align: center; margin-top: 10px;">
      <a href="/admin" style="font-size: 0.8rem; color: #64748b; text-decoration: none; font-weight: 600;">
        <i class="fa-solid fa-arrow-left"></i> Return to Admin Hub
      </a>
    </div>

  </div>

  <!-- Decline Modal -->
  <div class="modal-overlay" id="declineModal">
    <div class="modal-card">
      <h3 style="font-size: 1.1rem; font-weight: 800; color: #b91c1c; margin-bottom: 8px;">
        <i class="fa-solid fa-triangle-exclamation"></i> Decline Leave Request
      </h3>
      <p style="font-size: 0.85rem; color: #475569; margin-bottom: 14px;">
        Please specify a reason for declining. The hostel warden and student will be alerted immediately.
      </p>
      <textarea id="declineRemarks" style="width: 100%; height: 90px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.85rem; margin-bottom: 14px;" placeholder="e.g. Upcoming midterm examinations / Not authorized to travel"></textarea>
      <div style="display: flex; gap: 10px;">
        <button onclick="closeDeclineModal()" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
        <button onclick="submitDecline()" style="flex: 1; padding: 10px; border: none; background: #dc2626; color: #fff; border-radius: 8px; font-weight: 700; cursor: pointer;">Confirm Decline</button>
      </div>
    </div>
  </div>

  <div id="toast"></div>

  <script>
    let currentLeaveId = 4;

    function showToast(msg, isSuccess = true) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.background = isSuccess ? '#16a34a' : '#dc2626';
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    async function loadPendingList() {
      try {
        const res = await fetch('/api/parent-approval/list-pending');
        const data = await res.json();
        const sel = document.getElementById('leaveSelect');
        sel.innerHTML = '';

        if (data.success && data.leaves.length > 0) {
          data.leaves.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.id;
            opt.innerText = \`#\${l.leave_number} - \${l.student_name} (\${l.status})\`;
            sel.appendChild(opt);
          });

          // Check URL query param ?id=
          const params = new URLSearchParams(window.location.search);
          const qId = params.get('id');
          if (qId) {
            sel.value = qId;
            currentLeaveId = qId;
          } else {
            currentLeaveId = data.leaves[0].id;
            sel.value = currentLeaveId;
          }
          loadLeaveDetails(currentLeaveId);
        }
      } catch (err) {
        console.error('List error:', err);
      }
    }

    async function loadLeaveDetails(leaveId) {
      currentLeaveId = leaveId;
      try {
        const res = await fetch('/api/parent-approval/details/' + leaveId);
        const data = await res.json();
        if (data.success) {
          const l = data.leave;
          document.getElementById('studentName').innerText = l.student_name || 'Verified Student';
          document.getElementById('avatarLetter').innerText = (l.student_name || 'S').charAt(0).toUpperCase();
          document.getElementById('studentMeta').innerHTML = \`<i class="fa-solid fa-id-card"></i> Roll: \${l.roll_number || 'PENDING'} • \${l.branch || 'Engineering'}\`;
          document.getElementById('hostelMeta').innerHTML = \`<i class="fa-solid fa-hotel"></i> \${l.hostel_name || 'GENZ Residential Hostel'}\`;
          
          document.getElementById('startDate').innerText = l.start_date;
          document.getElementById('endDate').innerText = l.end_date;
          document.getElementById('destination').innerText = l.destination_address;
          document.getElementById('reason').innerText = l.reason;

          const banner = document.getElementById('statusBanner');
          const btnContainer = document.getElementById('actionButtonsContainer');

          if (l.status === 'APPROVED') {
            banner.className = 'status-banner status-approved';
            banner.innerHTML = '<i class="fa-solid fa-circle-check"></i> Approved with Verified Parent Consent';
            btnContainer.style.display = 'none';
          } else if (l.status === 'REJECTED') {
            banner.className = 'status-banner status-rejected';
            banner.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Declined by Parent';
            btnContainer.style.display = 'none';
          } else {
            banner.className = 'status-banner status-pending';
            banner.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> Pending Parent Authorization';
            btnContainer.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Details error:', err);
      }
    }

    async function handleDecision(action, remarks = '') {
      try {
        const res = await fetch('/api/parent-approval/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaveId: currentLeaveId, action, remarks })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, action === 'APPROVED');
          loadLeaveDetails(currentLeaveId);
        } else {
          showToast(data.error, false);
        }
      } catch (err) {
        showToast('Submission error: ' + err.message, false);
      }
    }

    function openDeclineModal() {
      document.getElementById('declineModal').style.display = 'flex';
    }

    function closeDeclineModal() {
      document.getElementById('declineModal').style.display = 'none';
      document.getElementById('declineRemarks').value = '';
    }

    function submitDecline() {
      const rem = document.getElementById('declineRemarks').value.trim();
      closeDeclineModal();
      handleDecision('REJECTED', rem || 'Declined by Parent via WhatsApp Gateway');
    }

    loadPendingList();
  </script>
</body>
</html>`;

fs.writeFileSync(targetFile, html, 'utf8');
console.log('parent-approval.html created successfully!');
