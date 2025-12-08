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
        // Prepare parameters for the stored procedure
        // Convert to appropriate types or null
        const p_block_id = block_id ? parseInt(block_id) : null;
        const p_orbit_id = orbit_id ? parseInt(orbit_id) : null;
        const p_camera_name = camera_name || null;
        const p_index_x_min = min_index_x ? parseInt(min_index_x) : null;
        const p_index_x_max = max_index_x ? parseInt(max_index_x) : null;
        const p_index_y_min = min_index_y ? parseInt(min_index_y) : null;
        const p_index_y_max = max_index_y ? parseInt(max_index_y) : null;
        const p_lat_min = lrc_lat ? parseFloat(lrc_lat) : null;  // lower right corner has lower latitude
        const p_lat_max = ulc_lat ? parseFloat(ulc_lat) : null;  // upper left corner has higher latitude
        const p_lon_min = ulc_lon ? parseFloat(ulc_lon) : null;  // upper left corner has lower longitude
        const p_lon_max = lrc_lon ? parseFloat(lrc_lon) : null;  // lower right corner has higher longitude
        const p_lim = limit ? parseInt(limit) : 999999999;  // Default to large number if no limit
        
        // Call the stored procedure
        const [results] = await pool.query(
            'CALL get_pixels(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                p_block_id,
                p_orbit_id,
                p_camera_name,
                p_index_x_min,
                p_index_x_max,
                p_index_y_min,
                p_index_y_max,
                p_lat_min,
                p_lat_max,
                p_lon_min,
                p_lon_max,
                p_lim
            ]
        );
        
        // The stored procedure returns results in results[0]
        const pixels = results[0] || [];
        
        // Send the results back as a JSON response
        res.json({
            count: pixels.length,
            pixels: pixels
        });

    } catch (error) {
        console.error('Error querying for pixels:', error);
        res.status(500).json({ error: 'Failed to retrieve pixel data' });
    }
};