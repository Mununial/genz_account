const fs = require('fs');

const files = [
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/services/authService.js',
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/services/authService.js'
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. In validateUser: query u.photo_url and s.photo_url
  content = content.replace(
    /SELECT DISTINCT u\.id, u\.username, u\.full_name, u\.email, u\.phone, u\.department, u\.role_id, u\.password_hash, u\.status, u\.must_change_password, r\.name as role\s+FROM users u\s+JOIN roles r ON u\.role_id = r\.id\s+LEFT JOIN students s ON s\.user_id = u\.id/m,
    `SELECT DISTINCT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.password_hash, u.status, u.must_change_password, u.photo_url, s.photo_url as student_photo_url, s.roll_number as student_roll_number, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN students s ON (s.user_id = u.id OR s.roll_number = u.username OR s.email = u.email)`
  );

  // 2. Before returning safeUser in validateUser, populate photo
  if (!content.includes('const resolvedPhoto = user.photo_url')) {
    content = content.replace(
      /const \{ password_hash, \.\.\.safeUser \} = user;\s+return safeUser;/m,
      `const resolvedPhoto = user.photo_url || user.student_photo_url || null;
  user.photo_url = resolvedPhoto;
  user.photoUrl = resolvedPhoto;
  user.studentPhotoUrl = resolvedPhoto;

  const { password_hash, ...safeUser } = user;
  return safeUser;`
    );
  }

  // 3. In getUserProfile: query u.photo_url
  content = content.replace(
    /SELECT u\.id, u\.username, u\.email, u\.full_name, u\.gender, u\.phone, u\.status, u\.must_change_password, u\.last_login as last_login_at, u\.created_at, r\.name as role\s+FROM users u\s+JOIN roles r ON u\.role_id = r\.id\s+WHERE u\.id = \? OR u\.username = \? OR u\.email = \?/m,
    `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.photo_url, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? OR u.username = ? OR u.email = ?`
  );

  content = content.replace(
    /SELECT u\.id, u\.username, u\.email, u\.full_name, u\.gender, u\.phone, u\.status, u\.must_change_password, u\.last_login as last_login_at, u\.created_at, r\.name as role\s+FROM students s\s+JOIN users u ON s\.user_id = u\.id/m,
    `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, COALESCE(u.photo_url, s.photo_url) as photo_url, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
       FROM students s
       JOIN users u ON s.user_id = u.id`
  );

  // 4. In student lookup in getUserProfile
  content = content.replace(
    /WHERE s\.user_id = \?`,\s+\[userId\]\s+\);\s+if \(students\.length > 0\) \{\s+user\.student_profile = students\[0\];\s+\}\s+\}\s+return user;/m,
    `WHERE s.user_id = ? OR s.id = ? OR s.roll_number = ? OR s.email = ?\`,
      [userId, userId, user.username, user.email]
    );

    if (students.length > 0) {
      user.student_profile = students[0];
      if (!user.photo_url && students[0].photo_url) {
        user.photo_url = students[0].photo_url;
      }
    }
  }

  const resolvedPhoto = user.photo_url || user.student_profile?.photo_url || null;
  user.photo_url = resolvedPhoto;
  user.photoUrl = resolvedPhoto;
  user.studentPhotoUrl = resolvedPhoto;

  return user;`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Regex updated:', filePath);
}
