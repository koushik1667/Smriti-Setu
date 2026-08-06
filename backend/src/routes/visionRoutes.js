const express = require('express');
const router = express.Router();
const { analyzeMedicine, chatWithMedicineAI } = require('../controllers/visionController');
const { verifyToken } = require('../middleware/auth');

router.post('/analyze-medicine', verifyToken, analyzeMedicine);
router.post('/vision/chat', verifyToken, chatWithMedicineAI);
router.post('/chat', verifyToken, chatWithMedicineAI);

module.exports = router;
