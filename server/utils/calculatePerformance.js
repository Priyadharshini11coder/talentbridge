import { Attendance } from '../models/Attendance.js';
import { Task } from '../models/Task.js';
import { DailyReport } from '../models/DailyReport.js';
import { Performance } from '../models/Performance.js';

export async function calculateInternPerformance(internId) {
  const idStr = String(internId);

  // 1. Attendance score
  const attendanceRecords = await Attendance.find({ internId: idStr });
  const totalDays = attendanceRecords.length;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  attendanceRecords.forEach(rec => {
    if (rec.status === 'Present') presentCount++;
    else if (rec.status === 'Late') lateCount++;
    else if (rec.status === 'Absent') absentCount++;
  });

  const attendanceScore = totalDays > 0 
    ? Math.min(100, Math.round(((presentCount + lateCount * 0.5) / totalDays) * 100))
    : 100;

  // 2. Task score
  const tasks = await Task.find({ assignedTo: idStr });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const submittedTasks = tasks.filter(t => t.status === 'Submitted').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  const taskScore = totalTasks > 0
    ? Math.min(100, Math.round(((completedTasks + submittedTasks * 0.5 + inProgressTasks * 0.2) / totalTasks) * 100))
    : (submittedTasks > 0 ? 90 : 85);

  // 3. Report score
  const reports = await DailyReport.find({ internId: idStr });
  const reportsCount = reports.length;
  const expectedReports = Math.max(1, presentCount + lateCount);
  const reportScore = Math.min(100, Math.round((reportsCount / expectedReports) * 100));

  // 4. Overall Weighted Score (35% Attendance, 40% Task, 25% Reports)
  const overallScore = Math.min(100, Math.max(0, Math.round(
    attendanceScore * 0.35 +
    taskScore * 0.40 +
    reportScore * 0.25
  )));

  // Upsert into Performance collection
  const existing = await Performance.findOne({ internId: idStr });
  let perfRecord;
  if (existing) {
    perfRecord = await Performance.findByIdAndUpdate(
      existing._id || existing.id,
      {
        $set: {
          attendanceScore,
          taskScore,
          reportScore,
          overallScore,
          calculatedAt: new Date().toISOString()
        }
      },
      { new: true }
    );
  } else {
    perfRecord = await Performance.create({
      internId: idStr,
      attendanceScore,
      taskScore,
      reportScore,
      overallScore,
      calculatedAt: new Date().toISOString()
    });
  }

  return {
    internId: idStr,
    attendanceScore,
    taskScore,
    reportScore,
    overallScore,
    stats: {
      totalDays,
      presentCount,
      lateCount,
      absentCount,
      totalTasks,
      completedTasks,
      submittedTasks,
      inProgressTasks,
      reportsCount
    }
  };
}
