import express from 'express';
import { DailyReport } from '../models/DailyReport.js';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET Daily Reports
// If Student: their reports
// If Admin: all reports with intern names
router.get('/', verifyToken, async (req, res) => {
  try {
    const { internId, date } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.internId = req.user.id;
    } else {
      if (internId && internId !== 'all') filter.internId = internId;
    }

    if (date) {
      filter.date = date;
    }

    let reports = await DailyReport.find(filter);
    reports.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Populate intern names for Admin
    const users = await User.find({ role: 'student' });
    const userMap = {};
    users.forEach(u => { userMap[String(u._id || u.id)] = u.name; });

    const populated = reports.map(r => ({
      ...r,
      id: String(r._id || r.id),
      internName: userMap[String(r.internId)] || 'Intern'
    }));

    return res.json(populated);
  } catch (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ message: 'Failed to fetch daily reports', error: error.message });
  }
});

// POST Submit Daily Report (Student)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, workCompleted, skillsLearned, challenges, tomorrowPlan } = req.body;

    if (!workCompleted) {
      return res.status(400).json({ message: 'Work completed description is required.' });
    }

    const reportDate = date || new Date().toISOString().split('T')[0];

    const report = await DailyReport.create({
      internId: req.user.id,
      date: reportDate,
      workCompleted,
      skillsLearned: skillsLearned || '',
      challenges: challenges || '',
      tomorrowPlan: tomorrowPlan || '',
      submittedAt: new Date()
    });

    // Recalculate intern performance
    await calculateInternPerformance(req.user.id);

    return res.status(201).json({
      message: 'Daily report submitted successfully!',
      report
    });
  } catch (error) {
    console.error('Submit report error:', error);
    return res.status(500).json({ message: 'Failed to submit daily report', error: error.message });
  }
});

export default router;
