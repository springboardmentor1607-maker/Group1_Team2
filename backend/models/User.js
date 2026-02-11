const { pool } = require('../config/db');

const User = {

    async create({ name, email, password, location, role, profile_photo }) {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, location, role, profile_photo)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [name, email, password, location || '', role || 'citizen', profile_photo || '']
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

    async findAll() {
        const result = await pool.query(`SELECT * FROM users`);
        return result.rows;
    }

};

module.exports = User;
