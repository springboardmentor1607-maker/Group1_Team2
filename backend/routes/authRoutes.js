const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, verifyToken, getAllUsers, updateUserRole, getUserStats, updateUserByAdmin, deleteUser } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');

console.log("AUTH ROUTES WORKING");

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/stats', getUserStats);
router.get('/test', (req, res) => {
   res.send("AUTH OK");
});

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Admin routes
router.get('/admin/users', verifyToken, getAllUsers);
router.put('/admin/users/role', verifyToken, updateUserRole);
router.put('/admin/users/update', verifyToken, updateUserByAdmin);
router.delete('/admin/users/:id', verifyToken, deleteUser);
module.exports = router;