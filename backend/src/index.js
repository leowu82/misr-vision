const express = require('express');
require('dotenv').config();

// Import Routes
const orbitRoutes = require('./routes/OrbitRoutes');
const pixelRoutes = require('./routes/PixelRoutes');
const rectangleRoutes = require('./routes/RectangleRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Mount Routes
app.use('/orbits', orbitRoutes);      // http://backend:3000/orbits
app.use('/pixels', pixelRoutes);      // http://backend:3000/pixels
app.use('/rectangles', rectangleRoutes); // http://backend:3000/rectangles

// Root Check
app.get('/', (req, res) => {
    res.send('API Backend is running.');
});

// Start Server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});