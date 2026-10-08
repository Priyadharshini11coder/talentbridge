import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'talentbridge_super_secret_jwt_key_2026_dev_prod';

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ message: 'User account not found or inactive.' });
    }

    req.user = {
      id: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      course: user.course,
      phone: user.phone
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Administrator privilege required.' });
}

export function requireStudent(req, res, next) {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Student access only.' });
}
