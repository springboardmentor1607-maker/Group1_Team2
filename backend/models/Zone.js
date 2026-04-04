const { pool } = require('../config/db');

const Zone = {
    normalizeName(name) {
        if (!name) return '';
        return name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },

    async create({ name, state, description }) {
        const normalizedName = this.normalizeName(name);
        const normalizedState = this.normalizeName(state);
        const result = await pool.query(
            `INSERT INTO zones (name, state, description)
             VALUES ($1, $2, $3) RETURNING *`,
            [normalizedName, normalizedState, description]
        );
        return result.rows[0];
    },

    async findAll(state = null) {
        let query = `
            SELECT z.*, 
                   COUNT(c.id) FILTER (WHERE LOWER(c.status) != 'resolved' OR c.status IS NULL) as active_complaints_count
            FROM zones z
            LEFT JOIN complaints c ON z.id = c.zone_id
        `;
        let params = [];
        
        if (state && state !== 'All') {
            query += ` WHERE z.state = $1`;
            params.push(state);
        }
        
        query += ` GROUP BY z.id ORDER BY z.name ASC`;
        
        const result = await pool.query(query, params);
        return result.rows.map(zone => {
            const count = parseInt(zone.active_complaints_count || 0);
            let status = 'green';
            if (count >= 5) status = 'red';
            else if (count >= 2) status = 'yellow';
            return { ...zone, status, active_complaints_count: count };
        });
    },

    async findById(id) {
        const result = await pool.query(`SELECT * FROM zones WHERE id = $1`, [id]);
        return result.rows[0];
    },

    async findByName(name, state = null) {
        if (!name) return null;
        let query = `SELECT * FROM zones WHERE LOWER(name) = LOWER($1)`;
        let params = [name];
        
        if (state) {
            query += ` AND LOWER(state) = LOWER($2)`;
            params.push(state);
        }
        
        const result = await pool.query(query, params);
        return result.rows[0];
    },

    async findOrCreateByName(name, state = null) {
        if (!name) return null;
        
        let zone = await this.findByName(name, state);
        if (!zone) {
            zone = await this.create({ 
                name, 
                state, 
                description: `Automatically created for location: ${name}${state ? ', ' + state : ''}` 
            });
        }
        return zone;
    },

    async update(id, { name, state, description }) {
        const normalizedName = name ? this.normalizeName(name) : null;
        const normalizedState = state ? this.normalizeName(state) : null;
        const result = await pool.query(
            `UPDATE zones 
             SET name = COALESCE($1, name),
                 state = COALESCE($2, state),
                 description = COALESCE($3, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 
             RETURNING *`,
            [normalizedName, normalizedState, description, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query(`DELETE FROM zones WHERE id = $1`, [id]);
        return result.rowCount > 0;
    },

    async findRecent(limit = 10) {
        const result = await pool.query(
            `SELECT id, name, state, created_at 
             FROM zones 
             ORDER BY created_at DESC 
             LIMIT $1`,
            [limit]
        );
        return result.rows;
    }
};


module.exports = Zone;
