const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [users] = await conn.query('SELECT id, email, role_id FROM users WHERE id <= 30');
  console.log('Seed users in live DB:');
  console.table(users);

  const [roles] = await conn.query('SELECT id, name FROM roles');
  console.log('Roles in live DB:');
  console.table(roles);

  await conn.end();
}

check();
