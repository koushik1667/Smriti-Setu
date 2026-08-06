const ScanHistory = require('../models/ScanHistory');

async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await ScanHistory.findByUserId(userId);

    return res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
}

async function deleteHistoryItem(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await ScanHistory.deleteById(id, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Scan history item not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Scan history item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHistory,
  deleteHistoryItem
};
