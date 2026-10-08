import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const dailyReportSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  workCompleted: { type: String, required: true },
  skillsLearned: { type: String, default: '' },
  challenges: { type: String, default: '' },
  tomorrowPlan: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});

const MongooseDailyReport = mongoose.models.DailyReport || mongoose.model('DailyReport', dailyReportSchema);
export const DailyReport = createAdapter('reports', MongooseDailyReport);
export default DailyReport;
