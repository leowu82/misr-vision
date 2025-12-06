const pool = require('../config/db');

exports.getAllRectangles = async (req, res) => {
    console.log('Received request for /rectangles');
    try {
        const [results, fields] = await pool.query('SELECT * FROM Rectangle ORDER BY rect_id');
        res.json(results);
    } catch (error) {
        console.error('Error querying for rectangles:', error);
        res.status(500).json({ error: 'Failed to retrieve rectangles' });
    }
};

exports.getAllRectanglesByID = async (req, res) => {
    console.log(`Received request for /rectangles/${req.params.id}`);
    try {
        const [results] = await pool.query('SELECT * FROM Rectangle WHERE rect_id = ?', [parseInt(req.params.id)]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Rectangle not found' });
        }
        res.json(results[0]);
    } catch (error) {
        console.error('Error querying for rectangle:', error);
        res.status(500).json({ error: 'Failed to retrieve rectangle' });
    }
};

exports.createRectangle = async (req, res) => {
    console.log('Received POST request for /rectangles');
    const { rect_id, location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO Rectangle (rect_id, location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat) VALUES (?, ?, ?, ?, ?, ?)',
            [parseInt(rect_id), location_name, parseFloat(ulc_lon), parseFloat(ulc_lat), parseFloat(lrc_lon), parseFloat(lrc_lat)]
        );
        res.status(201).json({ message: 'Rectangle created successfully', rect_id: rect_id });
    } catch (error) {
        console.error('Error creating rectangle:', error);
        res.status(500).json({ error: 'Failed to create rectangle', details: error.message });
    }
};

exports.updateRectangle = async (req, res) => {
    console.log(`Received PUT request for /rectangles/${req.params.id}`);
    const { location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat } = req.body;
    const rect_id = parseInt(req.params.id);
    
    try {
        const [result] = await pool.query(
            'UPDATE Rectangle SET location_name = ?, ulc_lon = ?, ulc_lat = ?, lrc_lon = ?, lrc_lat = ? WHERE rect_id = ?',
            [location_name, parseFloat(ulc_lon), parseFloat(ulc_lat), parseFloat(lrc_lon), parseFloat(lrc_lat), rect_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectangle not found' });
        }
        
        res.json({ message: 'Rectangle updated successfully', rect_id: rect_id });
    } catch (error) {
        console.error('Error updating rectangle:', error);
        res.status(500).json({ error: 'Failed to update rectangle', details: error.message });
    }
};


exports.deleteRectangle = async (req, res) => {
    console.log(`Received DELETE request for /rectangles/${req.params.id}`);
    const rect_id = parseInt(req.params.id);
    
    try {
        const [result] = await pool.query('DELETE FROM Rectangle WHERE rect_id = ?', [rect_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Rectangle not found' });
        }
        
        res.json({ message: 'Rectangle deleted successfully', rect_id: rect_id });
    } catch (error) {
        console.error('Error deleting rectangle:', error);
        res.status(500).json({ error: 'Failed to delete rectangle', details: error.message });
    }
};