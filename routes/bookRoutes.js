const express = require('express');
const router = express.Router();
const { searchBooks, getBookById, getTopBooks } = require('../controllers/bookController');

// Search books
router.get('/search', searchBooks);

// Get top-rated books
router.get('/top', getTopBooks);

// Get book by ID
router.get('/:id', getBookById);

module.exports = router;
