const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
        const { title, description, photo, location_coords, address } = req.body;
        const user_id = req.user.id;

        if (!title || !description || !address) {
            return res.status(400).json({ 
                message: 'Title, description, and address are required' 
            });
        }

        const complaint = await Complaint.create({
            user_id,
            title,
            description,
            photo,
            location_coords,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ 
            message: 'Server error while creating complaint' 
        });
    }
};

// Get all complaints (Admin only)
exports.getAllComplaints = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const complaints = await Complaint.findAll();
        
        res.json({
            success: true,
            complaints
        });
    } catch (error) {
        console.error('Get all complaints error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching complaints' 
        });
    }
};

// Get user's own complaints
exports.getUserComplaints = async (req, res) => {
    try {
        const user_id = req.user.id;
        const complaints = await Complaint.findByUserId(user_id);
        
        res.json({
            success: true,
            complaints
        });
    } catch (error) {
        console.error('Get user complaints error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching user complaints' 
        });
    }
};

// Get complaints assigned to volunteer
exports.getVolunteerComplaints = async (req, res) => {
    try {
        const volunteer_id = req.user.id;
        
        // Check if user is volunteer or admin
        if (req.user.role !== 'volunteer' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Volunteer privileges required.' 
            });
        }

        const complaints = await Complaint.findByVolunteerId(volunteer_id);
        
        res.json({
            success: true,
            complaints
        });
    } catch (error) {
        console.error('Get volunteer complaints error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching volunteer complaints' 
        });
    }
};

// Assign complaint to volunteer (Admin only)
exports.assignComplaint = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const { complaint_id, volunteer_id } = req.body;

        if (!complaint_id || !volunteer_id) {
            return res.status(400).json({ 
                message: 'Complaint ID and Volunteer ID are required' 
            });
        }

        // Verify the volunteer exists and has volunteer role
        const volunteer = await User.findById(volunteer_id);
        if (!volunteer || volunteer.role !== 'volunteer') {
            return res.status(400).json({ 
                message: 'Invalid volunteer ID or user is not a volunteer' 
            });
        }

        const complaint = await Complaint.assignToVolunteer(complaint_id, volunteer_id);
        
        if (!complaint) {
            return res.status(404).json({ 
                message: 'Complaint not found' 
            });
        }

        res.json({
            success: true,
            message: 'Complaint assigned successfully',
            complaint
        });
    } catch (error) {
        console.error('Assign complaint error:', error);
        res.status(500).json({ 
            message: 'Server error while assigning complaint' 
        });
    }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { complaint_id, status } = req.body;
        
        if (!complaint_id || !status) {
            return res.status(400).json({ 
                message: 'Complaint ID and status are required' 
            });
        }

        // Validate status
        const validStatuses = ['received', 'in_review', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be: received, in_review, or resolved' 
            });
        }

        // Get the complaint first to check permissions
        const existingComplaint = await Complaint.findById(complaint_id);
        if (!existingComplaint) {
            return res.status(404).json({ 
                message: 'Complaint not found' 
            });
        }

        // Check permissions: admin can update any status, volunteer can only update their assigned complaints
        if (req.user.role === 'admin') {
            // Admin can update any complaint
            const complaint = await Complaint.updateStatus(complaint_id, status);
            return res.json({
                success: true,
                message: 'Complaint status updated successfully',
                complaint
            });
        } else if (req.user.role === 'volunteer' && existingComplaint.assigned_to == req.user.id) {
            // Volunteer can only update their assigned complaints
            const complaint = await Complaint.updateStatus(complaint_id, status);
            return res.json({
                success: true,
                message: 'Complaint status updated successfully',
                complaint
            });
        } else {
            return res.status(403).json({ 
                message: 'Access denied. You can only update complaints assigned to you.' 
            });
        }

    } catch (error) {
        console.error('Update complaint status error:', error);
        res.status(500).json({ 
            message: 'Server error while updating complaint status' 
        });
    }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);
        
        if (!complaint) {
            return res.status(404).json({ 
                message: 'Complaint not found' 
            });
        }

        // Check permissions: users can view their own complaints, volunteers can view assigned complaints, admins can view all
        if (req.user.role === 'admin' || 
            complaint.user_id == req.user.id || 
            complaint.assigned_to == req.user.id) {
            
            res.json({
                success: true,
                complaint
            });
        } else {
            return res.status(403).json({ 
                message: 'Access denied. You can only view your own complaints or assigned complaints.' 
            });
        }

    } catch (error) {
        console.error('Get complaint by ID error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching complaint' 
        });
    }
};

// Get complaint statistics (Admin only)
exports.getComplaintStats = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const stats = await Complaint.getComplaintStats();
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get complaint stats error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching complaint statistics' 
        });
    }
};

// Get all volunteers (Admin only)
exports.getAllVolunteers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const volunteers = await User.findVolunteers();
        
        res.json({
            success: true,
            volunteers
        });
    } catch (error) {
        console.error('Get all volunteers error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching volunteers' 
        });
    }
};