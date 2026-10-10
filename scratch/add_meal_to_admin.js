const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: WARDEN NIGHT SAFETY & CURFEW RADAR -->`;

const newCard = `      <!-- NEW CARD: MEAL PLANNING & FOOD WASTE FORECAST -->
      <div class="launcher-card" style="border-color: #16a34a; background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);">
        <div>
          <div class="launcher-icon" style="background: #dcfce7; color: #16a34a;">
            <i class="fa-solid fa-utensils"></i>
          </div>
          <div class="launcher-title">🍲 Meal Planning & Food Waste Forecast</div>
          <div class="launcher-desc">
            Smart mess procurement based on verified student meal preferences. Real-time headcounts for Breakfast, Lunch, Snacks, Dinner, opt-out tracking (10 PM cutoff), and 1-click vendor SMS dispatch.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/admin/meal-planning" class="launcher-btn" style="background: #16a34a; color: #fff; flex: 1;">
            Open Meal Planning → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: WARDEN NIGHT SAFETY & CURFEW RADAR -->`;

if (!content.includes('Meal Planning & Food Waste Forecast')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Meal Planning card to admin.html!');
} else {
  console.log('Meal Planning card already present in admin.html');
}
