const { pool } = require('../config/db');

class Notification {
    static async create({ user_id, type, title, message, complaint_id }) {
        const query = `
            INSERT INTO notifications (user_id, type, title, message, complaint_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user_id, type, title, message, complaint_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async findByUserId(user_id, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await pool.query(query, [user_id, limit, offset]);
        return rows;
    }

    static async getUnreadCount(user_id) {
        const query = `
            SELECT COUNT(*) FROM notifications
            WHERE user_id = $1 AND is_read = FALSE
        `;
        const { rows } = await pool.query(query, [user_id]);
        return parseInt(rows[0].count);
    }

    static async markAsRead(notification_id, user_id) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [notification_id, user_id]);
        return rows[0];
    }

    static async markAllAsRead(user_id) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING *
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows;
    }

    static async delete(notification_id, user_id) {
        const query = `
            DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [notification_id, user_id]);
        return rows.length > 0;
    }

    static async deleteAll(user_id) {
        const query = `
            DELETE FROM notifications
            WHERE user_id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [user_id]);
        return rows.length > 0;
    }
}

module.exports = Notification;
