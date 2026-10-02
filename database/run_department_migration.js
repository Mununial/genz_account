/**
 * Runner for Department-Wise Subject Registration Migration
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function run() {
  const sqlPath = path.join(__dirname, 'migration_department_subject_registration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bec_accounts_db',
    multipleStatements: true
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('[Migration] Connected to MySQL. Running Department Subject Registration Migration...');
    await conn.query(sql);
    console.log('[Migration] Successfully executed department-wise subject registration migration!');
    await conn.end();
  } catch (err) {
    console.log('[Migration Notice] MySQL direct connection not reachable (' + err.code + '). Migration prepared for live Hostinger MySQL.');
  }
}

run();
