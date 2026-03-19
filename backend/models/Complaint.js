const { pool } = require('../config/db');

const Complaint = {
    async create({ user_id, title, type, priority, address, landmark, description, latitude, longitude, photo }) {
        const result = await pool.query(
            `INSERT INTO complaints (user_id, title, type, priority, address, landmark, description, latitude, longitude, photo, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pending') RETURNING *`,
            [user_id, title, type, priority, address, landmark, description, latitude, longitude, photo]
        );
        return result.rows[0];
    },

    async findAll(currentUserId = null, limit = 10, offset = 0) {
        return this.findAllWithDetails(currentUserId, limit, offset);
    },

    async getStats() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE LOWER(status) = 'pending' OR status IS NULL OR status = '') as pending,
                COUNT(*) FILTER (WHERE LOWER(status) = 'in progress' OR LOWER(status) = 'in_progress') as in_progress,
                COUNT(*) FILTER (WHERE LOWER(status) = 'resolved') as resolved
            FROM complaints
        `);
        return result.rows[0];
    },

    async getRecent(limit = 5) {
        // Optimization: Explicitly select columns and EXCLUDE photo to reduce payload size
        const result = await pool.query(`
            SELECT id, user_id, title, type, priority, address, landmark, status, created_at, updated_at 
            FROM complaints 
            ORDER BY created_at DESC 
            LIMIT $1
        `, [limit]);
        return result.rows;
    },

    async getWeeklyStats() {
        const result = await pool.query(`
            WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date AS day
            )
            SELECT 
                TO_CHAR(days.day, 'Dy') as day,
                COUNT(c.id)::int as complaints
            FROM days
            LEFT JOIN complaints c ON DATE(c.created_at) = days.day
            GROUP BY days.day
            ORDER BY days.day ASC
        `);
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

    async updateStatus(complaintId, status, volunteerPhoto = null) {
        // Normalize status
        let normalizedStatus = status;
        if (status.toLowerCase() === 'pending') normalizedStatus = 'Pending';
        else if (status.toLowerCase() === 'in progress' || status.toLowerCase() === 'in_progress') normalizedStatus = 'In Progress';
        else if (status.toLowerCase() === 'resolved') normalizedStatus = 'Resolved';

        let query = `UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP`;
        let params = [normalizedStatus];
        let paramIndex = 2;

        if (volunteerPhoto !== undefined && volunteerPhoto !== null) {
            query += `, volunteer_photo = $${paramIndex}`;
            params.push(volunteerPhoto);
            paramIndex++;
        }

        query += ` WHERE id = $${paramIndex} RETURNING *`;
        params.push(complaintId);

        const result = await pool.query(query, params);
        return result.rows[0];
    },

    async findAllWithDetails(currentUserId = null, limit = 10, offset = 0) {
        let userVoteSelect = '';
        let userVoteJoin = '';
        let params = [];
        let paramIndex = 1;

        if (currentUserId) {
            userVoteSelect = `, v_user.vote_type as user_vote_type`;
            userVoteJoin = `LEFT JOIN votes v_user ON c.id = v_user.complaint_id AND v_user.user_id = $${paramIndex}`;
            params.push(currentUserId);
            paramIndex++;
        }

        const queryParams = [...params, limit, offset];
        const limitIndex = paramIndex;
        const offsetIndex = paramIndex + 1;

        const result = await pool.query(`
            SELECT c.id, c.user_id, c.title, c.type, c.priority, c.address, c.landmark, c.description, 
                   c.latitude, c.longitude, c.status, c.created_at, c.updated_at, c.assigned_to,
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email,
                   COALESCE(vote_counts.upvotes_count, 0)::int as upvotes_count,
                   COALESCE(vote_counts.downvotes_count, 0)::int as downvotes_count,
                   COALESCE(comment_counts.total_comments, 0)::int as comments_count,
                   c.photo, c.volunteer_photo,
                   (c.photo IS NOT NULL AND c.photo != '') as has_photo,
                   (c.volunteer_photo IS NOT NULL AND c.volunteer_photo != '') as has_volunteer_photo
                   ${userVoteSelect}
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            LEFT JOIN (
                SELECT complaint_id, 
                       COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                       COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                FROM votes GROUP BY complaint_id
            ) vote_counts ON c.id = vote_counts.complaint_id
            LEFT JOIN (SELECT complaint_id, COUNT(*) as total_comments FROM comments GROUP BY complaint_id) comment_counts ON c.id = comment_counts.complaint_id
            ${userVoteJoin}
            ORDER BY 
                c.created_at DESC,
                CASE 
                    WHEN LOWER(c.priority) = 'critical' THEN 1
                    WHEN LOWER(c.priority) = 'high' THEN 2
                    WHEN LOWER(c.priority) = 'medium' THEN 3
                    WHEN LOWER(c.priority) = 'low' THEN 4
                    ELSE 5
                END ASC
            LIMIT $${limitIndex} OFFSET $${offsetIndex}
        `, queryParams);
        return result.rows;
    },

    async getCount() {
        const result = await pool.query('SELECT COUNT(*) FROM complaints');
        return parseInt(result.rows[0].count);
    },

    async getCountByUserId(userId) {
        const result = await pool.query('SELECT COUNT(*) FROM complaints WHERE user_id = $1', [userId]);
        return parseInt(result.rows[0].count);
    },

    async findByUserIdWithDetails(userId, limit = 10, offset = 0) {
        const result = await pool.query(`
            SELECT c.id, c.user_id, c.title, c.type, c.priority, c.address, c.landmark, c.description, 
                   c.latitude, c.longitude, c.status, c.created_at, c.updated_at, c.assigned_to,
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email,
                   COALESCE(vote_counts.upvotes_count, 0)::int as upvotes_count,
                   COALESCE(vote_counts.downvotes_count, 0)::int as downvotes_count,
                   COALESCE(comment_counts.total_comments, 0)::int as comments_count,
                   v_user.vote_type as user_vote_type,
                   c.photo, c.volunteer_photo,
                   (c.photo IS NOT NULL AND c.photo != '') as has_photo,
                   (c.volunteer_photo IS NOT NULL AND c.volunteer_photo != '') as has_volunteer_photo
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            LEFT JOIN (
                SELECT complaint_id, 
                       COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                       COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                FROM votes GROUP BY complaint_id
            ) vote_counts ON c.id = vote_counts.complaint_id
            LEFT JOIN (SELECT complaint_id, COUNT(*) as total_comments FROM comments GROUP BY complaint_id) comment_counts ON c.id = comment_counts.complaint_id
            LEFT JOIN votes v_user ON c.id = v_user.complaint_id AND v_user.user_id = $1
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);
        return result.rows;
    },

    async getPhoto(complaintId) {
        const result = await pool.query('SELECT photo, volunteer_photo FROM complaints WHERE id = $1', [complaintId]);
        return result.rows[0];
    },

    async findByVolunteerId(volunteerId) {
        const result = await pool.query(`
            SELECT c.id, c.user_id, c.title, c.type, c.priority, c.address, c.landmark, c.description, 
                   c.latitude, c.longitude, c.status, c.created_at, c.updated_at, c.assigned_to,
                   u.name as user_name, u.email as user_email, u.phone as user_phone,
                   v.name as volunteer_name,
                   c.photo, c.volunteer_photo,
                   (c.photo IS NOT NULL AND c.photo != '') as has_photo,
                   (c.volunteer_photo IS NOT NULL AND c.volunteer_photo != '') as has_volunteer_photo
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users v ON c.assigned_to = v.id
            WHERE c.assigned_to = $1
            ORDER BY c.created_at DESC
        `, [volunteerId]);
        return result.rows;
    },

    // Votes functionality
    async setVote(userId, complaintId, voteType) {
        const existing = await pool.query(
            'SELECT id FROM votes WHERE user_id = $1 AND complaint_id = $2',
            [userId, complaintId]
        );

        if (existing.rows.length > 0) {
            const result = await pool.query(
                `UPDATE votes 
                 SET vote_type = $3 
                 WHERE user_id = $1 AND complaint_id = $2
                 RETURNING *`,
                [userId, complaintId, voteType]
            );
            return result.rows[0];
        } else {
            const result = await pool.query(
                `INSERT INTO votes (user_id, complaint_id, vote_type)
                 VALUES ($1, $2, $3) 
                 RETURNING *`,
                [userId, complaintId, voteType]
            );
            return result.rows[0];
        }
    },

    async removeVote(userId, complaintId) {
        const result = await pool.query(
            `DELETE FROM votes 
             WHERE user_id = $1 AND complaint_id = $2
             RETURNING id`,
            [userId, complaintId]
        );
        return result.rows[0];
    },

    // Comments functionality
    async addComment(userId, complaintId, content) {
        const result = await pool.query(
            `INSERT INTO comments (user_id, complaint_id, content, timestamp)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             RETURNING *`,
            [userId, complaintId, content]
        );
        return result.rows[0];
    },

    async getCommentsByComplaint(complaintId) {
        const result = await pool.query(`
            SELECT c.*, u.name as user_name, u.profile_photo as user_photo, u.role as user_role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.complaint_id = $1
            ORDER BY c.timestamp DESC
        `, [complaintId]);
        return result.rows;
    },

    // Delete functionality
    async delete(complaintId, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // First check if the complaint belongs to the user
            const checkResult = await client.query(
                `SELECT id FROM complaints WHERE id = $1 AND user_id = $2`,
                [complaintId, userId]
            );
            
            if (checkResult.rowCount === 0) {
                await client.query('ROLLBACK');
                return false;
            }

            // Delete associated votes
            await client.query(`DELETE FROM votes WHERE complaint_id = $1`, [complaintId]);
            
            // Delete associated comments
            await client.query(`DELETE FROM comments WHERE complaint_id = $1`, [complaintId]);

            // Finally delete the complaint
            const deleteResult = await client.query(
                `DELETE FROM complaints WHERE id = $1 RETURNING id`,
                [complaintId]
            );
            
            await client.query('COMMIT');
            return deleteResult.rowCount > 0;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
};

module.exports = Complaint;
