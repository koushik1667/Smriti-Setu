-- ==============================================================================
-- Medicare / PharmaVision Cognitive Health Module - SQLite DDL Schema
-- Designed for offline-first edge storage (Flutter SQLite / React Native SQLite / Android Room)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Cognitive Game Telemetry & Session Log
CREATE TABLE IF NOT EXISTS cognitive_sessions (
    session_id TEXT PRIMARY KEY NOT NULL,          -- UUID v4
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL,                        -- 'reminiscence_match', 'task_sequence', 'object_recognition'
    difficulty_level INTEGER NOT NULL DEFAULT 1,    -- 1 to 5 scale
    grid_size TEXT NOT NULL DEFAULT '2x2',         -- '2x2', '2x3', '2x4', '3x4', etc.
    distractor_count INTEGER NOT NULL DEFAULT 0,
    completion_time_ms INTEGER NOT NULL,            -- Total time to complete puzzle in ms
    reaction_time_ms INTEGER NOT NULL,              -- Latency before the first tap
    hesitation_score REAL NOT NULL,                 -- Mean latency between subsequent taps (ms)
    error_rate REAL NOT NULL,                       -- wrong_taps / total_taps (0.0 to 1.0)
    retry_count INTEGER NOT NULL DEFAULT 0,
    cognitive_load_index REAL NOT NULL,             -- Calculated CLI score (0.0 to 100.0)
    client_timestamp INTEGER NOT NULL,              -- Epoch ms when session completed
    synced INTEGER NOT NULL DEFAULT 0,              -- 0 = pending, 1 = synced
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_time ON cognitive_sessions(user_id, client_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_sync ON cognitive_sessions(synced) WHERE synced = 0;

-- 2. Daily Routine & Reminders Schedule
CREATE TABLE IF NOT EXISTS routine_reminders (
    id TEXT PRIMARY KEY NOT NULL,                   -- UUID v4
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL,                    -- 'hydration', 'medication', 'appointment'
    title TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT NOT NULL,                    -- 'interval' or 'fixed'
    interval_minutes INTEGER,                       -- e.g. 90 for hydration
    fixed_time TEXT,                                -- 'HH:mm', e.g. '08:00', '13:00', '20:00'
    tts_speech_text TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,           -- 1 = active, 0 = paused
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Routine Adherence & Confirmation Log
CREATE TABLE IF NOT EXISTS routine_adherence_logs (
    log_id TEXT PRIMARY KEY NOT NULL,               -- UUID v4
    user_id TEXT NOT NULL,
    reminder_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL,
    scheduled_time INTEGER NOT NULL,                -- Epoch ms
    action_taken TEXT NOT NULL,                     -- 'confirmed', 'snoozed', 'dismissed'
    action_timestamp INTEGER NOT NULL,              -- Epoch ms
    synced INTEGER NOT NULL DEFAULT 0,              -- 0 = pending, 1 = synced
    FOREIGN KEY(reminder_id) REFERENCES routine_reminders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_adherence_user ON routine_adherence_logs(user_id, action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_adherence_sync ON routine_adherence_logs(synced) WHERE synced = 0;

-- 4. Idempotent Sync Queue (Handles network reconnects & replay attacks)
CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id TEXT PRIMARY KEY NOT NULL,
    entity_type TEXT NOT NULL,                      -- 'cognitive_session', 'routine_adherence'
    entity_id TEXT NOT NULL,                        -- foreign primary key
    payload_json TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_timestamp INTEGER,
    created_at INTEGER NOT NULL
);
