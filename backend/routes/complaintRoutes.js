const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getDashboardStats,
    assignVolunteer,
    updateComplaintStatus,
    getVolunteerComplaints,
    voteComplaint,
    unvoteComplaint,
    addComplaintComment,
    getComplaintComments,
    getComplaintPhoto,
    deleteComplaint
} = require('../controllers/complaintController');
const { verifyToken } = require('../controllers/authController');

// All complaint routes are protected
router.post('/', verifyToken, createComplaint);
router.get('/', verifyToken, getAllComplaints);
router.get('/my-complaints', verifyToken, getUserComplaints);
router.get('/volunteer-complaints', verifyToken, getVolunteerComplaints);
router.get('/stats', verifyToken, getDashboardStats);

// Voting and Commenting routes (protected)
router.post('/:complaintId/vote', verifyToken, voteComplaint);
router.delete('/:complaintId/vote', verifyToken, unvoteComplaint);
router.post('/:complaintId/comments', verifyToken, addComplaintComment);
router.get('/:complaintId/comments', verifyToken, getComplaintComments);
router.get('/:complaintId/photo', verifyToken, getComplaintPhoto);

// Delete complaint route
router.delete('/:complaintId', verifyToken, deleteComplaint);

// Admin/Volunteer routes
router.post('/assign-volunteer', verifyToken, assignVolunteer);
router.put('/:complaintId/status', verifyToken, updateComplaintStatus);

module.exports = router;
