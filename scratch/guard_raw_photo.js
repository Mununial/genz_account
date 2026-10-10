const fs = require('fs');

const p = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/public/student-portal.html';
let content = fs.readFileSync(p, 'utf8');

const oldBlock = `          const rawPhoto = (data.photoUrl && !data.photoUrl.includes('UNIVERSITY_LOGO')) 
            ? data.photoUrl 
            : null;
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

const newBlock = `          const rawPhoto = (data.photoUrl && !data.photoUrl.includes('UNIVERSITY_LOGO')) 
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

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(p, content, 'utf8');
console.log('Guarded rawPhoto in student-portal.html');
