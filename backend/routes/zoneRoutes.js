const express = require('express');
const router = express.Router();
const {
    getAllZones,
    createZone,
    updateZone,
    deleteZone,
    reverseGeocode,
    geocode
} = require('../controllers/zoneController');
const { verifyToken } = require('../controllers/authController');

router.get('/', getAllZones);
router.post('/', verifyToken, createZone);
router.put('/:id', verifyToken, updateZone);
router.delete('/:id', verifyToken, deleteZone);
router.get('/reverse-geocode', reverseGeocode);
router.get('/geocode', geocode);

module.exports = router;
