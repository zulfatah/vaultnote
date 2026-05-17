const express = require('express');
const { body, param, query } = require('express-validator');
const noteController = require('../controllers/noteController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const { noteLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(isAuthenticated, noteLimiter);

router.post('/', [body('text').isString().isLength({ min: 1, max: 5000 }).trim()], noteController.createNote);
router.get('/', noteController.listNotes);
router.get('/search', [query('q').optional().isString().isLength({ max: 200 }).trim()], noteController.searchNotes);
router.delete('/:id', [param('id').isUUID()], noteController.deleteNote);

module.exports = router;