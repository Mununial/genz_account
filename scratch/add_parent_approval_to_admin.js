const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARDS: MULTI-ROLE TAILORED DASHBOARDS -->`;

const newCard = `      <!-- NEW CARD: PARENT WHATSAPP 1-CLICK LEAVE APPROVAL -->
      <div class="launcher-card" style="border-color: #25d366; background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);">
        <div>
          <div class="launcher-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <div class="launcher-title">📱 Parent WhatsApp 1-Click Leave Approval</div>
          <div class="launcher-desc">
            Direct parental consent gateway. Instant verified approval or decline for overnight & weekend campus gate passes, travel destination verification, and real-time chief warden synchronization.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/parent-approval" class="launcher-btn" style="background: #16a34a; color: #fff; flex: 1;">
            Open Parent Approval Gateway → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARDS: MULTI-ROLE TAILORED DASHBOARDS -->`;

if (!content.includes('Parent WhatsApp 1-Click Leave Approval')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Parent Approval card to admin.html!');
} else {
  console.log('Parent Approval card already present in admin.html');
}
