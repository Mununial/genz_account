const fs = require('fs');

const paths = [
    'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/utils/authorization.js',
    'c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/campus-portal/hostel-backend/utils/authorization.js'
];

for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf8');

    // Update hasStudentAccess
    const oldStudentAccess = `  if (user.role === 'STUDENT') {
    const [rows] = await db.pool.query(
      'SELECT id FROM students WHERE user_id = ? AND id = ?',
      [user.id, studentId]
    );
    return rows.length > 0;
  }`;

    const newStudentAccess = `  if (user.role === 'STUDENT') {
    const targetTerm = (user.username || user.rollNo || user.id || '').toString().trim();
    const searchPattern = '%' + (user.email || targetTerm) + '%';
    const [rows] = await db.pool.query(
      \`SELECT id FROM students 
       WHERE (id = ? OR roll_number = ? OR student_id = ?) 
         AND (user_id = ? OR roll_number = ? OR student_id = ? OR LOWER(email) = LOWER(?) OR LOWER(email) LIKE LOWER(?))\`,
      [studentId, targetTerm, targetTerm, user.id, targetTerm, targetTerm, user.email || targetTerm, searchPattern]
    );
    return rows.length > 0;
  }`;

    // Update hasHostelAccess
    const oldHostelAccess = `  if (user.role === 'STUDENT') {
    // A student only has access if they are assigned to a bed in this hostel
    const [rows] = await db.pool.query(
      \`SELECT s.id FROM students s
       JOIN beds b ON s.bed_id = b.id
       JOIN rooms r ON b.room_id = r.id
       WHERE s.user_id = ? AND r.hostel_id = ?\`,
      [user.id, hostelId]
    );
    return rows.length > 0;
  }`;

    const newHostelAccess = `  if (user.role === 'STUDENT') {
    const targetTerm = (user.username || user.rollNo || user.id || '').toString().trim();
    const searchPattern = '%' + (user.email || targetTerm) + '%';
    const [rows] = await db.pool.query(
      \`SELECT s.id FROM students s
       LEFT JOIN beds b ON s.bed_id = b.id
       LEFT JOIN rooms r ON b.room_id = r.id
       WHERE (s.user_id = ? OR s.roll_number = ? OR s.student_id = ? OR LOWER(s.email) = LOWER(?) OR LOWER(s.email) LIKE LOWER(?))
         AND (r.hostel_id = ? OR s.hostel_id = ?)\`,
      [user.id, targetTerm, targetTerm, user.email || targetTerm, searchPattern, hostelId, hostelId]
    );
    return rows.length > 0;
  }`;

    if (content.includes(oldStudentAccess)) {
        content = content.replace(oldStudentAccess, newStudentAccess);
        console.log('Patched student access in:', p);
    } else {
        console.log('Could not find exact oldStudentAccess in:', p);
    }

    if (content.includes(oldHostelAccess)) {
        content = content.replace(oldHostelAccess, newHostelAccess);
        console.log('Patched hostel access in:', p);
    } else {
        console.log('Could not find exact oldHostelAccess in:', p);
    }

    fs.writeFileSync(p, content, 'utf8');
}

console.log('Authorization patch complete.');
