const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('[DurableStorage] Failed to create data directory:', err.message);
  }
}

class DurableCollection {
  constructor(collectionName) {
    this.name = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[DurableStorage] Error loading collection ${this.name}:`, err.message);
    }
    return [];
  }

  save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`[DurableStorage] Error persisting collection ${this.name}:`, err.message);
    }
  }

  find(queryFn = () => true, limit = null) {
    const results = this.data.filter(queryFn);
    if (limit && typeof limit === 'number' && limit > 0) {
      return results.slice(0, limit);
    }
    return results;
  }

  findById(id) {
    return this.data.find(item => item.id === id) || null;
  }

  findOne(queryFn) {
    return this.data.find(queryFn) || null;
  }

  insert(record) {
    const newRecord = {
      id: record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    };
    this.data.unshift(newRecord);
    this.save();
    return newRecord;
  }

  insertBatch(records = []) {
    const now = Date.now();
    const formatted = records.map((rec, idx) => ({
      id: rec.id || `rec_${now + idx}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: rec.created_at || new Date(now + idx * 10).toISOString(),
      updated_at: new Date().toISOString(),
      ...rec
    }));
    this.data.unshift(...formatted);
    this.save();
    return formatted;
  }

  update(id, updates) {
    const idx = this.data.findIndex(item => item.id === id);
    if (idx === -1) return null;
    this.data[idx] = {
      ...this.data[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data[idx];
  }

  delete(id) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => item.id !== id);
    if (this.data.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  deleteMany(queryFn) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => !queryFn(item));
    if (this.data.length !== initialLen) {
      this.save();
      return initialLen - this.data.length;
    }
    return 0;
  }
}

const collections = new Map();

function getCollection(name) {
  if (!collections.has(name)) {
    collections.set(name, new DurableCollection(name));
  }
  return collections.get(name);
}

module.exports = {
  getCollection,
  DATA_DIR
};
