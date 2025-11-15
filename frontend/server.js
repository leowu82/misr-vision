const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 8080; // This is the ONLY port we will expose

// Add the API proxy
// Any request that starts with '/api' will be forwarded
// to our backend server running on http://backend:3000
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://backend:3000', // Your backend API
    changeOrigin: true, // Recommended for virtual hosted sites
    pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding
    },
  })
);

// Serve the static React app
app.use(express.static(path.join(__dirname, 'build')));

// Send all other requests to the React app
// This allows React Router to handle page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server is running on http://localhost:${port}`);
  console.log("Access it from your browser using your VM's external IP on port 8080.");
});