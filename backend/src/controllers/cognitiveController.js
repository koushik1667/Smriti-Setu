const CognitiveSession = require('../models/CognitiveSession');
const RoutineAdherence = require('../models/RoutineAdherence');

/**
 * Controller for Cognitive Therapeutics & Caregiver Telemetry
 */
class CognitiveController {
  /**
   * POST /api/cognitive/sync
   * Idempotent batch synchronization endpoint
   */
  static async batchSync(req, res) {
    try {
      const userId = req.user?.id || req.body.userId || 'anonymous_patient';
      const { sessions = [], adherenceLogs = [] } = req.body;

      if (!Array.isArray(sessions) && !Array.isArray(adherenceLogs)) {
        return res.status(400).json({
          error: 'Invalid payload: sessions or adherenceLogs array required'
        });
      }

      // Upsert sessions
      const sessionResult = await CognitiveSession.batchUpsert(sessions, userId);
      // Upsert routine adherence logs
      const adherenceResult = await RoutineAdherence.batchUpsert(adherenceLogs, userId);

      return res.status(200).json({
        success: true,
        message: 'Batch synchronization completed successfully',
        serverTimestamp: Date.now(),
        synced: {
          sessions: sessionResult.insertedCount,
          sessionsSkipped: sessionResult.duplicatesSkipped,
          adherence: adherenceResult.insertedCount,
          adherenceSkipped: adherenceResult.duplicatesSkipped
        }
      });
    } catch (error) {
      console.error('[CognitiveController.batchSync] Error:', error);
      return res.status(500).json({
        error: 'Failed to process batch sync',
        details: error.message
      });
    }
  }

  /**
   * GET /api/cognitive/caregiver-analytics
   * Computes 7-day/30-day performance trajectory and 3-day moving average anomaly detection
   */
  static async getCaregiverAnalytics(req, res) {
    try {
      const userId = req.user?.id || req.query.userId || 'anonymous_patient';
      const days = parseInt(req.query.days || '30', 10);

      const [sessions, adherenceLogs] = await Promise.all([
        CognitiveSession.getAnalytics(userId, days),
        RoutineAdherence.getAdherence(userId, days)
      ]);

      // Calculate Daily Trajectories
      const dailyMap = new Map();
      const now = Date.now();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        dailyMap.set(key, {
          date: key,
          sessionCount: 0,
          totalHesitation: 0,
          totalErrorRate: 0,
          totalCompletionTime: 0,
          totalCognitiveLoad: 0,
          hydrationCount: 0,
          medicationCount: 0
        });
      }

      // Aggregate sessions
      sessions.forEach(s => {
        const key = new Date(s.clientTimestamp).toISOString().split('T')[0];
        if (dailyMap.has(key)) {
          const entry = dailyMap.get(key);
          entry.sessionCount++;
          entry.totalHesitation += s.hesitationScore;
          entry.totalErrorRate += s.errorRate;
          entry.totalCompletionTime += s.completionTimeMs;
          entry.totalCognitiveLoad += s.cognitiveLoadIndex;
        }
      });

      // Aggregate adherence
      adherenceLogs.forEach(a => {
        const key = new Date(a.actionTimestamp).toISOString().split('T')[0];
        if (dailyMap.has(key)) {
          const entry = dailyMap.get(key);
          if (a.reminderType === 'hydration' && a.actionTaken === 'confirmed') {
            entry.hydrationCount++;
          } else if (a.reminderType === 'medication' && a.actionTaken === 'confirmed') {
            entry.medicationCount++;
          }
        }
      });

      const trajectory = Array.from(dailyMap.values()).map(d => {
        const count = d.sessionCount || 1;
        const avgHesitation = d.sessionCount ? Math.round(d.totalHesitation / count) : 0;
        const avgAccuracy = d.sessionCount
          ? Math.max(0, Math.round((1 - d.totalErrorRate / count) * 100))
          : null;
        const avgCognitiveLoad = d.sessionCount
          ? Math.round((d.totalCognitiveLoad / count) * 10) / 10
          : 0;

        return {
          date: d.date,
          sessionCount: d.sessionCount,
          avgHesitationMs: avgHesitation,
          avgAccuracyPercent: avgAccuracy,
          avgCognitiveLoad,
          hydrationCount: d.hydrationCount,
          medicationCount: d.medicationCount
        };
      });

      // Anomaly Detection Algorithm:
      // Compare the 3-day trailing moving average accuracy against baseline (previous 7-14 days)
      const activeDays = trajectory.filter(t => t.avgAccuracyPercent !== null);
      let anomalyDetected = false;
      let anomalyDetails = null;

      if (activeDays.length >= 4) {
        const last3Days = activeDays.slice(-3);
        const baselineDays = activeDays.slice(0, -3);

        const avg3DayAccuracy =
          last3Days.reduce((acc, cur) => acc + cur.avgAccuracyPercent, 0) / last3Days.length;

        const baselineAccuracy =
          baselineDays.reduce((acc, cur) => acc + cur.avgAccuracyPercent, 0) / baselineDays.length;

        // Check if performance dropped > 30% relative to baseline
        const dropPercent = baselineAccuracy > 0
          ? ((baselineAccuracy - avg3DayAccuracy) / baselineAccuracy) * 100
          : 0;

        if (dropPercent >= 30) {
          anomalyDetected = true;
          anomalyDetails = {
            baselineAccuracy: Math.round(baselineAccuracy),
            recent3DayAccuracy: Math.round(avg3DayAccuracy),
            dropPercent: Math.round(dropPercent),
            severity: dropPercent >= 50 ? 'HIGH' : 'MODERATE',
            flagTimestamp: Date.now(),
            clinicalNote: 'Performance drop >30% over 3-day window detected. Recommend checking for acute infection, dehydration, medication side effects, or sleep disruption.'
          };
        }
      }

      return res.status(200).json({
        success: true,
        timeframeDays: days,
        trajectory,
        anomaly: {
          detected: anomalyDetected,
          details: anomalyDetails
        },
        summary: {
          totalSessions: sessions.length,
          totalHydrationsLogged: adherenceLogs.filter(l => l.reminderType === 'hydration').length,
          totalMedicationsConfirmed: adherenceLogs.filter(l => l.reminderType === 'medication').length
        }
      });
    } catch (error) {
      console.error('[CognitiveController.getCaregiverAnalytics] Error:', error);
      return res.status(500).json({
        error: 'Failed to compute caregiver analytics',
        details: error.message
      });
    }
  }
}

module.exports = CognitiveController;
