const Chat = require('../models/Chat');

async function getChatHistory(req, res, next) {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 'anonymous');
    const { sessionId = 'default', limit = 50 } = req.query;
    const limitNum = parseInt(limit, 10) || 50;

    const messages = await Chat.getSessionHistory(sessionId, userId, limitNum);

    return res.json({
      success: true,
      sessionId,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
}

async function getRecentSessions(req, res, next) {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 'anonymous');
    const { chatType } = req.query;

    const sessions = await Chat.getRecentSessions(userId, chatType);

    return res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
}

async function saveChatMessage(req, res, next) {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'anonymous');
    const {
      sessionId = 'default',
      chatType = 'voice_therapist',
      role,
      text,
      language = 'en',
      audioUrl = '',
      metadata = {}
    } = req.body;

    if (!role || !text) {
      return res.status(400).json({
        success: false,
        message: 'Role and text are required'
      });
    }

    const message = await Chat.createMessage({
      userId,
      sessionId,
      chatType,
      role,
      text,
      language,
      audioUrl,
      metadata
    });

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
}

async function clearChatHistory(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const count = await Chat.clearSession(sessionId, userId);

    return res.json({
      success: true,
      message: `Cleared ${count} messages for session ${sessionId}`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChatHistory,
  getRecentSessions,
  saveChatMessage,
  clearChatHistory
};
