const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()'); // test connection
        console.log('PostgreSQL Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };