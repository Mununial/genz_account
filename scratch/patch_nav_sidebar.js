const fs = require('fs');

const navPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/frontend/src/components/Navbar.jsx';
let navContent = fs.readFileSync(navPath, 'utf8');

navContent = navContent.replace(
  "(user.photo_url || user.studentPhotoUrl || user.photoUrl)",
  "(user.photo_url || user.studentPhotoUrl || user.photoUrl || user.student_profile?.photo_url)"
);
navContent = navContent.replace(
  "src={user.photo_url || user.studentPhotoUrl || user.photoUrl}",
  "src={user.photo_url || user.studentPhotoUrl || user.photoUrl || user.student_profile?.photo_url} onError={(e) => { e.currentTarget.style.display = 'none'; }}"
);
fs.writeFileSync(navPath, navContent, 'utf8');

const sidePath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/frontend/src/components/Sidebar.jsx';
let sideContent = fs.readFileSync(sidePath, 'utf8');

sideContent = sideContent.replace(
  "(user?.photo_url || user?.studentPhotoUrl || user?.photoUrl)",
  "(user?.photo_url || user?.studentPhotoUrl || user?.photoUrl || user?.student_profile?.photo_url)"
);
sideContent = sideContent.replace(
  "src={user.photo_url || user.studentPhotoUrl || user.photoUrl}",
  "src={user.photo_url || user.studentPhotoUrl || user.photoUrl || user.student_profile?.photo_url} onError={(e) => { e.currentTarget.style.display = 'none'; }}"
);
fs.writeFileSync(sidePath, sideContent, 'utf8');

console.log('Updated Navbar and Sidebar');
