import express from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET all tasks
// If Student: tasks assigned to student
// If Admin: all tasks, optional filter by internId or status
router.get('/', verifyToken, async (req, res) => {
  try {
    const { internId, status, priority } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.assignedTo = req.user.id;
    } else {
      if (internId && internId !== 'all') {
        filter.assignedTo = internId;
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    let tasks = await Task.find(filter);
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Populate intern details
    const users = await User.find({ role: 'student' });
    const userMap = {};
    users.forEach(u => {
      userMap[String(u._id || u.id)] = u.name;
    });

    const populated = tasks.map(t => ({
      ...t,
      id: String(t._id || t.id),
      internName: userMap[String(t.assignedTo)] || 'Unassigned Intern'
    }));

    return res.json(populated);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

// GET task by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

// POST Create Task (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority } = req.body;
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, assigned intern, and due date are required.' });
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      assignedTo: String(assignedTo),
      assignedDate: new Date(),
      dueDate,
      priority: priority || 'Medium',
      status: 'Pending'
    });

    // Recalculate intern performance
    await calculateInternPerformance(assignedTo);

    return res.status(201).json({
      message: 'Task created and assigned successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// PUT Update Task (Admin or Student status update)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Students can only update status of their own tasks
    if (req.user.role === 'student') {
      if (String(task.assignedTo) !== String(req.user.id)) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }
      const updated = await Task.findByIdAndUpdate(
        req.params.id,
        { $set: { status: req.body.status || task.status } },
        { new: true }
      );
      await calculateInternPerformance(req.user.id);
      return res.json({ message: 'Task status updated', task: updated });
    }

    // Admin can update all fields
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    const update = {};
    if (title) update.title = title;
    if (description !== undefined) update.description = description;
    if (assignedTo) update.assignedTo = String(assignedTo);
    if (dueDate) update.dueDate = dueDate;
    if (priority) update.priority = priority;
    if (status) update.status = status;

    const updated = await Task.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (updated.assignedTo) {
      await calculateInternPerformance(updated.assignedTo);
    }

    return res.json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// DELETE Task (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    if (task.assignedTo) {
      await calculateInternPerformance(task.assignedTo);
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

export default router;
