const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: CLASSROOM NOTES & DOUBT FORUM -->`;

const newCard = `      <!-- NEW CARD: VISITOR OVERSTAY RADAR & SECURITY TELEMETRY -->
      <div class="launcher-card" style="border-color: #ef4444; background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);">
        <div>
          <div class="launcher-icon" style="background: #fee2e2; color: #dc2626;">
            <i class="fa-solid fa-bell-concierge"></i>
          </div>
          <div class="launcher-title">🚨 Visitor Overstay Radar & Security Alert</div>
          <div class="launcher-desc">
            Campus security surveillance engine. Tracks visitor durations past expected checkout times with amber (+15m) and critical red (+30m) breach warnings, 1-click patrol dispatch, and compliance CSV export.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/admin/visitor-alerts" class="launcher-btn" style="background: #dc2626; color: #fff; flex: 1;">
            Open Overstay Radar → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: CLASSROOM NOTES & DOUBT FORUM -->`;

if (!content.includes('Visitor Overstay Radar & Security Alert')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Visitor Overstay card to admin.html!');
} else {
  console.log('Visitor Overstay card already present in admin.html');
}
