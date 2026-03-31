import { pool } from './backend/config/db.js';

async function checkComplaint() {
    try {
        const res = await pool.query('SELECT id, photo, volunteer_photo FROM complaints WHERE id = 27');
        console.log('Complaint #27 Data:');
        console.log(JSON.stringify(res.rows[0], null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkComplaint();
