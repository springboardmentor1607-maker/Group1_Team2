const express = require('express');
const router = express.Router();
const { createComplaint, getAllComplaints, getDashboardStats } = require('../controllers/complaintController');
const { verifyToken } = require('../controllers/authController');

// All complaint routes are protected
router.post('/', verifyToken, createComplaint);
router.get('/', verifyToken, getAllComplaints);
router.get('/stats', verifyToken, getDashboardStats);

module.exports = router;
