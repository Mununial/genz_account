const fs = require('fs');

const files = [
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/services/authService.js',
  'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/services/authService.js'
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. In validateUser: query photo_url
  const oldValidateQuery = `SELECT DISTINCT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.password_hash, u.status, u.must_change_password, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN students s ON s.user_id = u.id`;

  const newValidateQuery = `SELECT DISTINCT u.id, u.username, u.full_name, u.email, u.phone, u.department, u.role_id, u.password_hash, u.status, u.must_change_password, u.photo_url, s.photo_url as student_photo_url, s.roll_number as student_roll_number, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN students s ON (s.user_id = u.id OR s.roll_number = u.username OR s.email = u.email)`;

  if (content.includes(oldValidateQuery)) {
    content = content.replace(oldValidateQuery, newValidateQuery);
  }

  // Ensure safeUser has photo_url populated
  const oldSafeUser = `  const { password_hash, ...safeUser } = user;
  return safeUser;`;

  const newSafeUser = `  const resolvedPhoto = user.photo_url || user.student_photo_url || null;
  user.photo_url = resolvedPhoto;
  user.photoUrl = resolvedPhoto;
  user.studentPhotoUrl = resolvedPhoto;

  const { password_hash, ...safeUser } = user;
  return safeUser;`;

  if (content.includes(oldSafeUser)) {
    content = content.replace(oldSafeUser, newSafeUser);
  }

  // 2. In getUserProfile: query photo_url from users table
  const oldUserSelect = `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? OR u.username = ? OR u.email = ?`;

  const newUserSelect = `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.photo_url, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? OR u.username = ? OR u.email = ?`;

  if (content.includes(oldUserSelect)) {
    content = content.replace(oldUserSelect, newUserSelect);
  }

  const oldStudentUsersSelect = `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
       FROM students s
       JOIN users u ON s.user_id = u.id`;

  const newStudentUsersSelect = `SELECT u.id, u.username, u.email, u.full_name, u.gender, u.phone, COALESCE(u.photo_url, s.photo_url) as photo_url, u.status, u.must_change_password, u.last_login as last_login_at, u.created_at, r.name as role
       FROM students s
       JOIN users u ON s.user_id = u.id`;

  if (content.includes(oldStudentUsersSelect)) {
    content = content.replace(oldStudentUsersSelect, newStudentUsersSelect);
  }

  // In student profile lookup: match by userId OR roll_number OR email
  const oldStudentQuery = `WHERE s.user_id = ?\`,
      [userId]
    );

    if (students.length > 0) {
      user.student_profile = students[0];
    }
  }

  return user;`;

  const newStudentQuery = `WHERE s.user_id = ? OR s.id = ? OR s.roll_number = ? OR s.email = ?\`,
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

  return user;`;

  if (content.includes(oldStudentQuery)) {
    content = content.replace(oldStudentQuery, newStudentQuery);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}
