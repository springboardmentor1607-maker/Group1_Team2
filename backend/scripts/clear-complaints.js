const { pool } = require('../config/db');

async function clearComplaints() {
    try {
        console.log('Clearing all complaints...');
        await pool.query('TRUNCATE table complaints RESTART IDENTITY CASCADE');
        console.log('Successfully cleared all complaints.');
        process.exit(0);
    } catch (e) {
        console.error('Error clearing complaints:', e);
        process.exit(1);
    }
}

clearComplaints();
