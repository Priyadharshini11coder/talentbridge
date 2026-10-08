import { isUsingMongoose, getLocalStore, saveLocalDb } from '../config/db.js';
import crypto from 'crypto';

export function createAdapter(collectionName, MongooseModel) {
  function generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  function matchesFilter(item, filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, val] of Object.entries(filter)) {
      if (key === '_id' || key === 'id') {
        const itemId = String(item._id || item.id);
        const searchId = String(val?._id || val);
        if (itemId !== searchId) return false;
        continue;
      }
      if (val && typeof val === 'object' && val.$in) {
        if (!val.$in.map(String).includes(String(item[key]))) return false;
        continue;
      }
      if (val && typeof val === 'object' && val.$ne !== undefined) {
        if (String(item[key]) === String(val.$ne)) return false;
        continue;
      }
      if (val && typeof val === 'object' && val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(item[key] || ''))) return false;
        continue;
      }
      if (String(item[key]) !== String(val)) {
        return false;
      }
    }
    return true;
  }

  return {
    async find(filter = {}) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.find(filter).lean();
      }
      const store = getLocalStore()[collectionName] || [];
      return store.filter(item => matchesFilter(item, filter));
    },

    async findOne(filter = {}) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.findOne(filter).lean();
      }
      const store = getLocalStore()[collectionName] || [];
      return store.find(item => matchesFilter(item, filter)) || null;
    },

    async findById(id) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.findById(id).lean();
      }
      const store = getLocalStore()[collectionName] || [];
      return store.find(item => String(item._id || item.id) === String(id)) || null;
    },

    async create(doc) {
      if (isUsingMongoose() && MongooseModel) {
        const created = await MongooseModel.create(doc);
        return created.toObject ? created.toObject() : created;
      }
      const store = getLocalStore()[collectionName];
      const newDoc = {
        _id: generateId(),
        ...doc,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.push(newDoc);
      saveLocalDb();
      return newDoc;
    },

    async insertMany(docs) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.insertMany(docs);
      }
      const store = getLocalStore()[collectionName];
      const created = docs.map(d => ({
        _id: d._id || generateId(),
        ...d,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      store.push(...created);
      saveLocalDb();
      return created;
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.findByIdAndUpdate(id, update, options).lean();
      }
      const store = getLocalStore()[collectionName] || [];
      const index = store.findIndex(item => String(item._id || item.id) === String(id));
      if (index === -1) return null;

      const updated = {
        ...store[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString()
      };
      store[index] = updated;
      saveLocalDb();
      return updated;
    },

    async updateOne(filter, update) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.updateOne(filter, update);
      }
      const store = getLocalStore()[collectionName] || [];
      const index = store.findIndex(item => matchesFilter(item, filter));
      if (index === -1) return { matchedCount: 0, modifiedCount: 0 };
      store[index] = {
        ...store[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString()
      };
      saveLocalDb();
      return { matchedCount: 1, modifiedCount: 1 };
    },

    async findByIdAndDelete(id) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.findByIdAndDelete(id).lean();
      }
      const store = getLocalStore()[collectionName] || [];
      const index = store.findIndex(item => String(item._id || item.id) === String(id));
      if (index === -1) return null;
      const [removed] = store.splice(index, 1);
      saveLocalDb();
      return removed;
    },

    async countDocuments(filter = {}) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.countDocuments(filter);
      }
      const store = getLocalStore()[collectionName] || [];
      return store.filter(item => matchesFilter(item, filter)).length;
    },

    async deleteMany(filter = {}) {
      if (isUsingMongoose() && MongooseModel) {
        return await MongooseModel.deleteMany(filter);
      }
      const store = getLocalStore()[collectionName] || [];
      const kept = store.filter(item => !matchesFilter(item, filter));
      getLocalStore()[collectionName] = kept;
      saveLocalDb();
      return { deletedCount: store.length - kept.length };
    }
  };
}
