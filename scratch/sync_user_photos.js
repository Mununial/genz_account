const mysql = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/mysql2/promise');

async function syncUserPhotos() {
  const conn = await mysql.createConnection({
    host: 'srv1334.hstgr.io',
    user: 'u847513759_ERP_COLLEGE',
    password: 'Ayushtech@26',
    database: 'u847513759_ERP_COLLEGE',
    port: 3306
  });

  const [res1] = await conn.query(`
    UPDATE users u
    JOIN students s ON (s.user_id = u.id OR s.roll_number = u.username OR s.email = u.email)
    SET u.photo_url = s.photo_url
    WHERE (u.photo_url IS NULL OR u.photo_url = '' OR u.photo_url = 'N/A')
      AND s.photo_url IS NOT NULL AND s.photo_url != '' AND s.photo_url != 'N/A'
  `);
  console.log('Synchronized student photos to users table: changed', res1.changedRows, 'matched', res1.matchedRows);

  const [res2] = await conn.query(`
    UPDATE students s
    JOIN users u ON (s.user_id = u.id OR s.roll_number = u.username OR s.email = u.email)
    SET s.photo_url = u.photo_url
    WHERE (s.photo_url IS NULL OR s.photo_url = '' OR s.photo_url = 'N/A')
      AND u.photo_url IS NOT NULL AND u.photo_url != '' AND u.photo_url != 'N/A'
  `);
  console.log('Synchronized user photos to students table: changed', res2.changedRows, 'matched', res2.matchedRows);

  // Sync to student_face_data as well so face recognition doesn't fallback!
  const [res3] = await conn.query(`
    INSERT INTO student_face_data (student_id, roll_number, status, photo_url, registration_date)
    SELECT s.id, s.roll_number, 'REGISTERED', s.photo_url, NOW()
    FROM students s
    WHERE s.photo_url IS NOT NULL AND s.photo_url != '' AND s.photo_url != 'N/A'
    ON DUPLICATE KEY UPDATE photo_url = VALUES(photo_url), status = 'REGISTERED'
  `);
  console.log('Synchronized student_face_data photos:', res3.affectedRows);

  await conn.end();
}

syncUserPhotos().catch(console.error);
