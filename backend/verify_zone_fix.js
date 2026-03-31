const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verify() {
  try {
    const userRes = await pool.query('SELECT id FROM users WHERE role = \'citizen\' LIMIT 1');
    const zoneRes = await pool.query('SELECT id FROM zones LIMIT 1');
    
    if (userRes.rowCount === 0 || zoneRes.rowCount === 0) {
      console.log('Setup missing: Need at least one citizen and one zone.');
      return;
    }

    const userId = userRes.rows[0].id;
    const zoneId = zoneRes.rows[0].id;
    const testTitle = 'Verification Test ' + Date.now();

    console.log(`Testing creation with ZoneId: ${zoneId}`);

    // Call the model method directly (this was already working, but good to check)
    const { create } = require('./models/Complaint');
    const Complaint = require('./models/Complaint');

    const result = await Complaint.create({
      user_id: userId,
      title: testTitle,
      type: 'other',
      priority: 'Low',
      address: 'Test Address',
      landmark: 'Test Landmark',
      description: 'Test Description',
      latitude: 0,
      longitude: 0,
      photo: '',
      zone_id: zoneId
    });

    console.log('Created complaint ID:', result.id, 'with zone_id:', result.zone_id);

    if (result.zone_id == zoneId) {
      console.log('SUCCESS: Model correctly saved zone_id.');
    } else {
      console.log('FAILURE: Model did not save zone_id.');
    }

    // Clean up
    await pool.query('DELETE FROM complaints WHERE id = $1', [result.id]);
    console.log('Cleanup: Test record deleted.');

  } catch (err) {
    console.error('Verification Error:', err);
  } finally {
    await pool.end();
  }
}

verify();
