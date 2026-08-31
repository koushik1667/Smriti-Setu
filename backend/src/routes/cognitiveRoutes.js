const express = require('express');
const router = express.Router();
const CognitiveController = require('../controllers/cognitiveController');
const optionalAuth = (req, res, next) => {
  // Allow authenticated users to attach their user ID, or fallback gracefully for offline sync
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    }
  } catch (e) {
    // Ignore invalid tokens and fallback to body userId
  }
  next();
};

// Batch synchronization endpoint
router.post('/sync', optionalAuth, CognitiveController.batchSync);

// Caregiver read-only analytics endpoint
router.get('/caregiver-analytics', optionalAuth, CognitiveController.getCaregiverAnalytics);

module.exports = router;
