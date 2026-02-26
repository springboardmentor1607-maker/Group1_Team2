const { pool } = require('../config/db');

const User = {

    async create({ name, email, password, location, role, profile_photo, phone }) {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, location, role, profile_photo, phone)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [name, email, password, location || '', role || 'citizen', profile_photo || '', phone || '']
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

    async updateProfile(id, { name, email, phone, location }) {
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email), 
                 phone = COALESCE($3, phone),
                 location = COALESCE($4, location),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 
             RETURNING *`,
            [name, email, phone, location, id]
        );

        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(`SELECT * FROM users`);
        return result.rows;
    }

};

module.exports = User;
