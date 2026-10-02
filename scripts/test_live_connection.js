const path = require('path');
const mysql = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mysql2', 'promise'));
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function testLive() {
  console.log('Testing connection to Hostinger MySQL:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    });

    console.log('✓ SUCCESS: Connected to Hostinger MySQL database!');
    const [rows] = await conn.query('SELECT 1 + 1 AS result, NOW() as server_time, VERSION() as version');
    console.log('Server time:', rows[0].server_time);
    console.log('MySQL version:', rows[0].version);

    const [tables] = await conn.query('SHOW TABLES');
    console.log(`Existing tables in database: ${tables.length}`);
    tables.forEach(t => console.log('  -', Object.values(t)[0]));

    await conn.end();
    return true;
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    if (process.env.DB_HOST === 'srv1334.hstgr.io') {
      console.log('\nRetrying with IP 193.203.184.64...');
      try {
        const conn2 = await mysql.createConnection({
          host: '193.203.184.64',
          port: 3306,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          connectTimeout: 10000
        });
        console.log('✓ SUCCESS with IP 193.203.184.64!');
        await conn2.end();
        return true;
      } catch (e2) {
        console.error('✗ IP Connection also failed:', e2.message);
      }
    }
    return false;
  }
}

testLive();
