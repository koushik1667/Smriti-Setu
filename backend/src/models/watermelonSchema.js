/**
 * WatermelonDB Schema definition for React Native / Offline Mobile
 * Supports lazy loading, observable queries, and bidirectional batch sync.
 */

export const WATERMELON_SCHEMA_VERSION = 1;

export const watermelonTableSchema = {
  version: WATERMELON_SCHEMA_VERSION,
  tables: [
    {
      name: 'cognitive_sessions',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'game_type', type: 'string' },
        { name: 'difficulty_level', type: 'number' },
        { name: 'grid_size', type: 'string' },
        { name: 'distractor_count', type: 'number' },
        { name: 'completion_time_ms', type: 'number' },
        { name: 'reaction_time_ms', type: 'number' },
        { name: 'hesitation_score', type: 'number' },
        { name: 'error_rate', type: 'number' },
        { name: 'retry_count', type: 'number' },
        { name: 'cognitive_load_index', type: 'number' },
        { name: 'client_timestamp', type: 'number', isIndexed: true },
        { name: 'synced', type: 'boolean', isIndexed: true },
        { name: 'created_at', type: 'number' }
      ]
    },
    {
      name: 'routine_adherence_logs',
      columns: [
        { name: 'log_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'reminder_id', type: 'string' },
        { name: 'reminder_type', type: 'string' },
        { name: 'scheduled_time', type: 'number' },
        { name: 'action_taken', type: 'string' },
        { name: 'action_timestamp', type: 'number', isIndexed: true },
        { name: 'synced', type: 'boolean', isIndexed: true }
      ]
    },
    {
      name: 'routine_reminders',
      columns: [
        { name: 'reminder_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'reminder_type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'schedule_type', type: 'string' },
        { name: 'interval_minutes', type: 'number', isOptional: true },
        { name: 'fixed_time', type: 'string', isOptional: true },
        { name: 'tts_speech_text', type: 'string' },
        { name: 'is_active', type: 'boolean' }
      ]
    }
  ]
};
