const express = require('express');
const router = express.Router();
const OrbitController = require('../controllers/OrbitController');

router.get('/', OrbitController.getOrbits);

module.exports = router;