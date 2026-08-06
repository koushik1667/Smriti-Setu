const { getSupabaseClient } = require('../config/supabase');
const mongoose = require('mongoose');

// Optional Mongoose Schema (for MongoDB deployment)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let MongooseUser = null;
try {
  MongooseUser = mongoose.model('User', UserSchema);
} catch (e) {
  MongooseUser = mongoose.models.User;
}

// Local in-memory store for development fallback
const localUsers = new Map();

class User {
  static async create({ name, email, passwordHash }) {
    const cleanEmail = email.toLowerCase().trim();
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([{ id, name, email: cleanEmail, password_hash: passwordHash, created_at: createdAt }])
        .select()
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash,
          createdAt: data.created_at
        };
      }
    }

    if (mongoose.connection.readyState === 1 && MongooseUser) {
      const doc = await MongooseUser.create({ name, email: cleanEmail, passwordHash });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        createdAt: doc.createdAt
      };
    }

    // Local fallback store
    const newUser = { id, name, email: cleanEmail, passwordHash, createdAt };
    localUsers.set(cleanEmail, newUser);
    return newUser;
  }

  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash,
          createdAt: data.created_at
        };
      }
    }

    if (mongoose.connection.readyState === 1 && MongooseUser) {
      const doc = await MongooseUser.findOne({ email: cleanEmail });
      if (doc) {
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          createdAt: doc.createdAt
        };
      }
    }

    return localUsers.get(cleanEmail) || null;
  }

  static async findById(id) {
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash,
          createdAt: data.created_at
        };
      }
    }

    for (const u of localUsers.values()) {
      if (u.id === id) return u;
    }
    return null;
  }
}

module.exports = User;
