const { pool } = require('../config/db');
const Complaint = require('../models/Complaint');

async function testSort() {
    try {
        console.log('Clearing existing complaints...');
        await pool.query('TRUNCATE table complaints RESTART IDENTITY CASCADE');

        const priorities = ['Low', 'Critical', 'Medium', 'High'];
        for (const p of priorities) {
            console.log(`Adding ${p} priority complaint...`);
            await Complaint.create({
                user_id: 10,
                title: `${p} Issue`,
                type: 'other',
                priority: p,
                address: 'Test Address',
                description: 'Test Description',
                latitude: 10.8505,
                longitude: 76.2711
            });
        }

        console.log('Fetching sorted complaints...');
        const sorted = await Complaint.findAll();
        console.log('--- SORTED RESULTS ---');
        sorted.forEach(c => console.log(`${c.priority}: ${c.title}`));

        process.exit(0);
    } catch (e) {
        console.error('Test error:', e);
        process.exit(1);
    }
}

testSort();
