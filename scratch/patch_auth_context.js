const fs = require('fs');

const authPath = 'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/frontend/src/context/AuthContext.jsx';
let content = fs.readFileSync(authPath, 'utf8');

// Replace realPhoto in storedPortalUser
content = content.replace(
  "const realPhoto = parsed.photo_url || parsed.studentPhotoUrl || parsed.photoUrl || null;",
  "const realPhoto = parsed.photo_url || parsed.studentPhotoUrl || parsed.photoUrl || parsed.student_profile?.photo_url || null;"
);

// Replace checkAuthStatus photo resolution
const oldCheck = `      const response = await api.get('/auth/me');
      if (response && response.success && response.user) {
        const u = response.user;
        const photo = u.photo_url || u.studentPhotoUrl || u.photoUrl || storedPortalUser?.photo_url || null;
        setUser({
          ...u,
          photo_url: photo,
          photoUrl: photo,
          studentPhotoUrl: photo
        });
        setIsAuthenticated(true);`;

const newCheck = `      const response = await api.get('/auth/me');
      if (response && response.success && response.user) {
        const u = response.user;
        const photo = u.photo_url || u.studentPhotoUrl || u.photoUrl || u.student_profile?.photo_url || storedPortalUser?.photo_url || null;
        const updatedUser = {
          ...u,
          photo_url: photo,
          photoUrl: photo,
          studentPhotoUrl: photo
        };
        setUser(updatedUser);
        setIsAuthenticated(true);
        if (photo) {
          try {
            ['bec_portal_user', 'user', 'college_erp_user', 'bec_session_user'].forEach(k => {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                  parsed.photo_url = photo;
                  parsed.photoUrl = photo;
                  parsed.studentPhotoUrl = photo;
                  localStorage.setItem(k, JSON.stringify(parsed));
                }
              }
            });
          } catch(e) {}
        }`;

content = content.replace(oldCheck, newCheck);

fs.writeFileSync(authPath, content, 'utf8');
console.log('Updated AuthContext.jsx successfully');
