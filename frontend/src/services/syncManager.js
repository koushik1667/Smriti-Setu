/**
 * Offline Sync Manager for Dementia Digital Therapeutics
 *
 * Implements store-and-forward architecture:
 * 1. All events immediately persist to local offline storage (IndexedDB/SQLite).
 * 2. An idempotent batch payload is queued.
 * 3. Network availability changes trigger an automatic flush to the backend.
 */

import { CognitiveStorage } from './cognitiveStorage.js';

const API_BASE = '/api/cognitive';

class SyncManager {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        console.log('[SyncManager] Online detected! Auto-triggering batch sync...');
        this.triggerBatchSync();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
        console.log('[SyncManager] Offline detected. Switching to local queue mode.');
      });
    }
  }

  /**
   * Subscribe to network and sync state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener({ isOnline: this.isOnline, isSyncing: this.isSyncing });
      } catch (e) {}
    }
  }

  /**
   * Enqueues a cognitive session locally and triggers sync if online
   */
  async recordSession(sessionData) {
    const saved = await CognitiveStorage.saveSession(sessionData);
    if (this.isOnline) {
      // Non-blocking sync attempt
      this.triggerBatchSync().catch(err =>
        console.warn('[SyncManager] Background sync deferred:', err.message)
      );
    }
    return saved;
  }

  /**
   * Enqueues a routine adherence record locally and triggers sync if online
   */
  async recordAdherence(adherenceData) {
    const saved = await CognitiveStorage.saveAdherenceLog(adherenceData);
    if (this.isOnline) {
      this.triggerBatchSync().catch(err =>
        console.warn('[SyncManager] Background sync deferred:', err.message)
      );
    }
    return saved;
  }

  /**
   * Trigger idempotent batch sync
   */
  async triggerBatchSync() {
    if (this.isSyncing || !this.isOnline) {
      return { success: false, reason: this.isSyncing ? 'Sync already in progress' : 'Offline' };
    }

    try {
      this.isSyncing = true;
      this.notifyListeners();

      const [unsyncedSessions, unsyncedAdherence] = await Promise.all([
        CognitiveStorage.getUnsyncedSessions(),
        CognitiveStorage.getUnsyncedAdherenceLogs()
      ]);

      if (unsyncedSessions.length === 0 && unsyncedAdherence.length === 0) {
        this.isSyncing = false;
        this.notifyListeners();
        return { success: true, count: 0, message: 'Local storage fully up-to-date' };
      }

      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessions: unsyncedSessions,
          adherenceLogs: unsyncedAdherence
        })
      });

      if (!res.ok) {
        throw new Error(`Sync server responded with ${res.status}`);
      }

      const data = await res.json();

      // Mark synchronized items locally
      if (unsyncedSessions.length > 0) {
        const sessionIds = unsyncedSessions.map(s => s.sessionId);
        await CognitiveStorage.markSessionsSynced(sessionIds);
      }

      if (unsyncedAdherence.length > 0) {
        const logIds = unsyncedAdherence.map(l => l.logId);
        await CognitiveStorage.markAdherenceSynced(logIds);
      }

      console.log('[SyncManager] Batch sync success:', data.synced);
      return { success: true, count: unsyncedSessions.length + unsyncedAdherence.length, data };
    } catch (err) {
      console.warn('[SyncManager] Batch sync attempt failed, will retry on next reconnect:', err.message);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Fetch caregiver analytics from server or fallback to local calculations
   */
  async getCaregiverAnalytics(days = 30) {
    if (this.isOnline) {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/caregiver-analytics?days=${days}`, { headers });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[SyncManager] Remote analytics fetch failed, falling back to local store:', err.message);
      }
    }

    // Local Store Calculation Fallback
    const [allSessions, allAdherence] = await Promise.all([
      CognitiveStorage.getAllSessions(),
      CognitiveStorage.getAllAdherenceLogs()
    ]);

    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const sessions = allSessions.filter(s => s.clientTimestamp >= cutoff);
    const adherence = allAdherence.filter(a => a.actionTimestamp >= cutoff);

    // Build local trajectory
    const dailyMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, {
        date: key,
        sessionCount: 0,
        totalHesitation: 0,
        totalErrorRate: 0,
        totalCognitiveLoad: 0,
        hydrationCount: 0,
        medicationCount: 0
      });
    }

    sessions.forEach(s => {
      const key = new Date(s.clientTimestamp).toISOString().split('T')[0];
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key);
        entry.sessionCount++;
        entry.totalHesitation += s.hesitationScore || 0;
        entry.totalErrorRate += s.errorRate || 0;
        entry.totalCognitiveLoad += s.cognitiveLoadIndex || 0;
      }
    });

    adherence.forEach(a => {
      const key = new Date(a.actionTimestamp).toISOString().split('T')[0];
      if (dailyMap.has(key)) {
        const entry = dailyMap.get(key);
        if (a.reminderType === 'hydration' && a.actionTaken === 'confirmed') entry.hydrationCount++;
        if (a.reminderType === 'medication' && a.actionTaken === 'confirmed') entry.medicationCount++;
      }
    });

    const trajectory = Array.from(dailyMap.values()).map(d => {
      const count = d.sessionCount || 1;
      return {
        date: d.date,
        sessionCount: d.sessionCount,
        avgHesitationMs: d.sessionCount ? Math.round(d.totalHesitation / count) : 0,
        avgAccuracyPercent: d.sessionCount ? Math.max(0, Math.round((1 - d.totalErrorRate / count) * 100)) : null,
        avgCognitiveLoad: d.sessionCount ? Math.round((d.totalCognitiveLoad / count) * 10) / 10 : 0,
        hydrationCount: d.hydrationCount,
        medicationCount: d.medicationCount
      };
    });

    // Check for >30% drop anomaly locally
    const active = trajectory.filter(t => t.avgAccuracyPercent !== null);
    let anomalyDetected = false;
    let anomalyDetails = null;

    if (active.length >= 4) {
      const last3 = active.slice(-3);
      const baseline = active.slice(0, -3);
      const avg3 = last3.reduce((acc, c) => acc + c.avgAccuracyPercent, 0) / last3.length;
      const base = baseline.reduce((acc, c) => acc + c.avgAccuracyPercent, 0) / baseline.length;
      const drop = base > 0 ? ((base - avg3) / base) * 100 : 0;

      if (drop >= 30) {
        anomalyDetected = true;
        anomalyDetails = {
          baselineAccuracy: Math.round(base),
          recent3DayAccuracy: Math.round(avg3),
          dropPercent: Math.round(drop),
          severity: drop >= 50 ? 'HIGH' : 'MODERATE',
          flagTimestamp: Date.now(),
          clinicalNote: 'Performance drop >30% over 3-day window detected locally. Potential fatigue, infection, or medication reaction.'
        };
      }
    }

    return {
      success: true,
      timeframeDays: days,
      trajectory,
      anomaly: {
        detected: anomalyDetected,
        details: anomalyDetails
      },
      summary: {
        totalSessions: sessions.length,
        totalHydrationsLogged: adherence.filter(l => l.reminderType === 'hydration').length,
        totalMedicationsConfirmed: adherence.filter(l => l.reminderType === 'medication').length
      }
    };
  }
}

export const syncManager = new SyncManager();
