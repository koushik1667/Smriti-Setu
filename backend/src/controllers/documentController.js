const Document = require('../models/Document');

async function getDocuments(req, res, next) {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 'anonymous');
    const { type, limit } = req.query;
    const limitNum = limit ? parseInt(limit, 10) : null;

    const documents = await Document.findByUserId(userId, limitNum, type);

    return res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
}

async function getDocumentById(req, res, next) {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    return res.json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
}

async function createDocument(req, res, next) {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 'anonymous');
    const {
      documentType = 'prescription',
      title,
      summary,
      doctorInfo,
      patientInfo,
      medicines,
      biomarkers,
      criticalFindings,
      drugInteractions,
      generalPrecautions,
      rawAnalysis,
      thumbnail
    } = req.body;

    const document = await Document.create({
      userId,
      documentType,
      title,
      summary,
      doctorInfo,
      patientInfo,
      medicines,
      biomarkers,
      criticalFindings,
      drugInteractions,
      generalPrecautions,
      rawAnalysis,
      thumbnail
    });

    return res.status(201).json({
      success: true,
      message: 'Document successfully saved to database',
      document
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const success = await Document.delete(id, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Document successfully deleted'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  deleteDocument
};
