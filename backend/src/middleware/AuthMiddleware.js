const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure env vars are loaded

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Log (for debugging)
    console.log("Middleware Received Token:", token);

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("JWT Verification Failed:", err.message); 
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;