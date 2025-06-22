const { User, Employee } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// const { logActivity } = require('../utils/activityLogger'); // Helper for logging

dotenv.config();

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, password, email, role, fullName, phoneNumber } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all required fields' });
  }

  try {
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      password,
      email,
      role: role || 'customer',
      fullName,
      phoneNumber,
    });

    if (user) {
      // --- Log Activity (Feature #9) ---
      // await logActivity(user.id, 'USER_REGISTERED', `New user '${user.username}' registered with role '${user.role}'.`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          token: generateToken(user.id),
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all credentials' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // --- Log Failed Login Attempt ---
      // await logActivity(null, 'LOGIN_FAILED', `Failed login attempt for username '${username}'.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // --- Log Successful Login (Feature #9) ---
    // await logActivity(user.id, 'USER_LOGIN', `User '${user.username}' logged in successfully.`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};


// Other functions like getUserProfile remain the same.

module.exports = {
  registerUser,
  loginUser,
  // ... other exports
};
