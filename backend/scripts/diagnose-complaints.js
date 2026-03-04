const { pool } = require('../config/db');

async function diagnose() {
    try {
        const result = await pool.query('SELECT status, COUNT(*) FROM complaints GROUP BY status');
        console.log('--- STATUS DISTRIBUTION ---');
        console.log(result.rows);

        const all = await pool.query('SELECT id, title, status FROM complaints');
        console.log('--- ALL COMPLAINTS ---');
        console.log(all.rows);
    } catch (e) {
        console.error('Diagnosis error:', e);
    }
}

diagnose();
