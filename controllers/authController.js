const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    const { name, username, email } = req.body;

    if (!idToken) {
      return res.status(401).json({ message: 'No Firebase ID token provided' });
    }

    // 🔒 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // 🔍 Check if user already exists in Mongo
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      try {
        // ✅ Attempt to create new user
        user = await User.create({
          name,
          username,
          email,
          firebaseUid,
        });
      } catch (err) {
        // 🧹 If Mongo fails due to duplicate username — delete Firebase user
        if (err.code === 11000 && err.keyPattern?.username) {
          try {
            await admin.auth().deleteUser(firebaseUid);
            console.warn(`Deleted Firebase user ${firebaseUid} due to duplicate username.`);
          } catch (deleteErr) {
            console.error('Failed to delete Firebase user:', deleteErr.message);
          }

          return res.status(409).json({ message: 'Username is already taken.' });
        }

        console.error(err);
        return res.status(500).json({ message: 'Failed to create user profile.' });
      }
    }

    // 🎟️ Issue backend JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ ...user.toObject(), token });
  } catch (err) {
    console.error('Register failed:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

module.exports = {
  registerUser,
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
