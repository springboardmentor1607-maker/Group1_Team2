const Complaint = require('../models/Complaint');

const createComplaint = async (req, res) => {
    try {
        console.log('--- Complaint Submission Debug ---');
        console.log('Body:', req.body);
        console.log('User from Token:', req.user);

        const { title, type, priority, address, landmark, description, latitude, longitude } = req.body;
        const user_id = req.user ? req.user.id : null;

        if (!user_id) {
            console.error('Submission failed: No user_id in token');
            return res.status(401).json({ success: false, message: 'User not authenticated. Please log in again.' });
        }

        const complaint = await Complaint.create({
            user_id,
            title,
            type,
            priority,
            address,
            landmark,
            description,
            latitude,
            longitude
        });

        res.status(201).json({
            success: true,
            message: 'Complaint reported successfully',
            data: complaint
        });
    } catch (err) {
        console.error('SERVER ERROR IN createComplaint:', err);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAllWithDetails();
        res.json({ success: true, data: complaints });
    } catch (err) {
        console.error('Error in getAllComplaints:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUserComplaints = async (req, res) => {
    try {
        const userId = req.user.id;
        const complaints = await Complaint.findByUserIdWithDetails(userId);
        res.json({ success: true, data: complaints });
    } catch (err) {
        console.error('Error in getUserComplaints:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const stats = await Complaint.getStats();
        const recent = await Complaint.getRecent();

        res.json({
            success: true,
            stats: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                in_progress: parseInt(stats.in_progress) || 0,
                resolved: parseInt(stats.resolved) || 0
            },
            recent: recent
        });
    } catch (err) {
        console.error('Error in getDashboardStats:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const assignVolunteer = async (req, res) => {
    try {
        const { complaintId, volunteerId } = req.body;
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const updatedComplaint = await Complaint.assignVolunteer(complaintId, volunteerId);
        
        if (!updatedComplaint) {
            return res.status(404).json({ 
                success: false, 
                message: 'Complaint not found' 
            });
        }

        res.json({
            success: true,
            message: 'Volunteer assigned successfully',
            data: updatedComplaint
        });
    } catch (err) {
        console.error('Error in assignVolunteer:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status } = req.body;
        
        // Check if user is admin or volunteer
        if (!['admin', 'volunteer'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin or volunteer privileges required.' 
            });
        }

        const updatedComplaint = await Complaint.updateStatus(complaintId, status);
        
        if (!updatedComplaint) {
            return res.status(404).json({ 
                success: false, 
                message: 'Complaint not found' 
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: updatedComplaint
        });
    } catch (err) {
        console.error('Error in updateComplaintStatus:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getDashboardStats,
    assignVolunteer,
    updateComplaintStatus
};
