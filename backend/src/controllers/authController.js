const { hashPassword, comparePassword, signToken } = require('../utils/cryptoUtils');
const User = require('../models/User');

function validateRegisterInput({ name, email, password }) {
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Invalid email address format');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  return { isValid: errors.length === 0, errors };
}

function validateLoginInput({ email, password }) {
  const errors = [];
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Invalid email address format');
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }
  return { isValid: errors.length === 0, errors };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const validation = validateRegisterInput({ name, email, password });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check existing email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Save user
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash });

    // Generate token
    const token = signToken({ id: user.id, name: user.name, email: user.email });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const validation = validateLoginInput({ email, password });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signToken({ id: user.id, name: user.name, email: user.email });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    const { credential, email: providedEmail, name: providedName, picture, googleId } = req.body || {};
    let email = providedEmail;
    let name = providedName;
    let avatar = picture;

    if (credential) {
      if (process.env.GOOGLE_CLIENT_ID) {
        try {
          const { OAuth2Client } = require('google-auth-library');
          const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
        } catch (verifyErr) {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            email = decoded.email;
            name = decoded.name || name || email.split('@')[0];
            avatar = decoded.picture || avatar;
          }
        }
      } else {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || name || email.split('@')[0];
          avatar = decoded.picture || avatar;
        }
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google login requires valid email or credential token.'
      });
    }

    email = email.toLowerCase().trim();
    if (!name) name = email.split('@')[0];

    // Find or create user
    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash: 'GOOGLE_AUTH_USER',
        googleId,
        avatar
      });
    }

    const token = signToken({ id: user.id, name: user.name, email: user.email });

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  googleLogin
};

