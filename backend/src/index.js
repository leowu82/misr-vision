const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

/*
For a web server, it's much better to use a connection pool.
This manages multiple connections efficiently instead of creating
a new one for every single request.
We are still connecting to the Cloud SQL Auth Proxy on localhost.
*/
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create the Express application
const app = express();
const port = 3000; // You can change this port if needed

// --- API Endpoint ---
// This defines a GET endpoint at the URL /api/orbits
app.get('/orbits', async (req, res) => {
  console.log('Received request for /orbits');
  try {
    // Get a connection from the pool and execute the query
    const [results, fields] = await pool.execute('SELECT * FROM Orbit LIMIT 10');

    // Send the results back as a JSON response
    res.json(results);

  } catch (error) {
    console.error('Error querying for orbits:', error);
    // Send a generic server error response
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// A simple "root" endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('API server is running. Try hitting /orbits');
});

// Start the web server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log('Make sure the Cloud SQL Auth Proxy is running!');
});