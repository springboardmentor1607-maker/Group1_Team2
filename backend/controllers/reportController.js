const Complaint = require('../models/Complaint');
const { pool } = require('../config/db');

const generateComplaintsCSV = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const complaints = await Complaint.findAllWithDetails(null, 1000, 0);

        if (!complaints || complaints.length === 0) {
            return res.status(404).json({ success: false, message: 'No complaints found' });
        }

        // CSV Header
        let csv = 'ID,Title,Type,Priority,Reporter,Email,Status,Address,Created At\n';

        // CSV Rows
        complaints.forEach(c => {
            const row = [
                c.id,
                `"${(c.title || '').replace(/"/g, '""')}"`,
                c.type,
                c.priority,
                `"${c.user_name || 'Unknown'}"`,
                c.user_email || 'N/A',
                c.status,
                `"${(c.address || '').replace(/"/g, '""')}"`,
                new Date(c.created_at).toLocaleString()
            ].join(',');
            csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.csv');
        res.status(200).send(csv);

    } catch (err) {
        console.error('Error generating CSV:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getSummaryReport = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const stats = await Complaint.getStats();
        const weekly = await Complaint.getWeeklyStats();
        
        // Count by type
        const complaints = await Complaint.findAllWithDetails(null, 1000, 0);
        const typeCount = {};
        
        if (complaints && Array.isArray(complaints)) {
            complaints.forEach(c => {
                const type = c.type || 'Other';
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
        }

        const zoneBreakdownRes = await pool.query(`
            SELECT z.name as zone_name, 
                   COUNT(c.id) FILTER (WHERE LOWER(c.status) != 'resolved' OR c.status IS NULL)::int as count
            FROM zones z
            LEFT JOIN complaints c ON z.id = c.zone_id
            GROUP BY z.id, z.name
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            report: {
                totalComplaints: parseInt(stats?.total) || 0,
                statusBreakdown: {
                    pending: parseInt(stats?.pending) || 0,
                    in_progress: parseInt(stats?.in_progress) || 0,
                    resolved: parseInt(stats?.resolved) || 0
                },
                typeBreakdown: typeCount || {},
                zoneBreakdown: zoneBreakdownRes.rows || [],
                weeklyStats: weekly || []
            }
        });
    } catch (err) {
        console.error('Error generating summary report:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVolunteerReport = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Detailed Volunteer List with counts
        const volunteerListRes = await pool.query(`
            SELECT 
                u.id, u.name, u.email, u.phone, u.location, u.state,
                COUNT(c.id)::int as total_assigned,
                COUNT(c.id) FILTER (WHERE LOWER(c.status) = 'pending' OR c.status IS NULL OR c.status = '')::int as pending_count,
                COUNT(c.id) FILTER (WHERE LOWER(c.status) = 'in progress' OR LOWER(c.status) = 'in_progress')::int as in_progress_count,
                COUNT(c.id) FILTER (WHERE LOWER(c.status) = 'resolved')::int as resolved_count
            FROM users u
            LEFT JOIN complaints c ON u.id = c.assigned_to
            WHERE u.role = 'volunteer'
            GROUP BY u.id, u.name, u.email, u.phone, u.location, u.state
            ORDER BY total_assigned DESC
        `);

        // General Stats
        const statsRes = await pool.query(`
            SELECT 
                COUNT(DISTINCT u.id)::int as total_volunteers,
                COUNT(DISTINCT u.id) FILTER (WHERE LOWER(c.status) = 'in progress' OR LOWER(c.status) = 'in_progress')::int as active_volunteers
            FROM users u
            LEFT JOIN complaints c ON u.id = c.assigned_to
            WHERE u.role = 'volunteer'
        `);

        // Location Distribution
        const locationRes = await pool.query(`
            SELECT location, COUNT(*)::int as count
            FROM users
            WHERE role = 'volunteer' AND location IS NOT NULL AND location != ''
            GROUP BY location
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            report: {
                summary: statsRes.rows[0] || { total_volunteers: 0, active_volunteers: 0 },
                volunteers: volunteerListRes.rows || [],
                locationDistribution: locationRes.rows || []
            }
        });
    } catch (err) {
        console.error('Error generating volunteer report:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const generateVolunteersCSV = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const result = await pool.query(`
            SELECT 
                u.name, u.email, u.phone, u.location, u.state,
                COUNT(c.id)::int as total_assigned,
                COUNT(c.id) FILTER (WHERE LOWER(c.status) = 'resolved')::int as resolved_count
            FROM users u
            LEFT JOIN complaints c ON u.id = c.assigned_to
            WHERE u.role = 'volunteer'
            GROUP BY u.id, u.name, u.email, u.phone, u.location, u.state
            ORDER BY resolved_count DESC
        `);

        let csv = 'Name,Email,Phone,Location,State,Total Assigned,Resolved\n';
        result.rows.forEach(v => {
            const row = [
                `"${v.name}"`,
                v.email,
                v.phone || '',
                `"${v.location || ''}"`,
                `"${v.state || ''}"`,
                v.total_assigned,
                v.resolved_count
            ].join(',');
            csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteer_report.csv');
        res.status(200).send(csv);
    } catch (err) {
        console.error('Error generating Volunteer CSV:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    generateComplaintsCSV,
    getSummaryReport,
    getVolunteerReport,
    generateVolunteersCSV
};
