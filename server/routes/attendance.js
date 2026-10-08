import express from 'express';
import { Attendance } from '../models/Attendance.js';
import { User } from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

const router = express.Router();

// GET attendance records
// If Student: returns their own records + summary statistics
// If Admin: returns all records, can filter by internId or date
router.get('/', verifyToken, async (req, res) => {
  try {
    const { internId, date } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.internId = req.user.id;
    } else {
      if (internId && internId !== 'all') {
        filter.internId = internId;
      }
    }

    if (date) {
      filter.date = date;
    }

    let records = await Attendance.find(filter);
    // Sort descending by date
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // For students or specific intern, calculate summary stats
    const targetInternId = req.user.role === 'student' ? req.user.id : (internId && internId !== 'all' ? internId : null);
    let stats = null;

    if (targetInternId) {
      const allForIntern = await Attendance.find({ internId: targetInternId });
      const totalDays = allForIntern.length;
      const present = allForIntern.filter(r => r.status === 'Present').length;
      const absent = allForIntern.filter(r => r.status === 'Absent').length;
      const late = allForIntern.filter(r => r.status === 'Late').length;
      const percentage = totalDays > 0 ? Math.round(((present + late * 0.5) / totalDays) * 100) : 100;

      stats = {
        totalDays,
        present,
        absent,
        late,
        percentage
      };
    }

    // Populate intern name if admin
    let populatedRecords = records;
    if (req.user.role === 'admin') {
      const users = await User.find({ role: 'student' });
      const userMap = {};
      users.forEach(u => {
        userMap[String(u._id || u.id)] = u.name;
      });
      populatedRecords = records.map(r => ({
        ...r,
        internName: userMap[String(r.internId)] || 'Intern'
      }));
    }

    return res.json({
      records: populatedRecords,
      stats
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
});

// POST Mark Attendance (Admin or Student self check-in)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { internId, date, status, checkIn, checkOut, notes } = req.body;
    const targetInternId = req.user.role === 'admin' ? (internId || req.user.id) : req.user.id;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if record exists for this date & intern
    const existing = await Attendance.findOne({ internId: targetInternId, date: targetDate });
    let record;

    if (existing) {
      record = await Attendance.findByIdAndUpdate(
        existing._id || existing.id,
        {
          $set: {
            status: status || existing.status,
            checkIn: checkIn || existing.checkIn,
            checkOut: checkOut || existing.checkOut,
            notes: notes !== undefined ? notes : existing.notes
          }
        },
        { new: true }
      );
    } else {
      record = await Attendance.create({
        internId: targetInternId,
        date: targetDate,
        status: status || 'Present',
        checkIn: checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOut: checkOut || '05:00 PM',
        notes: notes || ''
      });
    }

    // Recalculate performance
    await calculateInternPerformance(targetInternId);

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      record
    });
  } catch (error) {
    console.error('Record attendance error:', error);
    return res.status(500).json({ message: 'Failed to record attendance', error: error.message });
  }
});

// Student Self Check-In / Check-Out
router.post('/self-action', verifyToken, async (req, res) => {
  try {
    const { action } = req.body; // 'check-in' or 'check-out'
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let record = await Attendance.findOne({ internId: req.user.id, date: today });

    if (action === 'check-in') {
      if (record) {
        return res.status(400).json({ message: 'You have already checked in for today!' });
      }
      record = await Attendance.create({
        internId: req.user.id,
        date: today,
        status: 'Present',
        checkIn: timeStr,
        checkOut: '--',
        notes: 'Self check-in'
      });
    } else if (action === 'check-out') {
      if (!record) {
        return res.status(400).json({ message: 'Please check in first before checking out.' });
      }
      record = await Attendance.findByIdAndUpdate(
        record._id || record.id,
        { $set: { checkOut: timeStr } },
        { new: true }
      );
    }

    await calculateInternPerformance(req.user.id);
    return res.json({ message: `${action} successful at ${timeStr}`, record });
  } catch (error) {
    return res.status(500).json({ message: 'Self attendance action failed', error: error.message });
  }
});

// PUT update attendance record (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, checkIn, checkOut, notes, date } = req.body;
    const update = {};
    if (status) update.status = status;
    if (checkIn) update.checkIn = checkIn;
    if (checkOut) update.checkOut = checkOut;
    if (notes !== undefined) update.notes = notes;
    if (date) update.date = date;

    const updated = await Attendance.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (updated.internId) {
      await calculateInternPerformance(updated.internId);
    }

    return res.json({ message: 'Attendance record updated successfully', record: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update attendance record', error: error.message });
  }
});

export default router;
