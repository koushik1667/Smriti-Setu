const express = require('express');
const router = express.Router();
const { analyzeMedicine, chatWithMedicineAI } = require('../controllers/visionController');
const { analyzeReport } = require('../controllers/reportController');
const { analyzePrescription, batchSaveMedicines } = require('../controllers/prescriptionController');
const { analyzeDualAudit } = require('../controllers/dualAuditController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.post('/analyze-medicine', optionalAuth, analyzeMedicine);
router.post('/analyze-report', optionalAuth, analyzeReport);
router.post('/analyze-prescription', optionalAuth, analyzePrescription);
router.post('/analyze-dual-audit', optionalAuth, analyzeDualAudit);
router.post('/history/batch', optionalAuth, batchSaveMedicines);
router.post('/vision/chat', optionalAuth, chatWithMedicineAI);
router.post('/chat', optionalAuth, chatWithMedicineAI);

module.exports = router;

