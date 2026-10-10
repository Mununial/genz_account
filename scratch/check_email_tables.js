const mysql = require('c:/Users/munun/OneDrive/Desktop/genz_account/backend/node_modules/mysql2/promise');

async function checkTemplates() {
  const conn = await mysql.createConnection({
    host: 'srv1334.hstgr.io',
    user: 'u847513759_ERP_COLLEGE',
    password: 'Ayushtech@26',
    database: 'u847513759_ERP_COLLEGE',
    port: 3306
  });

  const [tables] = await conn.query("SHOW TABLES LIKE '%email%'");
  console.log('Email tables:', tables);

  try {
    const [templates] = await conn.query('SELECT * FROM email_templates');
    console.log('Email templates in DB:', templates);
  } catch(e) {
    console.log('email_templates error:', e.message);
  }

  try {
    const [logs] = await conn.query('SELECT * FROM email_logs ORDER BY id DESC LIMIT 5');
    console.log('Recent email logs:', logs);
  } catch(e) {}

  await conn.end();
}

checkTemplates().catch(console.error);
