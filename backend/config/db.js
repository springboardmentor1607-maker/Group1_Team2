const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()'); // test connection
        console.log('PostgreSQL Connected...');

        // Auto-migration
        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                title VARCHAR(255) NOT NULL,
                type VARCHAR(100) NOT NULL,
                priority VARCHAR(50) NOT NULL,
                address TEXT NOT NULL,
                landmark TEXT,
                description TEXT NOT NULL,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration for existing tables: ensures 'type' column and others exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='type') THEN
                    ALTER TABLE complaints ADD COLUMN type VARCHAR(100) NOT NULL DEFAULT 'Other';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='priority') THEN
                    ALTER TABLE complaints ADD COLUMN priority VARCHAR(50) NOT NULL DEFAULT 'Medium';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='landmark') THEN
                    ALTER TABLE complaints ADD COLUMN landmark TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='photo') THEN
                    ALTER TABLE complaints ADD COLUMN photo TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='assigned_to') THEN
                    ALTER TABLE complaints ADD COLUMN assigned_to VARCHAR(255);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='latitude') THEN
                    ALTER TABLE complaints ADD COLUMN latitude DECIMAL(10, 8);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='longitude') THEN
                    ALTER TABLE complaints ADD COLUMN longitude DECIMAL(11, 8);
                END IF;

                -- Fix NULL statuses to 'Pending'
                UPDATE complaints SET status = 'Pending' WHERE status IS NULL;
            END $$;
        `);
        console.log('Complaints table and columns verified.');
    } catch (err) {
        console.error('Database Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };