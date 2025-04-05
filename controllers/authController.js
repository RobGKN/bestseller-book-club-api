const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register a new user
const registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check manually first
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const conflictField = userExists.email === email ? 'email' : 'username';
      return res.status(409).json({ message: `User with this ${conflictField} already exists` });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to create user (catch validation/duplicate key errors below)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
    });

    if (!user) {
      return res.status(500).json({ message: 'User creation failed' });
    }

    // Success
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // Handle Mongo duplicate key error explicitly
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ message: `Duplicate ${field}: already exists` });
    }

    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Authenticate user & get token
const loginUser = async (req, res) => {
  try {
    console.log("Login request body:", req.body); // debug
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    console.log("found user: ", user);
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.log("Login failed: incorrect password");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.log("Backend authcontroller.js error");
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
