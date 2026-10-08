import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET all interns (Admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { search, status, college } = req.query;
    let filter = { role: 'student' };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (college) {
      filter.college = college;
    }

    let interns = await User.find(filter);

    if (search) {
      const q = search.toLowerCase();
      interns = interns.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.college && i.college.toLowerCase().includes(q)) ||
        (i.course && i.course.toLowerCase().includes(q))
      );
    }

    // Attach dynamic performance scores to each intern
    const populated = await Promise.all(
      interns.map(async (intern) => {
        const perf = await calculateInternPerformance(intern._id || intern.id);
        return {
          id: String(intern._id || intern.id),
          _id: String(intern._id || intern.id),
          name: intern.name,
          email: intern.email,
          phone: intern.phone || '',
          college: intern.college || 'Engineering College',
          course: intern.course || 'Computer Science',
          status: intern.status || 'active',
          createdAt: intern.createdAt,
          attendanceScore: perf.attendanceScore,
          taskScore: perf.taskScore,
          reportScore: perf.reportScore,
          overallScore: perf.overallScore,
          stats: perf.stats
        };
      })
    );

    return res.json(populated);
  } catch (error) {
    console.error('Fetch interns error:', error);
    return res.status(500).json({ message: 'Failed to fetch interns', error: error.message });
  }
});

// GET intern by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const internId = req.params.id;
    if (req.user.role !== 'admin' && req.user.id !== internId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const intern = await User.findById(internId);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    const perf = await calculateInternPerformance(internId);

    return res.json({
      id: String(intern._id || intern.id),
      _id: String(intern._id || intern.id),
      name: intern.name,
      email: intern.email,
      phone: intern.phone,
      college: intern.college,
      course: intern.course,
      status: intern.status,
      role: intern.role,
      createdAt: intern.createdAt,
      performance: perf
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch intern details', error: error.message });
  }
});

// POST create intern (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, college, course } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const newIntern = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'student',
      phone: phone || '',
      college: college || '',
      course: course || '',
      status: 'active'
    });

    const perf = await calculateInternPerformance(newIntern._id || newIntern.id);

    return res.status(201).json({
      message: 'Intern registered successfully',
      intern: {
        id: String(newIntern._id || newIntern.id),
        name: newIntern.name,
        email: newIntern.email,
        phone: newIntern.phone,
        college: newIntern.college,
        course: newIntern.course,
        status: newIntern.status,
        overallScore: perf.overallScore
      }
    });
  } catch (error) {
    console.error('Create intern error:', error);
    return res.status(500).json({ message: 'Failed to create intern', error: error.message });
  }
});

// PUT update intern (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, college, course, status } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase().trim();
    if (phone !== undefined) update.phone = phone;
    if (college !== undefined) update.college = college;
    if (course !== undefined) update.course = course;
    if (status) update.status = status;

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    return res.json({
      message: 'Intern updated successfully',
      intern: updated
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update intern', error: error.message });
  }
});

// DELETE / Deactivate intern (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    return res.json({ message: 'Intern deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete intern', error: error.message });
  }
});

export default router;
