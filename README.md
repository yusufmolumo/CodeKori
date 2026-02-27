# CodeKori 🚀

**CodeKori** is a full-stack gamified coding education platform built to empower university students through structured courses, interactive coding challenges, mentorship, and a vibrant community. With XP-based progression, daily streaks, leaderboards, and real-time notifications, CodeKori delivers a premium, engaging learning experience.

- **GitHub Repository**: <a href="https://github.com/yusufmolumo/CodeKori" target="_blank">https://github.com/yusufmolumo/CodeKori</a>
- **Video Demo**: <a href="https://drive.google.com/file/d/1WaVCgXYFCRrm6LsQVaRwhPKfD8nLTv75/view?usp=sharing" target="_blank">https://drive.google.com/file/d/1WaVCgXYFCRrm6LsQVaRwhPKfD8nLTv75/view?usp=sharing</a>

---

## ✨ Features

### 📚 Learning & Courses
- **Structured Learning Paths** — 30+ lessons across HTML, CSS, and JavaScript with modular course structure.
- **Lesson Progress Tracking** — Mark lessons as complete, earn XP, and track progress per course.
- **Course Enrollment** — Enroll in courses and resume where you left off.

### 💻 Coding Challenges
- **Interactive Code Editor** — Integrated editor with real-time feedback, hints, and test-case validation.
- **Difficulty Levels** — Challenges ranging from beginner to advanced.
- **Mentor-Created Challenges** — Mentors can create and manage custom challenges for learners.

### 🧪 Skill Lab
- **Gamification Hub** — Interactive skill-building activities and exercises.
- **Hands-on Practice** — Reinforced learning through practical coding tasks.

### 🏆 Gamification & Progression
- **XP System** — Earn XP for completing lessons, challenges, and community participation.
- **Leveling** — Automatic level progression based on accumulated XP.
- **Daily Streaks** — Maintain consecutive day streaks to stay motivated.
- **Leaderboard** — Compete with fellow learners on a global leaderboard.

### 🤝 Mentorship System
- **Mentor Discovery** — Learners can browse available mentors and send connection requests.
- **Request Management** — Mentors can accept or decline mentee requests.
- **Connected Mentor View** — Learners see their active mentor with a "Connected" badge.
- **Private Chat** — Real-time 1-on-1 messaging between mentors and mentees.
- **Mentee Management** — Mentors can remove mentees with confirmation dialog and automatic notification.
- **Unread Message Badges** — Red badges on sidebar and individual chat buttons showing unread message counts; badges clear when the chat is opened.
- **Mentor Dashboard** — Mentors get mentee stats including courses enrolled, challenges completed, and XP.

### 💬 Community Forum
- **Discussion Board** — Create and browse posts, share solutions, and ask questions.
- **Categories** — Organized forum categories for different topics.
- **Comments & Likes** — Engage with posts through comments and reactions.
- **New Post Notifications** — All users are notified when new posts are shared.

### 🔔 Notification System
- **Email Notifications** — Real emails sent via Gmail SMTP (NodeMailer) for:
  - Mentorship requests, accepts, and removals
  - Chat messages
  - New community posts
  - Course enrollment and lesson completion
- **In-App Toast Popups** — Real-time popup notifications (Sonner) that appear in the top-right:
  - Polls every 30 seconds for new notifications
  - Each toast includes a "View" action button
  - Only shows genuinely new notifications (not on page load)
- **Bell Icon Dropdown** — Notification center in the header with unread count badge.
- **Configurable Preferences** — Toggle email and in-app notifications independently in Settings.

### ⚙️ Settings
- **Notification Preferences** — Toggle email and in-app notifications on/off with instant persistence.
- **Password Change** — Secure password change with current password verification.
- **Theme Switching** — Light, Dark, and System theme modes via `next-themes`.

### 🔍 Global Search
- **Instant Search** — Find courses and challenges with real-time search results in the header.

### 🛡️ Authentication & Security
- **JWT Authentication** — Secure access and refresh token system.
- **Role-Based Access** — Learner, Mentor, and Admin roles with route-level authorization.
- **Password Reset** — Email-based password reset flow.

### 👤 User Profiles
- **Profile Management** — Edit username, full name, bio, and avatar.
- **Avatar Upload** — Image uploads via Cloudinary.

### 🛠️ Admin Panel
- **User Management** — Admin-only dashboard for managing platform users.

---

## 🎨 Design & Architecture

Visual designs and architecture diagrams can be found in the `designs/` folder.

| Asset | Description |
| :--- | :--- |
| ![Mockup](./designs/figma_mockup1.png) | **Figma Mockups**: High-fidelity wireframes and UI designs. |
| ![Interface](./designs/dashboard_screenshot.png) | **Platform UI**: Screenshots of the dashboard and interactive components. |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React, Tailwind CSS, Shadcn UI, Lucide React, Sonner (toasts), next-themes |
| **Backend** | Node.js, Express, TypeScript, Socket.io |
| **Database** | CockroachDB (PostgreSQL-compatible), Prisma ORM |
| **Email** | NodeMailer (Gmail SMTP) |
| **Media** | Cloudinary (image hosting) |
| **Auth** | JWT (access + refresh tokens), bcrypt |

