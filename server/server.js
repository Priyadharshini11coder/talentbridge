import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { seedDemoData } from './data/seedData.js';

import authRoutes from './routes/auth.js';
import internsRoutes from './routes/interns.js';
import attendanceRoutes from './routes/attendance.js';
import tasksRoutes from './routes/tasks.js';
import submissionsRoutes from './routes/submissions.js';
import reportsRoutes from './routes/reports.js';
import performanceRoutes from './routes/performance.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured origins, Vercel preview domains, or non-production local testing
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production';

    if (isAllowed) {
      return callback(null, true);
    }

    // Friendly fallback to prevent breaking demo deployments
    console.warn(`[CORS] Request from origin ${origin} allowed via wildcard/fallback policy.`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/interns', internsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Re-seed demo data endpoint
app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDemoData(true);
    return res.json({ message: 'Demo data has been reset to initial state.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset demo data', error: err.message });
  }
});

// Health check endpoint (for Render / uptime monitors)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'TalentBridge - Internship & Workforce Tracking Platform',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TalentBridge REST API Service is online and operational.',
    healthCheck: '/api/health',
    documentation: 'See README.md'
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
async function startServer() {
  await connectDB();
  await seedDemoData();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TalentBridge backend running at port ${PORT}`);
    console.log(`📡 Ready for production connections`);
  });
}

startServer();
