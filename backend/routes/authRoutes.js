const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, verifyToken } = require('../controllers/authController');

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

module.exports = router;