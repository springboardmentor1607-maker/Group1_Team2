const { pool } = require('../config/db');

const Complaint = {
    async create({ user_id, title, type, priority, address, landmark, description, latitude, longitude, photo }) {
        const result = await pool.query(
            `INSERT INTO complaints (user_id, title, type, priority, address, landmark, description, latitude, longitude, photo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [user_id, title, type, priority, address, landmark, description, latitude, longitude, photo]
        );
        return result.rows[0];
    },

    async findAll(currentUserId = null) {
        let userVoteSelect = '';
        let userVoteJoin = '';
        let params = [];

        if (currentUserId) {
            userVoteSelect = `, v_user.vote_type as user_vote_type`;
            userVoteJoin = `LEFT JOIN votes v_user ON complaints.id = v_user.complaint_id AND v_user.user_id = $1`;
            params = [currentUserId];
        }

        const result = await pool.query(`
            SELECT complaints.*,
                   COALESCE(vote_counts.upvotes_count, 0) as upvotes_count,
                   COALESCE(vote_counts.downvotes_count, 0) as downvotes_count,
                   COALESCE(comment_counts.total_comments, 0) as comments_count
                   ${userVoteSelect}
            FROM complaints 
            LEFT JOIN (
                SELECT complaint_id, 
                       COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                       COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                FROM votes GROUP BY complaint_id
            ) vote_counts ON complaints.id = vote_counts.complaint_id
            LEFT JOIN (SELECT complaint_id, COUNT(*) as total_comments FROM comments GROUP BY complaint_id) comment_counts ON complaints.id = comment_counts.complaint_id
            ${userVoteJoin}
            ORDER BY 
                CASE 
                    WHEN priority = 'Critical' THEN 1
                    WHEN priority = 'High' THEN 2
                    WHEN priority = 'Medium' THEN 3
                    WHEN priority = 'Low' THEN 4
                    ELSE 5
                END ASC,
                created_at DESC
        `, params);
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

    async findAllWithDetails(currentUserId = null) {
        let userVoteSelect = '';
        let userVoteJoin = '';
        let params = [];

        if (currentUserId) {
            userVoteSelect = `, v_user.vote_type as user_vote_type`;
            userVoteJoin = `LEFT JOIN votes v_user ON c.id = v_user.complaint_id AND v_user.user_id = $1`;
            params = [currentUserId];
        }

        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email,
                   COALESCE(vote_counts.upvotes_count, 0)::int as upvotes_count,
                   COALESCE(vote_counts.downvotes_count, 0)::int as downvotes_count,
                   COALESCE(comment_counts.total_comments, 0)::int as comments_count
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
                CASE 
                    WHEN c.priority = 'Critical' THEN 1
                    WHEN c.priority = 'High' THEN 2
                    WHEN c.priority = 'Medium' THEN 3
                    WHEN c.priority = 'Low' THEN 4
                    ELSE 5
                END ASC,
                c.created_at DESC
        `, params);
        return result.rows;
    },

    async findByUserIdWithDetails(userId) {
        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   v.name as volunteer_name, v.email as volunteer_email,
                   COALESCE(vote_counts.upvotes_count, 0)::int as upvotes_count,
                   COALESCE(vote_counts.downvotes_count, 0)::int as downvotes_count,
                   COALESCE(comment_counts.total_comments, 0)::int as comments_count,
                   v_user.vote_type as user_vote_type
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
    }
};

module.exports = Complaint;
