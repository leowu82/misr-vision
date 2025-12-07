const pool = require('../config/db');

// API endpoint to fetch pixel data with geolocation information
exports.getPixels = async (req, res) => {
    console.log('Received request for /pixels');
    
    // Extract query parameters for filtering
    const {
        orbit_id, block_id, camera_name, limit,
        ulc_lat, ulc_lon, lrc_lat, lrc_lon,
        min_index_x, max_index_x, min_index_y, max_index_y
    } = req.query;
    
    try {
        // Build the SQL query using SOM coordinate calculation
        let query = `
            SELECT index_x, index_y, som_x, som_y, latitude, longitude, camera_name, radiance
            FROM (
                SELECT orbit_id, path_id, block_id, camera_name, index_x, index_y,
                index_x*275 + ulc_som_x + 0.5 AS som_x, 
                index_y*275 + ulc_som_y + 0.5 AS som_y, 
                radiance
                FROM Block NATURAL JOIN Pixel NATURAL JOIN Orbit
                WHERE 1=1
        `;
        
        const params = [];
        
        // Add filters based on query parameters
        if (block_id) { query += ' AND block_id = ?'; params.push(parseInt(block_id)); }
        if (orbit_id) { query += ' AND orbit_id = ?'; params.push(parseInt(orbit_id)); }
        if (camera_name) { query += ' AND camera_name = ?'; params.push(camera_name); }
        
        // Add index_x and index_y filters
        if (min_index_x) { query += ' AND index_x >= ?'; params.push(parseInt(min_index_x)); }
        if (max_index_x) { query += ' AND index_x <= ?'; params.push(parseInt(max_index_x)); }
        if (min_index_y) { query += ' AND index_y >= ?'; params.push(parseInt(min_index_y)); }
        if (max_index_y) { query += ' AND index_y <= ?'; params.push(parseInt(max_index_y)); }
        
        // Close the subquery and join with Geodetic
        query += ` ) P NATURAL JOIN Geodetic G WHERE 1=1 `;
        
        // Add rectangle filtering based on lat/lon coordinates
        // Upper left corner: higher latitude, lower longitude
        // Lower right corner: lower latitude, higher longitude
        if (ulc_lat) { query += ' AND G.latitude <= ?'; params.push(parseFloat(ulc_lat)); }
        if (lrc_lat) { query += ' AND G.latitude >= ?'; params.push(parseFloat(lrc_lat)); }
        if (ulc_lon) { query += ' AND G.longitude >= ?'; params.push(parseFloat(ulc_lon)); }
        if (lrc_lon) { query += ' AND G.longitude <= ?'; params.push(parseFloat(lrc_lon)); }
        
        // Add limit only if provided
        if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
        
        const [results, fields] = await pool.query(query, params);
        
        // Send the results back as a JSON response
        res.json({
        count: results.length,
        pixels: results
        });

    } catch (error) {
        console.error('Error querying for pixels:', error);
        res.status(500).json({ error: 'Failed to retrieve pixel data' });
    }
};