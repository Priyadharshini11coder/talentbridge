# TalentBridge – Internship & Workforce Tracking Platform

A complete, full-stack, production-ready web application built to streamline internship management, attendance tracking, task assignment, deliverable reviews, daily progress reports, and dynamic performance evaluation.

---

## 🎨 Visual Reference & Design System

The application has been designed following the user's uploaded reference screenshots:
* **Background Palette**: Deep navy / black (`#080c16`, `#0b1120`, `#111827`)
* **Signature Accents**:
  * **Brand Purple** (`#9333ea` / `#8b5cf6`): Logo, Primary actions ("Get Started", "Submit Work", "Save Changes", active nav items)
  * **Electric Blue** (`#2563eb`): Attendance feature card and Attendance stat card
  * **Emerald Green** (`#16a34a` / `#10b981`): Task Management feature card, Task stat card, Landing Signup button
  * **Rose Red** (`#ef4444`): Top navigation "Logout" button
* **Typography & Details**:
  * High-contrast crisp typography with bold headers and friendly emojis (`👋`, `🚀`, `👤`, `📝`, `📊`, `📅`, `🎯`)
  * Smooth `rounded-2xl` cards with dark input styling (`bg-[#1c2638]`)
  * Fully responsive across desktop, tablet, and mobile devices (with mobile drawer navigation).

---

## 🚀 Live Demo Credentials

Use the **1-Click Quick Demo Login** buttons on the login page or enter credentials manually:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student / Intern** | **Priyadharshini** | `priya@example.com` | `password123` |
| **Student / Intern** | **Meenarevathi** | `meena@example.com` | `password123` |
| **Administrator** | **Dr. Ramesh Kumar** | `admin@talentbridge.com` | `admin123` |

---

## 📑 Complete Page Inventory (15 Pages)

### Public Pages
1. **Landing Page (`/`)**: Hero section, "Get Started" & "Login" buttons, 3 colored feature cards (Blue Attendance, Green Tasks, Purple Analytics), Target Audience, 1-Click Demo Launcher, and footer.
2. **Login Page (`/login`)**: Role toggle (Student/Admin), 1-click quick demo buttons, password eye visibility toggle, and error validation.
3. **Signup Page (`/signup`)**: Replicates screenshot 1 with `Create Account 🚀`, full intern registration fields, and purple `Signup` button.

### Student Pages
4. **Student Dashboard (`/student/dashboard`)**: Replicates screenshot 3 with `Welcome Back 👋`, Blue Attendance stat, Green Tasks Submitted stat, Purple Performance Score, and `Recent Updates` card.
5. **Attendance (`/student/attendance`)**: Metrics (Working Days, Present, Absent, Late, %), 1-click Check In / Check Out, and full attendance history table.
6. **Tasks (`/student/tasks`)**: Replicates screenshot 5 with vibrant purple `Today's Work 📝` submission box, link inputs, and `Submitted Tasks` review feed.
7. **Daily Reports (`/student/reports`)**: Daily progress submission form (Work completed, Skills learned, Challenges, Tomorrow's plan) and timeline history.
8. **Performance (`/student/performance`)**: Dynamically computed score breakdown (35% Attendance + 40% Tasks + 25% Reports), circular gauge, and scoring formula.
9. **Profile (`/student/profile`)**: Replicates screenshot 4 with `Student Profile 👤`, editable user details, standing summary, and purple `Save Changes` button.

### Admin Pages
10. **Admin Dashboard (`/admin/dashboard`)**: 6 key metric cards, attendance distribution bar chart, deliverables status graph, and live system activity feed.
11. **Intern Management (`/admin/interns`)**: Searchable intern data table, status toggle, Add Intern modal, Edit Intern modal, and detailed intern dossier.
12. **Attendance Management (`/admin/attendance`)**: Date & intern filters, attendance log table, and Mark Intern Attendance modal.
13. **Task Management (`/admin/tasks`)**: Create & assign tasks with due date & priority, plus the Submissions Review Queue to approve deliverables with feedback.
14. **Report Management (`/admin/reports`)**: Comprehensive feed of all intern daily progress reports with date & intern filters.
15. **Performance Management (`/admin/performance`)**: Dynamic intern ranking leaderboard calculated automatically with drill-down modals.

---

## ⚙️ Tech Stack & Architecture

* **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide React, Axios, React Router 7.
* **Backend**: Node.js, Express.js, JWT, bcryptjs, Morgan, CORS, Dotenv.
* **Database**: MongoDB / Mongoose with an automatic fail-safe embedded persistence engine (`local_db.json`) ensuring 100% zero-configuration uptime!

---

## 🏃 Running the Application

Both servers are currently active:
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

To start manually in the future:
```bash
# Start backend
cd server
npm start

# Start frontend (in a separate terminal)
cd client
npm run dev
```
