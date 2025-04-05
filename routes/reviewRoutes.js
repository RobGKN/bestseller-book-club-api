const express = require('express');
const router = express.Router();
const { getBookReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Get reviews for a book
router.get('/book/:id', getBookReviews);

// Create a review (protected)
router.post('/book/:id', protect, createReview);

// Update a review (protected)
router.put('/:id', protect, updateReview);

// Delete a review (protected)
router.delete('/:id', protect, deleteReview);

module.exports = router;
