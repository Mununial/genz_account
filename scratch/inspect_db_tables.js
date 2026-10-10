const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const mysql = require('mysql2/promise');

async function inspect() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'srv1334.hstgr.io',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'u847513759_erp_account',
        password: process.env.DB_PASSWORD || 'Ayushtech@26',
        database: process.env.DB_NAME || 'u847513759_acccount'
    });

    console.log('Connected to database:', process.env.DB_NAME);
    const [tables] = await conn.query("SHOW TABLES LIKE '%pass%'");
    console.log('Pass related tables:', tables);

    const [allTables] = await conn.query("SHOW TABLES");
    console.log('Total tables count:', allTables.length);
    console.log('Tables:', allTables.map(t => Object.values(t)[0]));

    await conn.end();
}

inspect().catch(err => {
    console.error('Inspect error:', err.message);
});
