const { pool } = require('../config/db');

const Complaint = {

    async create({ user_id, title, description, photo, location_coords, address }) {
        const result = await pool.query(
            `INSERT INTO complaints (user_id, title, description, photo, location_coords, address, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, title, description, photo || '', location_coords || '', address, 'received']
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name, u.email as user_email, 
                    v.name as assigned_volunteer_name, v.email as assigned_volunteer_email
             FROM complaints c
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN users v ON c.assigned_to = v.id
             ORDER BY c.created_at DESC`
        );
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name, u.email as user_email,
                    v.name as assigned_volunteer_name, v.email as assigned_volunteer_email
             FROM complaints c
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN users v ON c.assigned_to = v.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    },

    async findByUserId(user_id) {
        const result = await pool.query(
            `SELECT c.*, v.name as assigned_volunteer_name, v.email as assigned_volunteer_email
             FROM complaints c
             LEFT JOIN users v ON c.assigned_to = v.id
             WHERE c.user_id = $1
             ORDER BY c.created_at DESC`,
            [user_id]
        );
        return result.rows;
    },

    async assignToVolunteer(complaint_id, volunteer_id) {
        const result = await pool.query(
            `UPDATE complaints 
             SET assigned_to = $1, status = 'in_review', updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 
             RETURNING *`,
            [volunteer_id, complaint_id]
        );
        return result.rows[0];
    },

    async updateStatus(complaint_id, status, volunteer_id = null) {
        let query, params;
        
        if (volunteer_id) {
            query = `UPDATE complaints 
                     SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3 
                     RETURNING *`;
            params = [status, volunteer_id, complaint_id];
        } else {
            query = `UPDATE complaints 
                     SET status = $1, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2 
                     RETURNING *`;
            params = [status, complaint_id];
        }
        
        const result = await pool.query(query, params);
        return result.rows[0];
    },

    async findByVolunteerId(volunteer_id) {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name, u.email as user_email
             FROM complaints c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.assigned_to = $1
             ORDER BY c.created_at DESC`,
            [volunteer_id]
        );
        return result.rows;
    },

    async getComplaintStats() {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status = 'received' THEN 1 END) as received,
                COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
             FROM complaints`
        );
        return result.rows[0];
    }

};

module.exports = Complaint;