const express = require('express');
require('dotenv').config();

// Import Routes
const OrbitRoutes = require('./routes/OrbitRoutes');
const PixelRoutes = require('./routes/PixelRoutes');
const RectangleRoutes = require('./routes/RectangleRoutes');
const UserRoutes = require('./routes/UserRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Mount Routes
app.use('/orbits', OrbitRoutes);      // http://backend:3000/orbits
app.use('/pixels', PixelRoutes);      // http://backend:3000/pixels
app.use('/rectangles', RectangleRoutes); // http://backend:3000/rectangles
app.use('/auth', UserRoutes);         // http://backend:3000/auth

// Root Check
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Start Server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});