/**
 * Subject Registration Module — Migration Runner
 * GEN-Z UNIVERSITY (GZU) Accounts System
 * Run: node database/run_migration.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

async function runMigration() {
  console.log('================================================================');
  console.log('GENZ — SUBJECT REGISTRATION MODULE MIGRATION RUNNER');
  console.log('================================================================\n');

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'genz_accounts_db';

  console.log(`Connecting to ${host}:${port}/${database}...`);
  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
    console.log('Connected.\n');
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migration_subject_registration.sql'), 'utf8');
    console.log('Running migration_subject_registration.sql...');
    const results = await conn.query(sql);
    console.log('\n[OK] Migration completed successfully!');
    console.log('\nNew credentials:');
    console.log('  HOD:      hod.cse@bec.ac.in  / Admin@BEC2026!');
    console.log('  Director: director@bec.ac.in  / Admin@BEC2026!');
  } catch (err) {
    console.error('\n[ERROR] Migration failed:', err.message);
    if (err.sqlMessage) console.error('SQL Error:', err.sqlMessage);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

runMigration();
