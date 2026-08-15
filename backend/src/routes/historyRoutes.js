const express = require('express');
const router = express.Router();
const { getHistory, deleteHistoryItem } = require('../controllers/historyController');
const { optionalAuth } = require('../middleware/auth');

router.get('/history', optionalAuth, getHistory);
router.delete('/history/:id', optionalAuth, deleteHistoryItem);

module.exports = router;
