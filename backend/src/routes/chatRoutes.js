const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getChatHistory,
  getRecentSessions,
  saveChatMessage,
  clearChatHistory
} = require('../controllers/chatController');

router.get('/', optionalAuth, getChatHistory);
router.get('/sessions', optionalAuth, getRecentSessions);
router.post('/', optionalAuth, saveChatMessage);
router.delete('/:sessionId', optionalAuth, clearChatHistory);

module.exports = router;
