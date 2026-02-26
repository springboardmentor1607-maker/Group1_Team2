const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/aiController');
const { verifyToken } = require('../controllers/authController');

// Optional: Protect chat with verifyToken if you only want logged-in users to chat
router.post('/chat', verifyToken, handleChat);

module.exports = router;
