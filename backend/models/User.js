const { pool } = require('../config/db');

const User = {
    normalizeName(name) {
        if (!name) return '';
        return name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },

    async create({ name, email, password, location, state, role, profile_photo, phone }) {
        const normalizedLocation = this.normalizeName(location);
        const normalizedState = this.normalizeName(state);
        const result = await pool.query(
            `INSERT INTO users (name, email, password, location, state, role, profile_photo, phone)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [name, email, password, normalizedLocation, normalizedState, role || 'citizen', profile_photo || '', phone || '']
        );

        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query(
            `SELECT * FROM users WHERE email=$1`,
            [email]
        );

        return result.rows[0];
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT * FROM users WHERE id=$1`,
            [id]
        );

        return result.rows[0];
    },

    async updateProfile(id, { name, email, phone, location, state }) {
        const normalizedLocation = location ? this.normalizeName(location) : null;
        const normalizedState = state ? this.normalizeName(state) : null;
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone),
                 location = COALESCE($4, location),
                 state = COALESCE($5, state),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 
             RETURNING *`,
            [name, email, phone, normalizedLocation, normalizedState, id]
        );

        return result.rows[0];
    },
    async findAll() {
        const result = await pool.query(`SELECT * FROM users`);
        return result.rows;
    },
    async findAdmins() {
        const result = await pool.query(`SELECT id FROM users WHERE role='admin'`);
        return result.rows;
    },

    async updateRole(id, role) {
        const result = await pool.query(
            `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [role, id]
        );
        return result.rows[0];
    },

    async updateByAdmin(id, { name, email, phone, location, state, role }) {
        const normalizedLocation = location ? this.normalizeName(location) : null;
        const normalizedState = state ? this.normalizeName(state) : null;
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone),
                 location = COALESCE($4, location),
                 state = COALESCE($5, state),
                 role = COALESCE($6, role),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 
             RETURNING *`,
            [name, email, phone, normalizedLocation, normalizedState, role, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
        return result.rowCount > 0;
    },

    async getStats() {
        const result = await pool.query(
            `SELECT 
                COUNT(*) FILTER (WHERE role = 'volunteer') as volunteers_count,
                COUNT(*) FILTER (WHERE role = 'citizen') as citizens_count,
                COUNT(*) as total_users
             FROM users`
        );
        return result.rows[0];
    }
};

module.exports = User;
