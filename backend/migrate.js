const { pool, connectDB } = require('./config/db');
require('dotenv').config();

async function runMigrations() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Creating users table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                location TEXT,
                role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'volunteer', 'admin')),
                profile_photo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating complaints table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                photo TEXT,
                location_coords TEXT,
                address TEXT NOT NULL,
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'in_review', 'resolved')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating indexes...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

        console.log('Creating notifications table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)');

        console.log('Migration completed successfully!');
        
        // Show table info
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const complaintCount = await pool.query('SELECT COUNT(*) FROM complaints');
        
        console.log(`Users table: ${userCount.rows[0].count} records`);
        console.log(`Complaints table: ${complaintCount.rows[0].count} records`);
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();