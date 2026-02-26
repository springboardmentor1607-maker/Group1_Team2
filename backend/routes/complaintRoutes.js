const express = require('express');
const router = express.Router();
const { createComplaint, getAllComplaints, getUserComplaints, getDashboardStats, assignVolunteer, updateComplaintStatus } = require('../controllers/complaintController');
const { verifyToken } = require('../controllers/authController');

// All complaint routes are protected
router.post('/', verifyToken, createComplaint);
router.get('/', verifyToken, getAllComplaints);
router.get('/my-complaints', verifyToken, getUserComplaints);
router.get('/stats', verifyToken, getDashboardStats);

// Admin/Volunteer routes
router.post('/assign-volunteer', verifyToken, assignVolunteer);
router.put('/:complaintId/status', verifyToken, updateComplaintStatus);

module.exports = router;