---

## 📁 Project Structure

```
codekori/
├── backend/
│   ├── prisma/              # Database schema & seed data
│   ├── src/
│   │   ├── controllers/     # Route handlers (12 controllers)
│   │   │   ├── authController.ts
│   │   │   ├── courseController.ts
│   │   │   ├── challengeController.ts
│   │   │   ├── mentorshipController.ts
│   │   │   ├── forumController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── gamificationController.ts
│   │   │   ├── gamificationHubController.ts
│   │   │   ├── userController.ts
│   │   │   ├── searchController.ts
│   │   │   ├── adminController.ts
│   │   │   └── uploadController.ts
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic services
│   │   │   ├── emailService.ts         # Email notifications (NodeMailer)
│   │   │   ├── gamificationService.ts  # XP, levels, streaks
│   │   │   ├── cloudinaryService.ts    # Image uploads
│   │   │   └── socketService.ts        # Real-time websockets
│   │   ├── middleware/       # Auth & authorization middleware
│   │   ├── config/           # Prisma client config
│   │   └── utils/            # Utility helpers
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx              # Main dashboard
│   │   │   │   ├── courses/              # Course listing & details
│   │   │   │   ├── challenges/           # Coding challenges
│   │   │   │   ├── mentorship/           # Mentorship + chat
│   │   │   │   ├── community/            # Forum
│   │   │   │   ├── leaderboard/          # Rankings
│   │   │   │   ├── skill-lab/            # Gamification hub
│   │   │   │   ├── settings/             # User settings
│   │   │   │   ├── profile/              # User profile
│   │   │   │   ├── mentor-home/          # Mentor dashboard
│   │   │   │   ├── mentor-courses/       # Mentor course management
│   │   │   │   └── mentor-challenges/    # Mentor challenge management
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Header
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── theme-provider.tsx
│   │   │   └── toaster-provider.tsx
│   │   ├── context/          # Socket context
│   │   └── lib/              # API client, utilities
│   └── .env.local            # Frontend environment variables
└── designs/                  # Figma mockups & screenshots
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A CockroachDB instance (or any PostgreSQL-compatible database)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yusufmolumo/CodeKori.git
   cd CodeKori
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   # Database
   DATABASE_URL=your_cockroachdb_url

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret

   # Email (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   FROM_EMAIL=your_email@gmail.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Server
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```

   Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

   Start the dev server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

   Start the dev server:
   ```bash
   npm run dev
   ```

4. **Access the app** at `http://localhost:3000`

---

## 🔌 API Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `POST /register`, `POST /login`, `PUT /change-password`, `POST /reset-password` | Registration, login, password management |
| **Courses** | `GET /courses`, `POST /courses/:id/enroll`, `POST /courses/lessons/:id/complete` | Course listing, enrollment, progress |
| **Challenges** | `GET /challenges`, `POST /challenges/:id/submit` | Coding challenges with test-case validation |
| **Mentorship** | `POST /mentorship/request`, `GET /mentorship/my-mentor`, `GET /mentorship/mentees`, `DELETE /mentorship/mentees/:id` | Mentor connections, management |
| **Chat** | `GET /mentorship/chat/:userId`, `POST /mentorship/chat/:userId`, `POST /mentorship/chat/:userId/read` | Private messaging, read receipts |
| **Forum** | `GET /forum/posts`, `POST /forum/posts`, `POST /forum/posts/:id/comments` | Community discussion |
| **Notifications** | `GET /notifications`, `POST /notifications/:id/read`, `GET /mentorship/chat/unread-counts` | Alerts, unread counts |
| **Preferences** | `GET /notification-preferences`, `PUT /notification-preferences` | Email & in-app toggles |
| **Search** | `GET /search?q=` | Global search across courses and challenges |
| **Users** | `GET /users/profile`, `PUT /users/profile`, `GET /users/mentors` | Profile management |
| **Leaderboard** | `GET /gamification/leaderboard` | XP rankings |
| **Admin** | `GET /admin/users` | User management (admin only) |

---

## 🚢 Deployment

### Recommended Stack
| Service | Provider |
|---------|----------|
| Frontend | Vercel |
| Backend API | Render |
| Database | CockroachDB Serverless |
| Media | Cloudinary |

### CI/CD Workflow
1. **Lint & Type-check**: `npm run lint` and `tsc`
2. **Build**: `npm run build` for production bundles
3. **Migrate**: Run Prisma migrations on the production database
4. **Deploy**: Push to `main` to trigger automatic builds

---

## 📄 License

This project is licensed under the MIT License.
