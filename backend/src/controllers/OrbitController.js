const pool = require('../config/db');

exports.getOrbits = async (req, res) => {
  console.log('Received request for /orbits');
  try {
    const [results] = await pool.execute('SELECT * FROM Orbit LIMIT 10');
    res.json(results);
  } catch (error) {
    console.error('Error querying for orbits:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
};