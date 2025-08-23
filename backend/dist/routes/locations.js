"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Location_1 = require("../models/Location");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type && (type === 'all-campus' || type === 'tree-house-campus')) {
            query = { type };
        }
        const locations = await Location_1.Location.find(query).sort({ id: 1 });
        res.json(locations);
    }
    catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const location = await Location_1.Location.findOne({ id: req.params.id });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    }
    catch (error) {
        console.error('Error fetching location:', error);
        return res.status(500).json({ error: 'Failed to fetch location' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { id, name, label, lat, lng, type, room_code, welsh_name } = req.body;
        if (!id || !name || !label || lat === undefined || lng === undefined || !type) {
            return res.status(400).json({
                error: 'Missing required fields: id, name, label, lat, lng, type'
            });
        }
        if (!['all-campus', 'tree-house-campus'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid type. Must be "all-campus" or "tree-house-campus"'
            });
        }
        const existingLocation = await Location_1.Location.findOne({ id });
        if (existingLocation) {
            return res.status(409).json({ error: 'Location with this ID already exists' });
        }
        const location = new Location_1.Location({
            id,
            name,
            label,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            type,
            room_code,
            welsh_name
        });
        await location.save();
        return res.status(201).json(location);
    }
    catch (error) {
        console.error('Error creating location:', error);
        return res.status(500).json({ error: 'Failed to create location' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { name, label, lat, lng, type, room_code, welsh_name } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (label !== undefined)
            updateData.label = label;
        if (lat !== undefined)
            updateData.lat = parseFloat(lat);
        if (lng !== undefined)
            updateData.lng = parseFloat(lng);
        if (type !== undefined) {
            if (!['all-campus', 'tree-house-campus'].includes(type)) {
                return res.status(400).json({
                    error: 'Invalid type. Must be "all-campus" or "tree-house-campus"'
                });
            }
            updateData.type = type;
        }
        if (room_code !== undefined)
            updateData.room_code = room_code;
        if (welsh_name !== undefined)
            updateData.welsh_name = welsh_name;
        const location = await Location_1.Location.findOneAndUpdate({ id: req.params.id }, updateData, { new: true, runValidators: true });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json(location);
    }
    catch (error) {
        console.error('Error updating location:', error);
        return res.status(500).json({ error: 'Failed to update location' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const location = await Location_1.Location.findOneAndDelete({ id: req.params.id });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        return res.json({ message: 'Location deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting location:', error);
        return res.status(500).json({ error: 'Failed to delete location' });
    }
});
exports.default = router;
//# sourceMappingURL=locations.js.map