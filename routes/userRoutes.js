const express = require('express');
const router = express.Router();
const { getUserById, getUserReadingLists, getUserFollowers, getUserFollowing } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Get a user's public profile
router.get('/:id', getUserById);

// Get a user's reading lists
router.get('/:id/reading-lists', getUserReadingLists);

// Get followers and following (protected — optional)
//router.get('/:id/followers', protect, getUserFollowers);
//router.get('/:id/following', protect, getUserFollowing);

module.exports = router;