import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const performanceSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  attendanceScore: { type: Number, default: 0 },
  taskScore: { type: Number, default: 0 },
  reportScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  calculatedAt: { type: Date, default: Date.now }
});

const MongoosePerformance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
export const Performance = createAdapter('performances', MongoosePerformance);
export default Performance;
