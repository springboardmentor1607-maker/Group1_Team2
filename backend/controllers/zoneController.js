const Zone = require('../models/Zone');
const locationService = require('../services/locationService');

const getAllZones = async (req, res) => {
    try {
        const { state } = req.query;
        const zones = await Zone.findAll(state);
        res.json({ success: true, zones });
    } catch (err) {
        console.error('Error in getAllZones:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createZone = async (req, res) => {
    try {
        // Only admin can create zones
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { name, state, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Zone name is required' });
        }

        const zone = await Zone.create({ name, state, description });
        res.status(201).json({ success: true, message: 'Zone created successfully', zone });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, message: 'Zone with this name already exists' });
        }
        console.error('Error in createZone:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateZone = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { id } = req.params;
        const { name, state, description } = req.body;

        const zone = await Zone.update(id, { name, state, description });
        if (!zone) {
            return res.status(404).json({ success: false, message: 'Zone not found' });
        }

        res.json({ success: true, message: 'Zone updated successfully', zone });
    } catch (err) {
        console.error('Error in updateZone:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteZone = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { id } = req.params;
        const deleted = await Zone.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Zone not found' });
        }

        res.json({ success: true, message: 'Zone deleted successfully' });
    } catch (err) {
        console.error('Error in deleteZone:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const reverseGeocode = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        const result = await locationService.reverseGeocode(parseFloat(lat), parseFloat(lon));
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Error in reverseGeocode:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const geocode = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ success: false, message: 'Address is required' });
        }

        const result = await locationService.geocode(address);
        if (result) {
            res.json({ success: true, ...result });
        } else {
            res.status(404).json({ success: false, message: 'Location not found' });
        }
    } catch (err) {
        console.error('Error in geocode:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAllZones,
    createZone,
    updateZone,
    deleteZone,
    reverseGeocode,
    geocode
};
