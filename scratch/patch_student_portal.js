const fs = require('fs');

const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/student-portal.html';
let content = fs.readFileSync(p, 'utf8');

// 1. Fix line 6646
content = content.replace(
  "avatarImg.onerror = () => { avatarImg.src = '/uploads/gate_logs/student_2301316095.jpg'; };",
  "avatarImg.onerror = () => { avatarImg.src = '/assets/UNIVERSITY_LOGO.png'; };"
);

// 2. Fix line 6815 & 6818
content = content.replace(
  "const validPhoto = (photoUrl && !photoUrl.includes('UNIVERSITY_LOGO')) ? photoUrl : (isRegistered ? '/uploads/gate_logs/student_2301316095.jpg' : null);",
  "const validPhoto = (photoUrl && !photoUrl.includes('UNIVERSITY_LOGO')) ? photoUrl : null;"
);
content = content.replace(
  "avatarImg.onerror = () => { avatarImg.src = '/uploads/gate_logs/student_2301316095.jpg'; };",
  "avatarImg.onerror = () => { avatarImg.src = '/assets/UNIVERSITY_LOGO.png'; };"
);

// 3. Fix default studentVerifiedPhotoUrl
content = content.replace(
  "let studentVerifiedPhotoUrl = '/uploads/gate_logs/student_2301316095.jpg';",
  "let studentVerifiedPhotoUrl = '';"
);

// 4. Fix getStudentRollNumber default
content = content.replace(
  "return '2301316095';",
  "return '';"
);

// 5. Fix loadStudentFaceStatus overwriting localStorage with wrong photo
const oldRawPhotoBlock = `          const rawPhoto = (data.photoUrl && !data.photoUrl.includes('UNIVERSITY_LOGO')) 
            ? data.photoUrl 
            : '/uploads/gate_logs/student_2301316095.jpg';
          studentVerifiedPhotoUrl = rawPhoto.includes('?') ? rawPhoto : \`\${rawPhoto}?t=\${Date.now()}\`;

          // Keep localStorage in sync so refreshing the page immediately shows the latest photo
          ['user', 'college_erp_user', 'portalUser', 'bec_session_user'].forEach(key => {
            try {
              const u = JSON.parse(localStorage.getItem(key) || '{}');
              if (u && typeof u === 'object') {
                u.photoUrl = rawPhoto;
                u.studentPhotoUrl = rawPhoto;
                u.photo_url = rawPhoto;
                localStorage.setItem(key, JSON.stringify(u));
              }
            } catch(e) {}
          });`;

const newRawPhotoBlock = `          const rawPhoto = (data.photoUrl && !data.photoUrl.includes('UNIVERSITY_LOGO')) 
            ? data.photoUrl 
            : null;
          if (rawPhoto) {
            studentVerifiedPhotoUrl = rawPhoto.includes('?') ? rawPhoto : \`\${rawPhoto}?t=\${Date.now()}\`;

            // Keep localStorage in sync so refreshing the page immediately shows the latest photo
            ['user', 'college_erp_user', 'portalUser', 'bec_session_user'].forEach(key => {
              try {
                const u = JSON.parse(localStorage.getItem(key) || '{}');
                if (u && typeof u === 'object') {
                  u.photoUrl = rawPhoto;
                  u.studentPhotoUrl = rawPhoto;
                  u.photo_url = rawPhoto;
                  localStorage.setItem(key, JSON.stringify(u));
                }
              } catch(e) {}
            });
          }`;

if (content.includes(oldRawPhotoBlock)) {
  content = content.replace(oldRawPhotoBlock, newRawPhotoBlock);
} else {
  console.log('Notice: oldRawPhotoBlock not matched exactly, replacing line by line');
  content = content.replace(
    ": '/uploads/gate_logs/student_2301316095.jpg';",
    ": null;"
  );
}

fs.writeFileSync(p, content, 'utf8');
console.log('Successfully patched student-portal.html');
