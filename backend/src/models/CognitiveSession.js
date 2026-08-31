let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

// Optional Mongoose Schema
let CognitiveSessionSchema = null;
let MongooseCognitiveSession = null;

if (mongoose) {
  try {
    CognitiveSessionSchema = new mongoose.Schema({
      sessionId: { type: String, required: true, unique: true, index: true },
      userId: { type: String, required: true, index: true },
      gameType: { type: String, required: true },
      difficultyLevel: { type: Number, required: true, default: 1 },
      gridSize: { type: String, default: '2x2' },
      distractorCount: { type: Number, default: 0 },
      completionTimeMs: { type: Number, required: true },
      reactionTimeMs: { type: Number, required: true },
      hesitationScore: { type: Number, required: true },
      errorRate: { type: Number, required: true },
      retryCount: { type: Number, default: 0 },
      cognitiveLoadIndex: { type: Number, required: true },
      clientTimestamp: { type: Number, required: true, index: true },
      receivedAt: { type: Date, default: Date.now }
    });
    MongooseCognitiveSession = mongoose.model('CognitiveSession', CognitiveSessionSchema);
  } catch (e) {
    MongooseCognitiveSession = mongoose.models?.CognitiveSession;
  }
}

// In-memory persistent store for development / offline testing fallback
const memorySessions = new Map();

class CognitiveSession {
  /**
   * Idempotent batch insertion
   * @param {Array<Object>} sessions 
   * @param {string} userId
   * @returns {Promise<{ insertedCount: number, duplicatesSkipped: number, ids: string[] }>}
   */
  static async batchUpsert(sessions, userId) {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return { insertedCount: 0, duplicatesSkipped: 0, ids: [] };
    }

    let insertedCount = 0;
    let duplicatesSkipped = 0;
    const insertedIds = [];

    for (const s of sessions) {
      const sessionId = s.sessionId || s.session_id;
      if (!sessionId) continue;

      const record = {
        sessionId,
        userId: userId || s.userId || s.user_id || 'anonymous_patient',
        gameType: s.gameType || s.game_type || 'reminiscence_match',
        difficultyLevel: Number(s.difficultyLevel ?? s.difficulty_level ?? 1),
        gridSize: s.gridSize || s.grid_size || '2x2',
        distractorCount: Number(s.distractorCount ?? s.distractor_count ?? 0),
        completionTimeMs: Number(s.completionTimeMs ?? s.completion_time_ms ?? 0),
        reactionTimeMs: Number(s.reactionTimeMs ?? s.reaction_time_ms ?? 0),
        hesitationScore: Number(s.hesitationScore ?? s.hesitation_score ?? 0),
        errorRate: Number(s.errorRate ?? s.error_rate ?? 0),
        retryCount: Number(s.retryCount ?? s.retry_count ?? 0),
        cognitiveLoadIndex: Number(s.cognitiveLoadIndex ?? s.cognitive_load_index ?? 0),
        clientTimestamp: Number(s.clientTimestamp ?? s.client_timestamp ?? Date.now()),
        receivedAt: new Date()
      };

      if (mongoose && mongoose.connection?.readyState === 1 && MongooseCognitiveSession) {
        try {
          const res = await MongooseCognitiveSession.updateOne(
            { sessionId },
            { $setOnInsert: record },
            { upsert: true }
          );
          if (res.upsertedCount > 0) {
            insertedCount++;
            insertedIds.push(sessionId);
          } else {
            duplicatesSkipped++;
          }
        } catch (err) {
          console.error('[CognitiveSession] Mongo upsert error:', err.message);
        }
      } else {
        if (!memorySessions.has(sessionId)) {
          memorySessions.set(sessionId, record);
          insertedCount++;
          insertedIds.push(sessionId);
        } else {
          duplicatesSkipped++;
        }
      }
    }

    return { insertedCount, duplicatesSkipped, ids: insertedIds };
  }

  /**
   * Get user session history for caregiver analytics
   */
  static async getAnalytics(userId, days = 30) {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let records = [];
    if (mongoose && mongoose.connection?.readyState === 1 && MongooseCognitiveSession) {
      records = await MongooseCognitiveSession.find({
        userId,
        clientTimestamp: { $gte: cutoffTime }
      }).sort({ clientTimestamp: 1 }).lean();
    } else {
      records = Array.from(memorySessions.values())
        .filter(r => (!userId || r.userId === userId) && r.clientTimestamp >= cutoffTime)
        .sort((a, b) => a.clientTimestamp - b.clientTimestamp);
    }

    return records;
  }
}

module.exports = CognitiveSession;
