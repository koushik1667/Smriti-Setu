const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  deleteDocument
} = require('../controllers/documentController');

router.get('/', optionalAuth, getDocuments);
router.get('/:id', optionalAuth, getDocumentById);
router.post('/', optionalAuth, createDocument);
router.delete('/:id', optionalAuth, deleteDocument);

module.exports = router;
