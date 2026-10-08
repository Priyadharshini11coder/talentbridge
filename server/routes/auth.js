import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'talentbridge_super_secret_jwt_key_2026_dev_prod';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, college, course, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
      phone: phone || '',
      college: college || '',
      course: course || '',
      status: 'active'
    });

    const token = jwt.sign(
      { id: String(newUser._id || newUser.id), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: String(newUser._id || newUser.id),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        college: newUser.college,
        course: newUser.course,
        status: newUser.status
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password credentials.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password credentials.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Account role mismatch. You attempted to sign in as ${role}, but this account is registered as ${user.role}.`
      });
    }

    const token = jwt.sign(
      { id: String(user._id || user.id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: String(user._id || user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        college: user.college,
        course: user.course,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      id: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      college: user.college,
      course: user.course,
      status: user.status,
      createdAt: user.createdAt
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, college, course } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase().trim();
    if (phone !== undefined) update.phone = phone;
    if (college !== undefined) update.college = college;
    if (course !== undefined) update.course = course;

    const updated = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true });
    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: String(updated._id || updated.id),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        college: updated.college,
        course: updated.course,
        status: updated.status
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
