const { pool } = require('../config/db');

const Complaint = {
    async create({ user_id, title, type, priority, address, landmark, description, latitude, longitude }) {
        const result = await pool.query(
            `INSERT INTO complaints (user_id, title, type, priority, address, landmark, description, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [user_id, title, type, priority, address, landmark, description, latitude, longitude]
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(`
            SELECT * FROM complaints 
            ORDER BY 
                CASE 
                    WHEN priority = 'Critical' THEN 1
                    WHEN priority = 'High' THEN 2
                    WHEN priority = 'Medium' THEN 3
                    WHEN priority = 'Low' THEN 4
                    ELSE 5
                END ASC,
                created_at DESC
        `);
        return result.rows;
    },

    async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'Pending' OR status IS NULL OR status = '') as pending,
                COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
                COUNT(*) FILTER (WHERE status = 'Resolved') as resolved
            FROM complaints
        `);
        return result.rows[0];
    },

    async getRecent(limit = 5) {
        const result = await pool.query(`
            SELECT * FROM complaints 
            ORDER BY created_at DESC 
            LIMIT $1
        `, [limit]);
        return result.rows;
    }
};

module.exports = Complaint;
