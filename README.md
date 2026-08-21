# TaskPulse — Team Hourly & Daily Work Report Tracker

A modern, full-stack web application designed for teams to log hourly task counts, assign them to projects, view live daily work summaries, and provide administrators with detailed hourly matrix views, daily work reports, inline editing, and CSV exports.

---

## ✨ Features

### 1. 👥 Team Member Portal
- **Date & Profile Selector**: Easily pick your profile and switch between today, yesterday, or custom dates.
- **Hourly Task Logger (8 AM – 8 PM + Custom Slots)**:
  - Select **Project Name** from the catalog or assign new tasks.
  - Set **No. of Tasks Done** using direct inputs or `+` / `-` quick steppers.
  - Add **Work Descriptions / Notes** for granular task breakdown.
  - Set **Task Status** (`Completed`, `In Progress`, `Blocked`).
  - **Inline Editing & Instant Updates**: Save, edit, or adjust any hourly log entry with immediate confirmation.
- **Daily Summary Widget**:
  - Live Total Tasks Completed today.
  - Total working hours logged and average task velocity (tasks/hour).
  - Visual **Hourly Task Velocity Chart** displaying output trends throughout the day.
  - **Project Breakdown** badges showing tasks per project.

### 2. 🛡️ Admin Portal & Reports
- **Executive Overview Dashboard**:
  - Key Performance Indicators (KPIs): Total Tasks Done, Active Team Members, Average Velocity, Top Focus Project.
  - Team Hourly Velocity Trend chart and Project Workload Distribution.
  - Team Productivity Leaderboard ranking top contributors.
- **Hourly Work Report (Matrix & Detailed Table)**:
  - **Interactive Matrix View**: Hour-by-hour grid showing all team members side-by-side with color-coded task intensities.
  - **Detailed Log Feed**: Searchable and filterable by member, project, and status.
  - **Admin Edit Privilege**: Click any cell or edit button to modify project, task count, date, hour slot, or notes in the **Edit Task Modal**.
  - **Delete & Clean Actions**: Remove mistaken entries with confirmation.
- **Daily Work Report**:
  - Member-wise summary table: Date, Member Name, Total Tasks, Hours Worked, Velocity (Tasks/Hr), and Project Breakdown chips.
  - Day rating badge (`High Output`, `Good Progress`, `Light Load`).
- **One-Click CSV Export**:
  - Download full **Hourly Work Reports** as CSV.
  - Download aggregated **Daily Work Reports** as CSV.
- **Team & Project Management**:
  - **Team Management**: Add new team members, assign departments, roles, and avatar colors.
  - **Project Catalog**: Create new projects with codes (e.g., `PHX-01`), color tags, and descriptions.

---

## 🚀 How to Run the Website

### Option A: Run the Combined Server (Frontend + Backend on Port 5000)
```bash
# 1. Navigate to the server folder
cd server

# 2. Start the server
npm start
```
Open **`http://localhost:5000`** in your browser.

---

### Option B: Run in Development Mode (with Hot Reloading)
```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm start

# Terminal 2 - Frontend Vite Dev Server (Port 3000)
cd client
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express, CORS
- **Database**: Persistent JSON / SQLite Engine with seed data and auto-aggregations
