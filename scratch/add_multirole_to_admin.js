const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: POLLS & SURVEYS WITH INSTANT CSV EXPORT -->`;

const newCards = `      <!-- NEW CARDS: MULTI-ROLE TAILORED DASHBOARDS -->
      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #dbeafe; color: #1d4ed8;">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div class="launcher-title">🚨 Security Gate Desk</div>
          <div class="launcher-desc">
            Main campus entry/exit operations. Fast barcode/pass scanner, visitor registration with ID verification, active visitor tracking, and student curfew movement logs.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/security" class="launcher-btn" style="background: #1e40af; color: #fff; flex: 1;">
            Open Gate Desk → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #dbeafe; color: #1d4ed8;">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div class="launcher-title">👨‍🏫 Staff & Faculty Portal</div>
          <div class="launcher-desc">
            Departmental student mentorship & academic governance. 1-click leave approvals, low attendance (&lt;75%) defaulter radar, and parent alert dispatch.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/staff" class="launcher-btn" style="background: #1e40af; color: #fff; flex: 1;">
            Open Staff Hub → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);">
        <div>
          <div class="launcher-icon" style="background: #fce7f3; color: #be185d;">
            <i class="fa-solid fa-people-roof"></i>
          </div>
          <div class="launcher-title">👨‍👩‍👧 Parent Telemetry Portal</div>
          <div class="launcher-desc">
            Real-time child safety & academic transparency for parents. Attendance tracking, hostel dues & receipt download, curfew gate pass status, and 1-click WhatsApp leave authorization.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/parent" class="launcher-btn" style="background: #9d174d; color: #fff; flex: 1;">
            Open Parent Portal → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: POLLS & SURVEYS WITH INSTANT CSV EXPORT -->`;

if (!content.includes('Security Gate Desk')) {
  content = content.replace(target, newCards);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Multi-Role cards to admin.html!');
} else {
  console.log('Multi-Role cards already present in admin.html');
}
