const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: HOSTEL DEMAND & CAPACITY FORECAST -->`;

const newCard = `      <!-- NEW CARD: POLLS & SURVEYS WITH INSTANT CSV EXPORT -->
      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #dbeafe; color: #1d4ed8;">
            <i class="fa-solid fa-square-poll-vertical"></i>
          </div>
          <div class="launcher-title">📊 Campus Polls & Surveys</div>
          <div class="launcher-desc">
            Direct student feedback engine. Conduct hostel & academic sentiment polls with instant live visual percentage bars, multi-choice voter responses, active/closed toggling, and 1-click administrative CSV data export.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/admin/polls" class="launcher-btn" style="background: #1e40af; color: #fff; flex: 1;">
            Open Polls & Surveys → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: HOSTEL DEMAND & CAPACITY FORECAST -->`;

if (!content.includes('Campus Polls & Surveys')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Polls & Surveys card to admin.html!');
} else {
  console.log('Polls & Surveys card already present in admin.html');
}
