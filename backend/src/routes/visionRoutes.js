const express = require('express');
const router = express.Router();
const { analyzeMedicine, chatWithMedicineAI } = require('../controllers/visionController');
const { analyzeReport } = require('../controllers/reportController');
const { analyzePrescription, batchSaveMedicines } = require('../controllers/prescriptionController');
const { analyzeDualAudit } = require('../controllers/dualAuditController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

const TranslationController = require('../controllers/translationController');
const VoiceAgentController = require('../controllers/voiceAgentController');
const TTSController = require('../controllers/ttsController');
const TherapyController = require('../controllers/therapyController');

router.post('/analyze-medicine', optionalAuth, analyzeMedicine);
router.post('/analyze-report', optionalAuth, analyzeReport);
router.post('/analyze-prescription', optionalAuth, analyzePrescription);
router.post('/analyze-dual-audit', optionalAuth, analyzeDualAudit);
router.post('/history/batch', optionalAuth, batchSaveMedicines);
router.post('/vision/chat', optionalAuth, chatWithMedicineAI);
router.post('/chat', optionalAuth, chatWithMedicineAI);
router.post('/translate', TranslationController.translateText);
router.post('/voice-agent/chat', optionalAuth, VoiceAgentController.handleVoiceChat);
router.get('/tts', TTSController.streamAudio);
router.post('/therapy/chat', optionalAuth, TherapyController.handleTherapySession);
router.get('/therapy/greeting', optionalAuth, TherapyController.getInitialGreeting);

module.exports = router;

