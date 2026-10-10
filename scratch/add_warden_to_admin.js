const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: AUDIT & COMPLIANCE REPORTS -->`;

const newCard = `      <!-- NEW CARD: WARDEN NIGHT SAFETY & CURFEW RADAR -->
      <div class="launcher-card" style="border-color: #dc2626; background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);">
        <div>
          <div class="launcher-icon" style="background: #fee2e2; color: #dc2626;">
            <i class="fa-solid fa-person-shelter"></i>
          </div>
          <div class="launcher-title">🛡️ Warden Night Safety & Curfew Radar</div>
          <div class="launcher-desc">
            Automated curfew surveillance (09:00 PM cutoff). Live missing student rosters, 3-tier escalation (+0m overdue, +30m auto-SMS to parents, +60m critical alert to warden & security), and Girls Hostel Block-B priority tracking.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/warden" class="launcher-btn" style="background: #dc2626; color: #fff; flex: 1;">
            Open Warden Console → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: AUDIT & COMPLIANCE REPORTS -->`;

content = content.replace(target, newCard);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Added Warden card to admin.html!');
