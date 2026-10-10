const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: VISITOR OVERSTAY RADAR & SECURITY TELEMETRY -->`;

const newCard = `      <!-- NEW CARD: SMART TV DIGITAL NOTICE SIGNAGE -->
      <div class="launcher-card" style="border-color: #8b5cf6; background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #ede9fe; color: #7c3aed;">
            <i class="fa-solid fa-tv"></i>
          </div>
          <div class="launcher-title">📺 Smart TV Digital Signage & Notice Broadcast</div>
          <div class="launcher-desc">
            Ultra-high contrast digital signage for campus lobbies, dining mess, and libraries. Features auto-rotating notices, live curfew countdown (20:30 IST), today's dining menu, and real-time operational telemetry.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/tv" target="_blank" class="launcher-btn" style="background: #7c3aed; color: #fff; flex: 1;">
            Launch TV Display → <i class="fa-solid fa-expand"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: VISITOR OVERSTAY RADAR & SECURITY TELEMETRY -->`;

if (!content.includes('Smart TV Digital Signage & Notice Broadcast')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Smart TV card to admin.html!');
} else {
  console.log('Smart TV card already present in admin.html');
}
