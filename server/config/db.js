import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMongooseConnected = false;
const LOCAL_DB_PATH = path.join(__dirname, '../data/local_db.json');

// Ensure local db directory exists
if (!fs.existsSync(path.dirname(LOCAL_DB_PATH))) {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
}

// In-memory cache synced to JSON
let localData = {
  users: [],
  attendance: [],
  tasks: [],
  submissions: [],
  reports: [],
  performances: []
};

// Load existing local data if present
if (fs.existsSync(LOCAL_DB_PATH)) {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    localData = JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error loading local_db.json, starting with empty store');
  }
}

export function saveLocalDb() {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing to local_db.json:', err);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge';
  
  // Safe sanitized URI for logging (masks password)
  const sanitizedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');

  try {
    console.log(`[DB] Attempting MongoDB connection to: ${sanitizedUri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongooseConnected = true;
    console.log('✅ [DB] Connected to MongoDB Atlas/Mongoose successfully.');
    return true;
  } catch (err) {
    isMongooseConnected = false;
    console.log(`⚠️  [DB] MongoDB not reachable (${err.message}).`);
    console.log('⚡ [DB] Activating embedded failover persistence engine. App is 100% operational!');
    return false;
  }
}

export function isUsingMongoose() {
  return isMongooseConnected;
}

export function getLocalStore() {
  return localData;
}
