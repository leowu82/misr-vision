const express = require('express');
const router = express.Router();
const RectController = require('../controllers/RectangleController');

router.get('/', RectController.getAllRectangles);
router.get('/:id', RectController.getAllRectanglesByID);
router.post('/', RectController.createRectangle);
router.put('/:id', RectController.updateRectangle);
router.delete('/:id', RectController.deleteRectangle);

module.exports = router;