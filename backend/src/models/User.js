const { getCollection } = require('../config/durableStorage');
const { getSupabaseClient } = require('../config/supabase');
const mongoose = require('mongoose');

const userCollection = getCollection('users');

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

class User {
  static async create({ name, email, passwordHash }) {
    const cleanEmail = email.toLowerCase().trim();
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    const record = {
      id,
      name,
      email: cleanEmail,
      password_hash: passwordHash,
      created_at: createdAt
    };

    // 1. Save to durable persistent disk database
    const saved = userCollection.insert(record);

    // 2. Sync to Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([record])
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
      } catch (err) {}
    }

    if (mongoose.connection.readyState === 1 && MongooseUser) {
      try {
        const doc = await MongooseUser.create({ name, email: cleanEmail, passwordHash });
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          createdAt: doc.createdAt
        };
      } catch (err) {}
    }

    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      passwordHash: saved.password_hash,
      createdAt: saved.created_at
    };
  }

  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
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
      } catch (err) {}
    }

    if (mongoose.connection.readyState === 1 && MongooseUser) {
      try {
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
      } catch (err) {}
    }

    const localUser = userCollection.findOne(u => u.email === cleanEmail);
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        passwordHash: localUser.password_hash,
        createdAt: localUser.created_at
      };
    }

    return null;
  }

  static async findById(id) {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
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
      } catch (err) {}
    }

    const localUser = userCollection.findById(id);
    if (localUser) {
      return {
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        passwordHash: localUser.password_hash,
        createdAt: localUser.created_at
      };
    }

    return null;
  }
}

module.exports = User;
