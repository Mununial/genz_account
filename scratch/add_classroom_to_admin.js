const fs = require('fs');
const filePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/admin.html';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      <!-- NEW CARD: PARENT WHATSAPP 1-CLICK LEAVE APPROVAL -->`;

const newCard = `      <!-- NEW CARD: CLASSROOM NOTES & DOUBT FORUM -->
      <div class="launcher-card" style="border-color: #2563eb; background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);">
        <div>
          <div class="launcher-icon" style="background: #dbeafe; color: #1d4ed8;">
            <i class="fa-solid fa-book-open-reader"></i>
          </div>
          <div class="launcher-title">📚 Classroom Notes & Doubt Clearance Forum</div>
          <div class="launcher-desc">
            Academic repository & peer learning network. Download subject-wise lecture handouts (Cloudinary PDF sync) and participate in student doubt threads resolved by faculty mentors.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="/classroom" class="launcher-btn" style="background: #1e40af; color: #fff; flex: 1;">
            Open Classroom Hub → <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>

      <!-- NEW CARD: PARENT WHATSAPP 1-CLICK LEAVE APPROVAL -->`;

if (!content.includes('Classroom Notes & Doubt Clearance Forum')) {
  content = content.replace(target, newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added Classroom card to admin.html!');
} else {
  console.log('Classroom card already present in admin.html');
}
