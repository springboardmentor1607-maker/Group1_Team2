const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Zone = require('../models/Zone');

const createComplaint = async (req, res) => {
    try {
        console.log('--- Complaint Submission Debug ---');
        console.log('Body:', req.body);
        console.log('User from Token:', req.user);

        const { title, type, priority, address, landmark, description, latitude, longitude, photo, location, state } = req.body;
        const user_id = req.user ? req.user.id : null;
        const userName = req.user ? req.user.name : 'A citizen';

        // Security check: Refuse base64 strings to protect database quota
        if (photo && typeof photo === 'string' && photo.startsWith('data:image')) {
            console.error('Submission rejected: Photo is a base64 string.');
            return res.status(400).json({ 
                success: false, 
                message: 'Large image data detected. Please upload via Supabase storage instead.' 
            });
        }

        if (!user_id) {
            console.error('Submission failed: No user_id in token');
            return res.status(401).json({ success: false, message: 'User not authenticated. Please log in again.' });
        }

        // Only citizens can file complaints
        if (req.user.role !== 'citizen') {
            return res.status(403).json({
                success: false,
                message: 'Only citizens can file complaints. Volunteers and admins cannot create complaints.'
            });
        }

        // Automatically find or create zone based on location string
        let zone_id = req.body.zone_id;
        if (location) {
            const zone = await Zone.findOrCreateByName(location, state);
            zone_id = zone?.id;
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
            longitude,
            photo,
            zone_id
        });

        // Trigger notification for admins
        try {
            const admins = await User.findAdmins();
            const notificationPromises = admins.map(admin => 
                Notification.create({
                    user_id: admin.id,
                    type: 'complaint_submitted',
                    title: 'New Complaint Reported',
                    message: `${userName} reported a new ${type} issue: "${title}"`,
                    complaint_id: complaint.id
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifErr) {
            console.error('Notification Error (admin):', notifErr.message);
        }

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
        const currentUserId = req.user ? req.user.id : null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const zoneId = req.query.zone_id || null;
        const state = req.query.state || null;
        const offset = (page - 1) * limit;

        const [complaints, totalCount] = await Promise.all([
            Complaint.findAllWithDetails(currentUserId, limit, offset, zoneId, state),
            Complaint.getCount(zoneId, state)
        ]);

        res.json({ 
            success: true, 
            data: complaints,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (err) {
        console.error('Error in getAllComplaints:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUserComplaints = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [complaints, totalCount] = await Promise.all([
            Complaint.findByUserIdWithDetails(userId, limit, offset),
            Complaint.getCountByUserId(userId)
        ]);

        res.json({ 
            success: true, 
            data: complaints,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (err) {
        console.error('Error in getUserComplaints:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const zoneId = req.query.zone_id || null;
        const state = req.query.state || null;
        const stats = await Complaint.getStats(zoneId, state);
        const recent = await Complaint.getRecent();
        const weekly = await Complaint.getWeeklyStats();

        // System Activity for admins
        let systemActivity = [];
        try {
            const [globalNotifs, recentUsers, recentZones] = await Promise.all([
                Notification.findGlobal(15),
                User.findRecent(5),
                Zone.findRecent(5)
            ]);

            // Transform into unified activity format
            const activities = [
                ...globalNotifs.map(n => ({ 
                    id: `notif-${n.id}`, 
                    type: n.type, 
                    title: n.title, 
                    message: n.message, 
                    created_at: n.created_at,
                    complaint_id: n.complaint_id
                })),
                ...recentUsers.filter(u => u.role === 'volunteer').map(u => ({
                    id: `user-${u.id}`,
                    type: 'volunteer_registered',
                    title: 'New Volunteer Joined',
                    message: `${u.name} just registered as a volunteer.`,
                    created_at: u.created_at
                })),
                ...recentZones.map(z => ({
                    id: `zone-${z.id}`,
                    type: 'zone_added',
                    title: 'New Zone Added',
                    message: `A new zone "${z.name}" was added in ${z.state || 'the city'}.`,
                    created_at: z.created_at
                }))
            ];

            // Sort by most recent first
            systemActivity = activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);
        } catch (actErr) {
            console.error('Error fetching system activity:', actErr.message);
        }

        res.json({
            success: true,
            stats: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                in_progress: parseInt(stats.in_progress) || 0,
                resolved: parseInt(stats.resolved) || 0
            },
            recent: recent,
            weekly: weekly,
            systemActivity: systemActivity
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

        // Fetch volunteer details
        let volunteerInfo = null;
        try {
            const volunteer = await User.findById(volunteerId);
            if (volunteer) {
                volunteerInfo = { name: volunteer.name, email: volunteer.email };
            }
        } catch (volErr) {
            console.error('Error fetching volunteer info:', volErr.message);
        }

        // Trigger notification for volunteer
        try {
            await Notification.create({
                user_id: volunteerId,
                type: 'complaint_assigned',
                title: 'New Assignment',
                message: `You have been assigned a new complaint: "${updatedComplaint.title}"`,
                complaint_id: updatedComplaint.id
            });
        } catch (notifErr) {
            console.error('Notification Error (volunteer):', notifErr.message);
        }

        // Trigger notification for citizen
        try {
            await Notification.create({
                user_id: updatedComplaint.user_id,
                type: 'status_changed',
                title: 'Complaint Update',
                message: `Your complaint "${updatedComplaint.title}" has been assigned to a volunteer and is now being addressed.`,
                complaint_id: updatedComplaint.id
            });
        } catch (notifErr) {
            console.error('Notification Error (citizen):', notifErr.message);
        }

        // Include volunteer info in response
        const responseData = { ...updatedComplaint, volunteer_name: volunteerInfo?.name || null, volunteer_email: volunteerInfo?.email || null };

        res.json({
            success: true,
            message: 'Volunteer assigned successfully',
            data: responseData
        });
    } catch (err) {
        console.error('Error in assignVolunteer:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { status, volunteerPhoto } = req.body;

        // Security check: Refuse base64 strings to protect database quota
        if (volunteerPhoto && typeof volunteerPhoto === 'string' && volunteerPhoto.startsWith('data:image')) {
            console.error('Update rejected: volunteerPhoto is a base64 string.');
            return res.status(400).json({ 
                success: false, 
                message: 'Large image data detected. Please upload via Supabase storage instead.' 
            });
        }

        // Check if user is admin or volunteer
        if (!['admin', 'volunteer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or volunteer privileges required.'
            });
        }

        const updatedComplaint = await Complaint.updateStatus(complaintId, status, volunteerPhoto);

        if (!updatedComplaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Trigger notifications
        try {
            // Notify Citizen
            const statusLabels = {
                'received': 'Received',
                'in_review': 'Under Review',
                'resolved': 'Resolved'
            };
            
            await Notification.create({
                user_id: updatedComplaint.user_id,
                type: 'status_changed',
                title: 'Complaint Status Update',
                message: `The status of your complaint "${updatedComplaint.title}" has been updated to ${statusLabels[status] || status}.`,
                complaint_id: updatedComplaint.id
            });

            // If volunteer submitted work (in_review), notify Admin
            if (status === 'in_review' && req.user.role === 'volunteer') {
                const admins = await User.findAdmins();
                const notificationPromises = admins.map(admin => 
                    Notification.create({
                        user_id: admin.id,
                        type: 'volunteer_submitted',
                        title: 'Work Submitted by Volunteer',
                        message: `Volunteer ${req.user.name} has submitted proof of work for "${updatedComplaint.title}"`,
                        complaint_id: updatedComplaint.id
                    })
                );
                await Promise.all(notificationPromises);
            }
        } catch (notifErr) {
            console.error('Notification Error (status update):', notifErr.message);
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

const getVolunteerComplaints = async (req, res) => {
    try {
        const volunteerId = req.user.id;

        // Check if user is volunteer
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Volunteer privileges required.'
            });
        }

        const complaints = await Complaint.findByVolunteerId(volunteerId);
        res.json({ success: true, data: complaints });
    } catch (err) {
        console.error('Error in getVolunteerComplaints:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const voteComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { complaintId } = req.params;
        const { voteType } = req.body; // Expect 'upvote' or 'downvote'

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ success: false, message: 'Invalid vote type' });
        }

        await Complaint.setVote(userId, complaintId, voteType);
        res.json({ success: true, message: 'Vote recorded successfully' });
    } catch (err) {
        console.error('Error in voteComplaint:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const unvoteComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { complaintId } = req.params;
        await Complaint.removeVote(userId, complaintId);
        res.json({ success: true, message: 'Vote removed successfully' });
    } catch (err) {
        console.error('Error in unvoteComplaint:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addComplaintComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { complaintId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Comment content is required' });
        }

        const comment = await Complaint.addComment(userId, complaintId, content);
        res.status(201).json({ success: true, message: 'Comment added successfully', data: comment });
    } catch (err) {
        console.error('Error in addComplaintComment:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getComplaintComments = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const comments = await Complaint.getCommentsByComplaint(complaintId);
        res.json({ success: true, data: comments });
    } catch (err) {
        console.error('Error in getComplaintComments:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getComplaintPhoto = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const photos = await Complaint.getPhoto(complaintId);

        if (!photos) {
            return res.status(404).json({ success: false, message: 'Photos not found' });
        }

        // Allow browsers & CDN to cache the photo URL response for 1 hour
        res.set('Cache-Control', 'public, max-age=3600');
        res.json({ success: true, data: photos });
    } catch (err) {
        console.error('Error in getComplaintPhoto:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const deleteComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { complaintId } = req.params;

        const isDeleted = await Complaint.delete(complaintId, userId);

        if (!isDeleted) {
            return res.status(404).json({ success: false, message: 'Complaint not found or you do not have permission to delete it' });
        }

        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (err) {
        console.error('Error in deleteComplaint:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getVolunteerComplaints,
    getDashboardStats,
    assignVolunteer,
    updateComplaintStatus,
    voteComplaint,
    unvoteComplaint,
    addComplaintComment,
    getComplaintComments,
    getComplaintPhoto,
    deleteComplaint
};
