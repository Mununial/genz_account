const db = require('c:/Users/munun/Downloads/COLLEGE ERP/COLLEGE ERP/Hostel Management/backend/src/config/db');

async function test() {
  const [rows] = await db.pool.query('DESCRIBE visits');
  rows.filter(r => r.Field.includes('check')).forEach(r => console.log(r.Field, '-->', r.Type));
  process.exit(0);
}

test();
