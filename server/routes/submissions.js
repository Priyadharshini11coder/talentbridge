import express from 'express';
import { TaskSubmission } from '../models/TaskSubmission.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET all submissions
// If Student: their submissions
// If Admin: all submissions, optional filter by taskId or internId
router.get('/', verifyToken, async (req, res) => {
  try {
    const { taskId, internId } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.internId = req.user.id;
    } else {
      if (internId && internId !== 'all') filter.internId = internId;
    }
    if (taskId && taskId !== 'all') filter.taskId = taskId;

    let submissions = await TaskSubmission.find(filter);
    submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Populate Task title and Intern name
    const tasks = await Task.find({});
    const users = await User.find({ role: 'student' });

    const taskMap = {};
    tasks.forEach(t => { taskMap[String(t._id || t.id)] = t.title; });

    const userMap = {};
    users.forEach(u => { userMap[String(u._id || u.id)] = u.name; });

    const populated = submissions.map(s => ({
      ...s,
      id: String(s._id || s.id),
      taskTitle: taskMap[String(s.taskId)] || 'General Daily Task',
      internName: userMap[String(s.internId)] || 'Student'
    }));

    return res.json(populated);
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return res.status(500).json({ message: 'Failed to fetch task submissions', error: error.message });
  }
});

// POST Submit Task (Student)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { taskId, submissionLink, remarks } = req.body;

    if (!remarks && !submissionLink) {
      return res.status(400).json({ message: 'Please provide task description/remarks or submission link.' });
    }

    let resolvedTaskId = taskId;

    // If no specific task was selected, link to pending task or create one
    if (!resolvedTaskId) {
      const pendingTask = await Task.findOne({ assignedTo: req.user.id, status: { $ne: 'Completed' } });
      if (pendingTask) {
        resolvedTaskId = String(pendingTask._id || pendingTask.id);
      } else {
        // Create an automatic daily work task
        const newTask = await Task.create({
          title: `Daily Milestone - ${new Date().toLocaleDateString()}`,
          description: remarks ? remarks.slice(0, 100) : 'Daily internship submission',
          assignedTo: req.user.id,
          assignedDate: new Date(),
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'Medium',
          status: 'Submitted'
        });
        resolvedTaskId = String(newTask._id || newTask.id);
      }
    }

    const submission = await TaskSubmission.create({
      taskId: resolvedTaskId,
      internId: req.user.id,
      submissionLink: submissionLink || '',
      remarks: remarks || '',
      submittedAt: new Date(),
      status: 'Submitted',
      feedback: ''
    });

    // Update corresponding task status to 'Submitted'
    if (resolvedTaskId) {
      await Task.findByIdAndUpdate(resolvedTaskId, { $set: { status: 'Submitted' } });
    }

    // Recalculate performance
    await calculateInternPerformance(req.user.id);

    return res.status(201).json({
      message: 'Task submitted successfully!',
      submission
    });
  } catch (error) {
    console.error('Submit task error:', error);
    return res.status(500).json({ message: 'Failed to submit task', error: error.message });
  }
});

// PUT Review Submission (Admin only)
router.put('/:id/review', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, feedback } = req.body; // status: 'Approved' | 'Needs Revision'
    const submission = await TaskSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const updated = await TaskSubmission.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: status || 'Approved',
          feedback: feedback || ''
        }
      },
      { new: true }
    );

    // If approved, mark the task as 'Completed'
    if (status === 'Approved' && submission.taskId) {
      await Task.findByIdAndUpdate(submission.taskId, { $set: { status: 'Completed' } });
    } else if (status === 'Needs Revision' && submission.taskId) {
      await Task.findByIdAndUpdate(submission.taskId, { $set: { status: 'In Progress' } });
    }

    if (submission.internId) {
      await calculateInternPerformance(submission.internId);
    }

    return res.json({
      message: `Submission marked as ${status}`,
      submission: updated
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return res.status(500).json({ message: 'Failed to review submission', error: error.message });
  }
});

export default router;
