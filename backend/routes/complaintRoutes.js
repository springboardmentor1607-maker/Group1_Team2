const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const {
    createComplaint,
    getAllComplaints,
    getUserComplaints,
    getVolunteerComplaints,
    assignComplaint,
    updateComplaintStatus,
    getComplaintById,
    getComplaintStats,
    getAllVolunteers
} = require('../controllers/complaintController');

console.log("COMPLAINT ROUTES WORKING");

// Test route
router.get('/test', (req, res) => {
    res.send("COMPLAINT ROUTES OK");
});

// Protected routes - All require authentication
router.use(verifyToken);

// Complaint CRUD operations
router.post('/create', createComplaint);                    // Create new complaint
router.get('/user', getUserComplaints);                     // Get user's own complaints
router.get('/volunteer', getVolunteerComplaints);           // Get complaints assigned to volunteer
router.get('/:id', getComplaintById);                       // Get specific complaint by ID

// Admin only routes
router.get('/', getAllComplaints);                          // Get all complaints (admin only)
router.post('/assign', assignComplaint);                    // Assign complaint to volunteer (admin only)
router.get('/stats/overview', getComplaintStats);           // Get complaint statistics (admin only)
router.get('/admin/volunteers', getAllVolunteers);          // Get all volunteers (admin only)

// Status update route (admin and assigned volunteer)
router.put('/status', updateComplaintStatus);               // Update complaint status

module.exports = router;