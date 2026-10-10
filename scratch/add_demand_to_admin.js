const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: MEAL PLANNING & FOOD WASTE FORECAST -->`;

const newCard = `      <!-- NEW CARD: HOSTEL DEMAND & CAPACITY FORECAST -->
      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #dbeafe; color: #1d4ed8;">
            <i class="fa-solid fa-city"></i>
          </div>
          <div class="launcher-title">🏢 Hostel Demand & Capacity Forecast</div>
          <div class="launcher-desc">
            Strategic accommodation planning engine. Tracks 450 applications (320 confirmed, 130 pending against 500 capacity), gender breakdown (Boys: 280, Girls: 170), multi-year AI predictive trends, and instant CSV export.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/admin/hostel-demand" class="launcher-btn" style="background: #1e40af; color: #fff; flex: 1;">
            Open Demand Forecast → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: MEAL PLANNING & FOOD WASTE FORECAST -->`;

if (!content.includes('Hostel Demand & Capacity Forecast')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Hostel Demand card to admin.html!');
} else {
  console.log('Hostel Demand card already present in admin.html');
}
