import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const attendanceSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  checkIn: { type: String, default: '09:00 AM' },
  checkOut: { type: String, default: '05:00 PM' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseAttendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export const Attendance = createAdapter('attendance', MongooseAttendance);
export default Attendance;
