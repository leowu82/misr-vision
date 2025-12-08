const express = require('express');
const router = express.Router();
const RectController = require('../controllers/RectangleController');
const authenticateToken = require('../middleware/AuthMiddleware');

router.get('/', RectController.getAllRectangles);
router.get('/:id', RectController.getAllRectanglesByID);
router.post('/', authenticateToken, RectController.createRectangle);
router.put('/:id', authenticateToken, RectController.updateRectangle);
router.delete('/:id', authenticateToken, RectController.deleteRectangle);

module.exports = router;