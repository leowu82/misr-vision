const express = require('express');
const router = express.Router();
const PixelController = require('../controllers/PixelController');

router.get('/', PixelController.getPixels);

module.exports = router;