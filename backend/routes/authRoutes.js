const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    verifyToken, 
    getAllUsers, 
    updateUserRole 
} = require('../controllers/authController');

console.log("AUTH ROUTES WORKING");

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/test', (req, res) => {
   res.send("AUTH OK");
});

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Admin only routes
router.get('/admin/users', verifyToken, getAllUsers);
router.put('/admin/users/role', verifyToken, updateUserRole);

module.exports = router;