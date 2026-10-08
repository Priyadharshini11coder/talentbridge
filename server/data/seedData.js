import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Task } from '../models/Task.js';
import { TaskSubmission } from '../models/TaskSubmission.js';
import { DailyReport } from '../models/DailyReport.js';
import { Performance } from '../models/Performance.js';
import { calculateInternPerformance } from '../utils/calculatePerformance.js';

export async function seedDemoData(force = false) {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !force) {
      console.log('ℹ️  [Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('🌱 [Seed] Seeding realistic TalentBridge demo data...');

    // Clear existing
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Task.deleteMany({});
    await TaskSubmission.deleteMany({});
    await DailyReport.deleteMany({});
    await Performance.deleteMany({});

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Dr. Ramesh Kumar (Admin)',
      email: 'admin@talentbridge.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 98765 43210',
      college: 'TalentBridge Workforce Academy',
      course: 'Internship Program Director',
      status: 'active'
    });

    const priya = await User.create({
      name: 'Priyadharshini',
      email: 'priya@example.com',
      password: studentPassword,
      role: 'student',
      phone: '+91 98401 23456',
      college: 'PSG College of Technology',
      course: 'B.Tech Information Technology',
      status: 'active'
    });

    const meena = await User.create({
      name: 'Meenarevathi',
      email: 'meena@example.com',
      password: studentPassword,
      role: 'student',
      phone: '+91 94432 56789',
      college: 'Coimbatore Institute of Technology',
      course: 'B.E Computer Science',
      status: 'active'
    });

    const priyaId = String(priya._id || priya.id);
    const meenaId = String(meena._id || meena.id);

    // 2. Attendance Records (Last 7 working days)
    const dates = [
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08'
    ];

    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      // Priya attendance (Mostly Present, 1 Late)
      await Attendance.create({
        internId: priyaId,
        date: d,
        status: i === 3 ? 'Late' : 'Present',
        checkIn: i === 3 ? '09:35 AM' : '09:05 AM',
        checkOut: '05:30 PM',
        notes: i === 3 ? 'Traffic delay near tech park' : 'On-time daily check-in'
      });

      // Meena attendance (Present & 1 Absent)
      await Attendance.create({
        internId: meenaId,
        date: d,
        status: i === 4 ? 'Absent' : 'Present',
        checkIn: i === 4 ? '--' : '08:58 AM',
        checkOut: i === 4 ? '--' : '05:15 PM',
        notes: i === 4 ? 'Prior sick leave approved' : 'Regular workstation presence'
      });
    }

    // 3. Create Tasks
    const t1 = await Task.create({
      title: 'Design Dark Theme Landing Page & Authentication',
      description: 'Create high-fidelity landing page with hero banner, feature cards, and JWT login/signup forms matching design specs.',
      assignedTo: priyaId,
      assignedDate: new Date('2026-10-01'),
      dueDate: '2026-10-03',
      priority: 'High',
      status: 'Completed'
    });

    const t2 = await Task.create({
      title: 'Implement Express REST APIs for Interns & Attendance',
      description: 'Develop endpoints for CRUD operations on interns and daily attendance tracking with role-based JWT verification.',
      assignedTo: priyaId,
      assignedDate: new Date('2026-10-03'),
      dueDate: '2026-10-05',
      priority: 'High',
      status: 'Completed'
    });

    const t3 = await Task.create({
      title: 'Build Dynamic Performance Engine & Student Dashboard',
      description: 'Implement dynamic performance formula: 35% attendance + 40% tasks + 25% reports. Render progress stats & cards.',
      assignedTo: priyaId,
      assignedDate: new Date('2026-10-06'),
      dueDate: '2026-10-09',
      priority: 'Medium',
      status: 'Submitted'
    });

    const t4 = await Task.create({
      title: 'MongoDB Query Optimization & Schema Validation',
      description: 'Create indexes on email and internId foreign keys, optimize pagination, and write validation test suites.',
      assignedTo: priyaId,
      assignedDate: new Date('2026-10-07'),
      dueDate: '2026-10-12',
      priority: 'Low',
      status: 'In Progress'
    });

    // Meena's tasks
    const m1 = await Task.create({
      title: 'Database Schema Design & Migration Scripts',
      description: 'Define collections for Users, Attendance, Tasks, Submissions, Reports and Performance with references.',
      assignedTo: meenaId,
      assignedDate: new Date('2026-10-01'),
      dueDate: '2026-10-04',
      priority: 'High',
      status: 'Completed'
    });

    const m2 = await Task.create({
      title: 'Daily Report Submission & Review System',
      description: 'Allow interns to submit daily work, skills learned, obstacles, and plans for the next work day.',
      assignedTo: meenaId,
      assignedDate: new Date('2026-10-04'),
      dueDate: '2026-10-08',
      priority: 'Medium',
      status: 'Completed'
    });

    const m3 = await Task.create({
      title: 'Admin Management Tables & Filter Search',
      description: 'Implement searchable data tables for interns, attendance records, and review queues with export options.',
      assignedTo: meenaId,
      assignedDate: new Date('2026-10-06'),
      dueDate: '2026-10-10',
      priority: 'Medium',
      status: 'Pending'
    });

    // 4. Task Submissions
    await TaskSubmission.create({
      taskId: String(t1._id || t1.id),
      internId: priyaId,
      submissionLink: 'https://github.com/talentbridge/frontend-landing',
      remarks: 'Completed landing page layout with responsive dark mode matching the design system specifications.',
      submittedAt: new Date('2026-10-03T16:45:00Z'),
      status: 'Approved',
      feedback: 'Excellent work! Matches the requested color palette and responsive breakpoints.'
    });

    await TaskSubmission.create({
      taskId: String(t2._id || t2.id),
      internId: priyaId,
      submissionLink: 'https://github.com/talentbridge/backend-core-api',
      remarks: 'Implemented all Express routes, controllers, and JWT auth middleware with bcrypt password hashing.',
      submittedAt: new Date('2026-10-05T17:15:00Z'),
      status: 'Approved',
      feedback: 'Clean code structure and proper error handling.'
    });

    await TaskSubmission.create({
      taskId: String(t3._id || t3.id),
      internId: priyaId,
      submissionLink: 'https://github.com/talentbridge/performance-dashboard',
      remarks: 'Implemented dynamic performance score calculator (35% attendance, 40% task, 25% reports) and student dashboard cards.',
      submittedAt: new Date('2026-10-08T14:30:00Z'),
      status: 'Submitted',
      feedback: ''
    });

    // 5. Daily Reports
    const sampleReports = [
      {
        internId: priyaId,
        date: '2026-10-05',
        workCompleted: 'Finished REST API endpoints for attendance check-in and task submissions. Tested with Postman.',
        skillsLearned: 'Express router modularity, JWT token authorization, and MongoDB aggregation.',
        challenges: 'Handling token expiry edge cases and cross-origin CORS headers.',
        tomorrowPlan: 'Build the dynamic performance engine and student analytics dashboard.'
      },
      {
        internId: priyaId,
        date: '2026-10-06',
        workCompleted: 'Built the dynamic performance formula. Tested weighted distribution with mock student data.',
        skillsLearned: 'Dynamic score calculation, status badge design, and statistical rollups.',
        challenges: 'Balancing edge case when student has 0 tasks assigned.',
        tomorrowPlan: 'Connect frontend dashboard cards with live server API.'
      },
      {
        internId: priyaId,
        date: '2026-10-07',
        workCompleted: 'Created student dashboard layout, stat cards, and today tasks widget.',
        skillsLearned: 'Tailwind CSS dark gradients, responsive grid layouts, and Lucide icons.',
        challenges: 'Matching custom purple and blue button styles from reference design.',
        tomorrowPlan: 'Finalize full-stack integration and end-to-end testing.'
      },
      {
        internId: meenaId,
        date: '2026-10-06',
        workCompleted: 'Designed daily reports submission form and admin reports review feed.',
        skillsLearned: 'Form state handling, controlled inputs, and modal dialogues.',
        challenges: 'Validating date formats consistently between client and backend.',
        tomorrowPlan: 'Build searchable intern management table for administrator portal.'
      }
    ];

    for (const r of sampleReports) {
      await DailyReport.create({
        ...r,
        submittedAt: new Date(r.date)
      });
    }

    // 6. Calculate & Store Performance
    await calculateInternPerformance(priyaId);
    await calculateInternPerformance(meenaId);

    console.log('✅ [Seed] Demo data seeded successfully:');
    console.log('   👤 Admin:   admin@talentbridge.com   | Password: admin123');
    console.log('   👩 Student: priya@example.com        | Password: password123');
    console.log('   👩 Student: meena@example.com        | Password: password123');
  } catch (error) {
    console.error('❌ [Seed] Error seeding demo data:', error);
  }
}
