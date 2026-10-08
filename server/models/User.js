import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  phone: { type: String, default: '' },
  college: { type: String, default: '' },
  course: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
export const User = createAdapter('users', MongooseUser);
export default User;
