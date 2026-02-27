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
    },

    async assignVolunteer(complaintId, volunteerId) {
        const result = await pool.query(
            `UPDATE complaints 
             SET assigned_to = $1, status = 'In Progress', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [volunteerId, complaintId]
        );
        return result.rows[0];
    },

    async updateStatus(complaintId, status) {
        const result = await pool.query(
            `UPDATE complaints 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, complaintId]
        );
        return result.rows[0];
    },

    async findAllWithDetails() {
        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            ORDER BY 
                CASE 
                    WHEN c.priority = 'Critical' THEN 1
                    WHEN c.priority = 'High' THEN 2
                    WHEN c.priority = 'Medium' THEN 3
                    WHEN c.priority = 'Low' THEN 4
                    ELSE 5
                END ASC,
                c.created_at DESC
        `);
        return result.rows;
    },

    async findByUserIdWithDetails(userId) {
        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `, [userId]);
        return result.rows;
    },

    async findByVolunteerId(volunteerId) {
        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email, u.phone as user_phone,
                   v.name as volunteer_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            WHERE c.assigned_to = $1
            ORDER BY 
                CASE 
                    WHEN c.status = 'In Progress' THEN 1
                    WHEN c.status = 'Pending' THEN 2
                    WHEN c.status = 'Resolved' THEN 3
                    ELSE 4
                END ASC,
                CASE 
                    WHEN c.priority = 'Critical' THEN 1
                    WHEN c.priority = 'High' THEN 2
                    WHEN c.priority = 'Medium' THEN 3
                    WHEN c.priority = 'Low' THEN 4
                    ELSE 5
                END ASC,
                c.created_at DESC
        `, [volunteerId]);
        return result.rows;
    }
};

module.exports = Complaint;
