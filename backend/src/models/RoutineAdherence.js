let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

let RoutineAdherenceSchema = null;
let MongooseRoutineAdherence = null;

if (mongoose) {
  try {
    RoutineAdherenceSchema = new mongoose.Schema({
      logId: { type: String, required: true, unique: true, index: true },
      userId: { type: String, required: true, index: true },
      reminderId: { type: String, required: true },
      reminderType: { type: String, required: true }, // 'hydration', 'medication', 'appointment'
      scheduledTime: { type: Number, required: true },
      actionTaken: { type: String, required: true },  // 'confirmed', 'snoozed', 'dismissed'
      actionTimestamp: { type: Number, required: true, index: true },
      receivedAt: { type: Date, default: Date.now }
    });
    MongooseRoutineAdherence = mongoose.model('RoutineAdherence', RoutineAdherenceSchema);
  } catch (e) {
    MongooseRoutineAdherence = mongoose.models?.RoutineAdherence;
  }
}

const memoryAdherence = new Map();

class RoutineAdherence {
  static async batchUpsert(logs, userId) {
    if (!Array.isArray(logs) || logs.length === 0) {
      return { insertedCount: 0, duplicatesSkipped: 0, ids: [] };
    }

    let insertedCount = 0;
    let duplicatesSkipped = 0;
    const insertedIds = [];

    for (const item of logs) {
      const logId = item.logId || item.log_id;
      if (!logId) continue;

      const record = {
        logId,
        userId: userId || item.userId || item.user_id || 'anonymous_patient',
        reminderId: item.reminderId || item.reminder_id || 'general',
        reminderType: item.reminderType || item.reminder_type || 'hydration',
        scheduledTime: Number(item.scheduledTime ?? item.scheduled_time ?? Date.now()),
        actionTaken: item.actionTaken || item.action_taken || 'confirmed',
        actionTimestamp: Number(item.actionTimestamp ?? item.action_timestamp ?? Date.now()),
        receivedAt: new Date()
      };

      if (mongoose && mongoose.connection?.readyState === 1 && MongooseRoutineAdherence) {
        try {
          const res = await MongooseRoutineAdherence.updateOne(
            { logId },
            { $setOnInsert: record },
            { upsert: true }
          );
          if (res.upsertedCount > 0) {
            insertedCount++;
            insertedIds.push(logId);
          } else {
            duplicatesSkipped++;
          }
        } catch (err) {
          console.error('[RoutineAdherence] Mongo upsert error:', err.message);
        }
      } else {
        if (!memoryAdherence.has(logId)) {
          memoryAdherence.set(logId, record);
          insertedCount++;
          insertedIds.push(logId);
        } else {
          duplicatesSkipped++;
        }
      }
    }

    return { insertedCount, duplicatesSkipped, ids: insertedIds };
  }

  static async getAdherence(userId, days = 30) {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let records = [];
    if (mongoose && mongoose.connection?.readyState === 1 && MongooseRoutineAdherence) {
      records = await MongooseRoutineAdherence.find({
        userId,
        actionTimestamp: { $gte: cutoffTime }
      }).sort({ actionTimestamp: 1 }).lean();
    } else {
      records = Array.from(memoryAdherence.values())
        .filter(r => (!userId || r.userId === userId) && r.actionTimestamp >= cutoffTime)
        .sort((a, b) => a.actionTimestamp - b.actionTimestamp);
    }

    return records;
  }
}

module.exports = RoutineAdherence;
