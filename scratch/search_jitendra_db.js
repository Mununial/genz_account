const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function searchJitendra() {
  const [tables] = await db.pool.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  for (const t of tableNames) {
    try {
      const [rows] = await db.pool.query(`SELECT * FROM ${t} WHERE CONVERT(CONCAT_WS(' ', ${t}.*) USING utf8) LIKE '%jitendra%'`);
      if (rows.length > 0) {
        rows.forEach(r => {
          const s = JSON.stringify(r);
          if (s.includes('2301316095') || s.toLowerCase().includes('jitendra nial')) {
            console.log(`=== Table ${t} ===`);
            console.log(JSON.stringify(r, null, 2));
          }
        });
      }
    } catch(e) {}
  }
  process.exit(0);
}
searchJitendra().catch(e => { console.error(e); process.exit(1); });
