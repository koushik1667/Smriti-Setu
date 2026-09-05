const { getCollection } = require('../config/durableStorage');
const { getSupabaseClient } = require('../config/supabase');

const chatCollection = getCollection('chats');

class Chat {
  static async createMessage({
    userId = 'anonymous',
    sessionId = 'default',
    chatType = 'voice_therapist', // 'voice_therapist', 'voice_agent', 'medicine_qa'
    role, // 'user' or 'assistant'
    text,
    language = 'en',
    audioUrl = '',
    metadata = {}
  }) {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    const message = {
      id,
      user_id: userId,
      session_id: sessionId,
      chat_type: chatType,
      role,
      text: text || '',
      language,
      audio_url: audioUrl || '',
      metadata,
      created_at: createdAt
    };

    const saved = chatCollection.insert(message);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('chat_history').insert([message]);
      } catch (err) {}
    }

    return saved;
  }

  static async getSessionHistory(sessionId, userId = null, limit = 50) {
    const query = (msg) => {
      const sessionMatch = !sessionId || msg.session_id === sessionId;
      const userMatch = !userId || msg.user_id === userId || msg.user_id === 'anonymous';
      return sessionMatch && userMatch;
    };

    const messages = chatCollection.find(query);
    // Sort chronological
    const sorted = messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (limit && sorted.length > limit) {
      return sorted.slice(-limit);
    }
    return sorted;
  }

  static async getRecentSessions(userId = null, chatType = null) {
    const query = (msg) => {
      const userMatch = !userId || msg.user_id === userId || msg.user_id === 'anonymous';
      const typeMatch = !chatType || msg.chat_type === chatType;
      return userMatch && typeMatch;
    };

    const messages = chatCollection.find(query);
    const sessionMap = new Map();

    messages.forEach(msg => {
      const sId = msg.session_id || 'default';
      if (!sessionMap.has(sId) || new Date(msg.created_at) > new Date(sessionMap.get(sId).last_message_at)) {
        sessionMap.set(sId, {
          session_id: sId,
          chat_type: msg.chat_type,
          last_message: msg.text,
          last_role: msg.role,
          last_message_at: msg.created_at,
          language: msg.language
        });
      }
    });

    return Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
    );
  }

  static async clearSession(sessionId, userId = null) {
    const count = chatCollection.deleteMany(msg => {
      const sessionMatch = msg.session_id === sessionId;
      const userMatch = !userId || msg.user_id === userId || msg.user_id === 'anonymous';
      return sessionMatch && userMatch;
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('chat_history').delete().eq('session_id', sessionId);
      } catch (err) {}
    }

    return count;
  }
}

module.exports = Chat;
