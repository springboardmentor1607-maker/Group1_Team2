const { pool } = require('./config/db');
require('dotenv').config();

async function checkTables() {
    try {
        console.log('📊 Checking database structure...\n');

        // Check users table
        const usersInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('👥 USERS TABLE:');
        usersInfo.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });

        // Check complaints table
        const complaintsInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'complaints'
            ORDER BY ordinal_position
        `);

        console.log('\n📝 COMPLAINTS TABLE:');
        complaintsInfo.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });

        // Check sample data
        const sampleComplaint = await pool.query('SELECT * FROM complaints LIMIT 1');
        if (sampleComplaint.rows.length > 0) {
            console.log('\n📋 Sample Complaint:');
            console.log(JSON.stringify(sampleComplaint.rows[0], null, 2));
        }

        const sampleUser = await pool.query('SELECT id, name, email, role FROM users LIMIT 1');
        if (sampleUser.rows.length > 0) {
            console.log('\n👤 Sample User:');
            console.log(JSON.stringify(sampleUser.rows[0], null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTables();