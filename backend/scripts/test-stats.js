const { pool } = require('../config/db');
const Complaint = require('../models/Complaint');

async function test() {
    try {
        console.log('Adding test complaint with user_id 10...');
        await Complaint.create({
            user_id: 10,
            title: 'Test Pending Issue',
            type: 'garbage',
            priority: 'High',
            address: '123 Test St',
            description: 'Test description',
            latitude: 10.8505,
            longitude: 76.2711
        });

        console.log('Fetching stats...');
        const stats = await Complaint.getStats();
        console.log('STATS:', stats);

        process.exit(0);
    } catch (e) {
        console.error('Test error:', e);
        process.exit(1);
    }
}

test();
