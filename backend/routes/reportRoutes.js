const express = require('express');
const router = express.Router();
const {
    generateComplaintsCSV,
    getSummaryReport,
    getVolunteerReport,
    generateVolunteersCSV
} = require('../controllers/reportController');
const { verifyToken } = require('../controllers/authController');

router.get('/complaints/csv', verifyToken, generateComplaintsCSV);
router.get('/summary', verifyToken, getSummaryReport);
router.get('/volunteers', verifyToken, getVolunteerReport);
router.get('/volunteers/csv', verifyToken, generateVolunteersCSV);

module.exports = router;
