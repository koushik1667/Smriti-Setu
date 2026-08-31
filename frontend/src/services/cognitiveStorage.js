/**
 * Offline-first IndexedDB storage for Cognitive Therapeutics & Daily Assistance.
 * Gracefully degrades to localStorage if IndexedDB is restricted.
 */

const DB_NAME = 'medicare_cognitive_db';
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[CognitiveStorage] IndexedDB not available, using memory/localStorage fallback');
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Game Sessions Store
      if (!db.objectStoreNames.contains('game_sessions')) {
        const sessionStore = db.createObjectStore('game_sessions', { keyPath: 'sessionId' });
        sessionStore.createIndex('synced', 'synced', { unique: false });
        sessionStore.createIndex('clientTimestamp', 'clientTimestamp', { unique: false });
      }

      // 2. Routine Reminders Store
      if (!db.objectStoreNames.contains('routine_reminders')) {
        const reminderStore = db.createObjectStore('routine_reminders', { keyPath: 'id' });
        reminderStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // 3. Routine Adherence Logs Store
      if (!db.objectStoreNames.contains('routine_adherence')) {
        const adherenceStore = db.createObjectStore('routine_adherence', { keyPath: 'logId' });
        adherenceStore.createIndex('synced', 'synced', { unique: false });
        adherenceStore.createIndex('actionTimestamp', 'actionTimestamp', { unique: false });
      }

      // 4. Sync Queue Store
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'queueId' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.error('[CognitiveStorage] IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });

  return dbPromise;
};

// LocalStorage fallback helpers
const getLocal = (key, defaultVal = []) => {
  try {
    const raw = localStorage.getItem(`medicare_cog_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocal = (key, val) => {
  try {
    localStorage.setItem(`medicare_cog_${key}`, JSON.stringify(val));
  } catch (e) {}
};

export const CognitiveStorage = {
  /**
   * Save a cognitive game session
   */
  async saveSession(session) {
    const record = {
      ...session,
      synced: false,
      clientTimestamp: session.clientTimestamp || Date.now()
    };

    const db = await getDB();
    if (db) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['game_sessions'], 'readwrite');
        const store = tx.objectStore('game_sessions');
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => reject(req.error);
      });
    }

    // LocalStorage Fallback
    const sessions = getLocal('sessions');
    const existingIdx = sessions.findIndex(s => s.sessionId === record.sessionId);
    if (existingIdx >= 0) {
      sessions[existingIdx] = record;
    } else {
      sessions.push(record);
    }
    setLocal('sessions', sessions);
    return record;
  },

  /**
   * Retrieve all sessions
   */
  async getAllSessions() {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(['game_sessions'], 'readonly');
        const store = tx.objectStore('game_sessions');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }
    return getLocal('sessions');
  },

  /**
   * Retrieve unsynced sessions
   */
  async getUnsyncedSessions() {
    const all = await this.getAllSessions();
    return all.filter(s => !s.synced);
  },

  /**
   * Mark sessions as synced
   */
  async markSessionsSynced(sessionIds) {
    const idSet = new Set(sessionIds);
    const db = await getDB();
    if (db) {
      const tx = db.transaction(['game_sessions'], 'readwrite');
      const store = tx.objectStore('game_sessions');
      for (const id of sessionIds) {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            getReq.result.synced = true;
            store.put(getReq.result);
          }
        };
      }
      return;
    }

    const sessions = getLocal('sessions');
    sessions.forEach(s => {
      if (idSet.has(s.sessionId)) s.synced = true;
    });
    setLocal('sessions', sessions);
  },

  /**
   * Save a routine adherence log (e.g. hydration or medication)
   */
  async saveAdherenceLog(log) {
    const record = {
      ...log,
      logId: log.logId || `adh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      actionTimestamp: log.actionTimestamp || Date.now(),
      synced: false
    };

    const db = await getDB();
    if (db) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['routine_adherence'], 'readwrite');
        const store = tx.objectStore('routine_adherence');
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => reject(req.error);
      });
    }

    const logs = getLocal('adherence');
    logs.push(record);
    setLocal('adherence', logs);
    return record;
  },

  /**
   * Retrieve all adherence logs
   */
  async getAllAdherenceLogs() {
    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(['routine_adherence'], 'readonly');
        const store = tx.objectStore('routine_adherence');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }
    return getLocal('adherence');
  },

  /**
   * Retrieve unsynced adherence logs
   */
  async getUnsyncedAdherenceLogs() {
    const all = await this.getAllAdherenceLogs();
    return all.filter(l => !l.synced);
  },

  /**
   * Mark adherence logs as synced
   */
  async markAdherenceSynced(logIds) {
    const idSet = new Set(logIds);
    const db = await getDB();
    if (db) {
      const tx = db.transaction(['routine_adherence'], 'readwrite');
      const store = tx.objectStore('routine_adherence');
      for (const id of logIds) {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            getReq.result.synced = true;
            store.put(getReq.result);
          }
        };
      }
      return;
    }

    const logs = getLocal('adherence');
    logs.forEach(l => {
      if (idSet.has(l.logId)) l.synced = true;
    });
    setLocal('adherence', logs);
  },

  /**
   * Initialise default reminders (Hydration + Medication) if not present
   */
  async getOrInitReminders() {
    const defaults = [
      {
        id: 'rem_hydration_interval',
        reminderType: 'hydration',
        title: 'Drink Fresh Water',
        description: 'Stay hydrated with a full glass of water',
        scheduleType: 'interval',
        intervalMinutes: 90,
        ttsSpeechText: 'Hello! It is time to drink a refreshing glass of water.',
        icon: 'Droplet',
        isActive: true
      },
      {
        id: 'rem_morning_med',
        reminderType: 'medication',
        title: 'Morning Medications',
        description: 'Take your breakfast prescription tablets',
        scheduleType: 'fixed',
        fixedTime: '08:30',
        ttsSpeechText: 'Good morning! Please take your prescribed morning tablets with water.',
        icon: 'Pill',
        isActive: true
      },
      {
        id: 'rem_evening_med',
        reminderType: 'medication',
        title: 'Evening Health Routine',
        description: 'Take your dinner tablets and relax',
        scheduleType: 'fixed',
        fixedTime: '20:00',
        ttsSpeechText: 'Good evening! Please remember your evening medicine.',
        icon: 'Moon',
        isActive: true
      }
    ];

    const db = await getDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(['routine_reminders'], 'readwrite');
        const store = tx.objectStore('routine_reminders');
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            defaults.forEach(d => store.put(d));
            resolve(defaults);
          }
        };
        req.onerror = () => resolve(defaults);
      });
    }

    const existing = getLocal('reminders');
    if (existing.length > 0) return existing;
    setLocal('reminders', defaults);
    return defaults;
  }
};
