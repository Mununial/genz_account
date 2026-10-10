const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function seedMealPreferences() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log('Seeding meal attendance for tomorrow:', tomorrowStr);

  // Check if already seeded
  const [existing] = await db.pool.query('SELECT count(*) as count FROM meal_attendance WHERE meal_date = ?', [tomorrowStr]);
  if (existing[0].count > 50) {
    console.log('Meal attendance already seeded for tomorrow (' + existing[0].count + ' records).');
    process.exit(0);
  }

  // Get active students in hostels
  const [students] = await db.pool.query('SELECT id, student_id, roll_number, hostel_id FROM students WHERE hostel_id IS NOT NULL LIMIT 200');
  console.log('Found hostel students:', students.length);

  const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  
  // Seed preferences for each student
  let inserted = 0;
  for (const s of students) {
    const studentIdentifier = s.id || s.student_id || s.roll_number;
    const hostelId = s.hostel_id || 1;

    for (const mt of mealTypes) {
      // 80% taking, 20% opt-out
      const isTaking = Math.random() > 0.20 ? 'TAKING' : 'NOT_TAKING';
      await db.pool.query(`
        INSERT INTO meal_attendance (student_id, hostel_id, meal_date, meal_type, status, marked_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE status = VALUES(status), marked_at = NOW()
      `, [studentIdentifier, hostelId, tomorrowStr, mt, isTaking]);
      inserted++;
    }
  }

  // Also ensure menu items exist for tomorrow's date
  for (let hid = 1; hid <= 2; hid++) {
    const menus = [
      [hid, tomorrowStr, 'BREAKFAST', 'Aloo Paratha, Curd & Pickle', 'Crisp whole wheat aloo parathas served with fresh spiced curd, mixed pickle and hot tea', 1],
      [hid, tomorrowStr, 'LUNCH', 'Basmati Rice, Dal Makhani & Paneer/Chicken', 'Fragrant basmati rice, slow-cooked dal makhani, shahi paneer or chicken curry, salad & papad', 1],
      [hid, tomorrowStr, 'SNACKS', 'Vegetable Samosa & Masala Chai', 'Crispy potato-stuffed samosas with mint and tamarind chutneys', 1],
      [hid, tomorrowStr, 'DINNER', 'Tandoori Roti, Jeera Rice & Mix Veg Tadka', 'Fresh tandoori rotis, aromatic jeera rice, yellow dal tadka, seasonal mix veg and gulab jamun', 1]
    ];

    for (const m of menus) {
      await db.pool.query(`
        INSERT INTO mess_menus (hostel_id, menu_date, meal_type, meal_name, description, is_available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE meal_name = VALUES(meal_name), description = VALUES(description)
      `, m);
    }
  }

  console.log(`Seeded ${inserted} meal attendance entries and menus for tomorrow (${tomorrowStr}) successfully!`);
  process.exit(0);
}

seedMealPreferences().catch(err => {
  console.error('Error seeding meal preferences:', err);
  process.exit(1);
});
