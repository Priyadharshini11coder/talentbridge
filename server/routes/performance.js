import express from 'express';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET all interns performance (Admin only leaderboard & ranking)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const interns = await User.find({ role: 'student' });
    const performanceList = await Promise.all(
      interns.map(async (intern) => {
        const perf = await calculateInternPerformance(intern._id || intern.id);
        return {
          internId: String(intern._id || intern.id),
          name: intern.name,
          email: intern.email,
          college: intern.college || 'College of Tech',
          course: intern.course || 'B.Tech IT',
          status: intern.status || 'active',
          attendanceScore: perf.attendanceScore,
          taskScore: perf.taskScore,
          reportScore: perf.reportScore,
          overallScore: perf.overallScore,
          stats: perf.stats
        };
      })
    );

    // Sort descending by overall score
    performanceList.sort((a, b) => b.overallScore - a.overallScore);

    return res.json(performanceList);
  } catch (error) {
    console.error('Fetch all performance error:', error);
    return res.status(500).json({ message: 'Failed to fetch performance rankings', error: error.message });
  }
});

// GET specific intern performance
router.get('/:internId', verifyToken, async (req, res) => {
  try {
    const { internId } = req.params;
    if (req.user.role === 'student' && req.user.id !== internId) {
      return res.status(403).json({ message: 'You can only view your own performance.' });
    }

    const intern = await User.findById(internId);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const perf = await calculateInternPerformance(internId);

    return res.json({
      intern: {
        id: String(intern._id || intern.id),
        name: intern.name,
        email: intern.email,
        college: intern.college,
        course: intern.course
      },
      ...perf
    });
  } catch (error) {
    console.error('Fetch intern performance error:', error);
    return res.status(500).json({ message: 'Failed to calculate performance', error: error.message });
  }
});

export default router;
