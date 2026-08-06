const express = require('express');
const router = express.Router();
const { getHistory, deleteHistoryItem } = require('../controllers/historyController');
const { verifyToken } = require('../middleware/auth');

router.get('/history', verifyToken, getHistory);
router.delete('/history/:id', verifyToken, deleteHistoryItem);

module.exports = router;
