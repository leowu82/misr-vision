const pool = require('../config/db');

exports.getAllRectangles = async (req, res) => {
    console.log('Received request for /rectangles');
    try {
        const query = `
            SELECT 
                r.*, 
                u1.username as creator_name, 
                u2.username as editor_name 
            FROM Rectangle r
            LEFT JOIN Users u1 ON r.created_by = u1.user_id
            LEFT JOIN Users u2 ON r.last_edited_by = u2.user_id
            ORDER BY r.rect_id
        `;
        const [results, fields] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error('Error querying for rectangles:', error);
        res.status(500).json({ error: 'Failed to retrieve rectangles' });
    }
};

exports.getAllRectanglesByID = async (req, res) => {
    console.log(`Received request for /rectangles/${req.params.id}`);
    try {
        const query = `
            SELECT
                r.*,
                u1.username as creator_name,
                u2.username as editor_name
            FROM Rectangle r
            LEFT JOIN Users u1 ON r.created_by = u1.user_id
            LEFT JOIN Users u2 ON r.last_edited_by = u2.user_id
            WHERE r.rect_id = ?
            ORDER BY r.rect_id
        `;
        const [results] = await pool.query(query, [parseInt(req.params.id)]);
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

    const { rect_id, location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat } = req.body;
    
    // Safety check: Ensure user is logged in (from authMiddleware)
    const userId = req.user ? req.user.user_id : null; 
    
    // Get a specific connection for the transaction
    const connection = await pool.getConnection();

    try {
        // 1. Set Isolation Level
        await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        
        // 2. Start Transaction
        await connection.beginTransaction();

        // ---------------------------------------------------------
        // QUERY 1: Basic Insert
        // Insert the rectangle with the user who created it
        // ---------------------------------------------------------
        await connection.query(
            `INSERT INTO Rectangle 
            (rect_id, location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat, created_by, date_created) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [rect_id, location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat, userId]
        );

        // // Define lat/lon boundaries for the queries
        // const minLat = Math.min(ulc_lat, lrc_lat);
        // const maxLat = Math.max(ulc_lat, lrc_lat);
        // const minLon = Math.min(ulc_lon, lrc_lon);
        // const maxLon = Math.max(ulc_lon, lrc_lon);

        // // ---------------------------------------------------------
        // // QUERY 2: Advanced Aggregation + Complex Join
        // // Link Pixel -> Block -> Orbit -> Geodetic to get lat/lon
        // // ---------------------------------------------------------
        // const statsQuery = `
        //     SELECT 
        //         COUNT(*) as total_pixels,
        //         AVG(P.radiance) as avg_rad
        //     FROM Pixel P
        //     JOIN Block B ON P.block_id = B.block_id
        //     JOIN Orbit O ON P.orbit_id = O.orbit_id
        //     JOIN Geodetic G ON 
        //         G.block_id = P.block_id AND 
        //         G.path_id = O.path_id AND
        //         G.som_x = FLOOR(P.index_x * 275 + B.ulc_som_x + 0.5) AND
        //         G.som_y = FLOOR(P.index_y * 275 + B.ulc_som_y + 0.5)
        //     WHERE G.latitude BETWEEN ? AND ? 
        //       AND G.longitude BETWEEN ? AND ?
        // `;

        // const [statsRows] = await connection.query(statsQuery, [minLat, maxLat, minLon, maxLon]);
        // const { total_pixels, avg_rad } = statsRows[0];

        // // ---------------------------------------------------------
        // // QUERY 3: Group By to find "Best Orbit"
        // // Which orbit has the most data points in this region?
        // // ---------------------------------------------------------
        // const bestOrbitQuery = `
        //     SELECT P.orbit_id, COUNT(*) as cnt
        //     FROM Pixel P
        //     JOIN Block B ON P.block_id = B.block_id
        //     JOIN Orbit O ON P.orbit_id = O.orbit_id
        //     JOIN Geodetic G ON 
        //         G.block_id = P.block_id AND 
        //         G.path_id = O.path_id AND
        //         G.som_x = FLOOR(P.index_x * 275 + B.ulc_som_x + 0.5) AND
        //         G.som_y = FLOOR(P.index_y * 275 + B.ulc_som_y + 0.5)
        //     WHERE G.latitude BETWEEN ? AND ? 
        //       AND G.longitude BETWEEN ? AND ?
        //     GROUP BY P.orbit_id
        //     ORDER BY cnt DESC
        //     LIMIT 1
        // `;
        
        // const [orbitRows] = await connection.query(bestOrbitQuery, [minLat, maxLat, minLon, maxLon]);
        // const bestOrbit = orbitRows.length > 0 ? orbitRows[0].orbit_id : null;

        // // ---------------------------------------------------------
        // // QUERY 4: Update the Rectangle with the Analysis
        // // ---------------------------------------------------------
        // await connection.query(
        //     'UPDATE Rectangle SET pixel_count = ?, avg_radiance = ?, best_orbit_id = ? WHERE rect_id = ?',
        //     [total_pixels || 0, avg_rad || 0, bestOrbit, rect_id]
        // );

        // 3. Commit
        await connection.commit();

        res.status(201).json({ 
            message: 'Rectangle created and analyzed successfully', 
            rect_id: rect_id,
        });

    } catch (error) {
        // 4. Rollback on any error
        await connection.rollback();
        console.error('Transaction failed:', error);
        res.status(500).json({ error: 'Transaction failed', details: error.message });
    } finally {
        // 5. Always release the connection
        connection.release();
    }
};

exports.updateRectangle = async (req, res) => {
    console.log(`Received PUT request for /rectangles/${req.params.id}`);
    const { location_name, ulc_lon, ulc_lat, lrc_lon, lrc_lat } = req.body;
    const rect_id = parseInt(req.params.id);
    const userId = req.user.user_id; // <--- From Middleware

    try {
        await pool.query(`
            UPDATE Rectangle 
            SET location_name=?, ulc_lon=?, ulc_lat=?, lrc_lon=?, lrc_lat=?, last_edited_by=?, date_modified=NOW() 
            WHERE rect_id=?`,
            [location_name, parseFloat(ulc_lon), parseFloat(ulc_lat), parseFloat(lrc_lon), parseFloat(lrc_lat), userId, rect_id]
        );
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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