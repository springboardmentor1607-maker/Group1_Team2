const { pool } = require('./config/db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration: Adding state column...');
        
        // Add state to users
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
        `);
        console.log('Added state column to users table.');

        // Add state to zones
        await pool.query(`
            ALTER TABLE zones ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT '';
        `);
        console.log('Added state column to zones table.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
