const { pool, connectDB } = require('./config/db');
require('dotenv').config();

async function runMigration() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Adding google_id and making password nullable...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
            ALTER COLUMN password DROP NOT NULL;
        `);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
