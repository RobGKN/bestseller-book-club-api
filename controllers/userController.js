const User = require('../models/User');
const ReadingList = require('../models/ReadingList');

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:id/reading-lists
const getUserReadingLists = async (req, res) => {
  try {
    const lists = await ReadingList.find({ user: req.params.id });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reading lists' });
  }
};

// GET /api/users/:id/followers
//const getUserFollowers = async (req, res) => {
//  try {
//    const user = await User.findById(req.params.id).populate('followers', 'username name');
//    res.json(user.followers);
//  } catch (err) {
//    res.status(500).json({ message: 'Error fetching followers' });
//  }
//};

//// GET /api/users/:id/following
//const getUserFollowing = async (req, res) => {
//  try {
//    const user = await User.findById(req.params.id).populate('following', 'username name');
//    res.json(user.following);
//  } catch (err) {
//    res.status(500).json({ message: 'Error fetching following' });
//  }
//};

module.exports = {
  getUserById,
  getUserReadingLists,
  //getUserFollowers,
  //getUserFollowing,
};
