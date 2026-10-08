import express from 'express';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Task } from '../models/Task.js';
import { TaskSubmission } from '../models/TaskSubmission.js';
import { DailyReport } from '../models/DailyReport.js';
import { verifyToken } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const isStudent = req.user.role === 'student';

    if (isStudent) {
      const internId = req.user.id;

      // Attendance
      const attendanceRecords = await Attendance.find({ internId });
      const totalAttendance = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
      const lateCount = attendanceRecords.filter(a => a.status === 'Late').length;
      const attendancePercent = totalAttendance > 0 
        ? Math.round(((presentCount + lateCount * 0.5) / totalAttendance) * 100) 
        : 100;

      // Tasks
      const allTasks = await Task.find({ assignedTo: internId });
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
      const pendingTasks = allTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
      const submittedTasks = allTasks.filter(t => t.status === 'Submitted').length;

      // Reports
      const reports = await DailyReport.find({ internId });
      const totalReports = reports.length;

      // Performance
      const perf = await calculateInternPerformance(internId);

      // Today's Tasks
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTasks = allTasks.slice(0, 4);

      // Recent Activity
      const submissions = await TaskSubmission.find({ internId });
      const activities = [];

      attendanceRecords.slice(-3).forEach(a => {
        activities.push({
          type: 'attendance',
          title: `Marked ${a.status}`,
          subtitle: `Date: ${a.date} | In: ${a.checkIn} - Out: ${a.checkOut}`,
          date: a.date,
          icon: 'calendar'
        });
      });

      submissions.slice(-3).forEach(s => {
        activities.push({
          type: 'submission',
          title: `Submitted Task Work`,
          subtitle: s.remarks ? s.remarks.slice(0, 60) : 'Task submission recorded',
          date: new Date(s.submittedAt).toLocaleDateString(),
          icon: 'clipboard'
        });
      });

      reports.slice(-3).forEach(r => {
        activities.push({
          type: 'report',
          title: `Daily Report Submitted`,
          subtitle: r.workCompleted.slice(0, 60) + '...',
          date: r.date,
          icon: 'file-text'
        });
      });

      return res.json({
        role: 'student',
        user: req.user,
        stats: {
          attendancePercentage: attendancePercent,
          attendanceRecordsCount: totalAttendance,
          totalTasks,
          completedTasks,
          pendingTasks,
          submittedTasks,
          reportsSubmitted: totalReports,
          performanceScore: perf.overallScore
        },
        progressPercentage: Math.min(100, Math.round((completedTasks / Math.max(1, totalTasks)) * 100)),
        todayTasks,
        recentActivities: activities.slice(0, 6)
      });
    }

    // Admin Dashboard stats
    const totalInterns = await User.countDocuments({ role: 'student' });
    const activeInterns = await User.countDocuments({ role: 'student', status: 'active' });

    const allTasks = await Task.find({});
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

    const allReports = await DailyReport.find({});
    const totalReports = allReports.length;

    const allAttendance = await Attendance.find({});
    const presentAtt = allAttendance.filter(a => a.status === 'Present').length;
    const lateAtt = allAttendance.filter(a => a.status === 'Late').length;
    const avgAttendance = allAttendance.length > 0 
      ? Math.round(((presentAtt + lateAtt * 0.5) / allAttendance.length) * 100) 
      : 92;

    // Recent activities across entire system
    const recentSubmissions = await TaskSubmission.find({});
    const recentReports = await DailyReport.find({});
    const internsList = await User.find({ role: 'student' });
    const internMap = {};
    internsList.forEach(i => { internMap[String(i._id || i.id)] = i.name; });

    const adminActivities = [];
    recentSubmissions.slice(-4).forEach(s => {
      adminActivities.push({
        type: 'submission',
        title: `${internMap[String(s.internId)] || 'Intern'} submitted work`,
        subtitle: s.remarks ? s.remarks.slice(0, 65) : 'Task submission',
        time: new Date(s.submittedAt).toLocaleDateString()
      });
    });

    recentReports.slice(-4).forEach(r => {
      adminActivities.push({
        type: 'report',
        title: `${internMap[String(r.internId)] || 'Intern'} filed daily report`,
        subtitle: r.workCompleted.slice(0, 65) + '...',
        time: r.date
      });
    });

    return res.json({
      role: 'admin',
      user: req.user,
      stats: {
        totalInterns,
        activeInterns,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalReportsSubmitted: totalReports,
        averageAttendance: avgAttendance
      },
      charts: {
        attendanceBreakdown: {
          present: presentAtt,
          late: lateAtt,
          absent: allAttendance.filter(a => a.status === 'Absent').length
        },
        taskBreakdown: {
          completed: completedTasks,
          pending: pendingTasks,
          submitted: allTasks.filter(t => t.status === 'Submitted').length
        }
      },
      recentActivities: adminActivities.slice(0, 6)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

export default router;
