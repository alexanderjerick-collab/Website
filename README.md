# Jerick TM - School Management System

A full-featured school management website with authentication, task management, grades tracking, events calendar, and role-based access control.

## Tech Stack

- **Frontend:** React 18 + TailwindCSS 3 + React Router 6
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Email:** Nodemailer (optional)

## Features

### Authentication & Security
- Secure login and registration with JWT tokens
- Role-based access control (Student, Teacher, Administrator)
- Password recovery via email
- Protected routes on both frontend and backend

### Task Management
- Create, edit, delete, and mark tasks as completed
- Filter by status and priority
- Overdue task tracking
- Assigned to specific students

### Grades Management
- Record and display grades per student and subject
- Automatic letter grade calculation
- Score progress bars
- Filter by subject

### Events & Calendar
- List and calendar view modes
- Event types: events, deadlines, reminders, holidays
- Date range support
- Location tracking

### User Management
- Admin can manage all users
- Role changes and account activation/deactivation
- User search and filtering

### Additional Features
- Dark mode / Light mode toggle
- Real-time notifications
- Activity logs for administrators
- Responsive design (mobile-friendly)
- Custom 404 and 403 error pages
- Smooth animations and transitions

## Project Structure

```
jerick-tm/
├── backend/
│   ├── models/          # Mongoose models (User, Task, Grade, Event, etc.)
│   ├── routes/          # Express routes (auth, users, tasks, grades, events, etc.)
│   ├── middleware/       # Auth & authorization middleware
│   ├── utils/           # Logger, email utilities
│   ├── scripts/         # Database seed script
│   ├── server.js        # Express server entry point
│   ├── .env             # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Layout, Modal, NotificationBell, ProtectedRoute
│   │   ├── context/     # AuthContext, ThemeContext
│   │   ├── pages/       # All page components
│   │   ├── services/    # API service (axios)
│   │   ├── App.js       # Main app with routing
│   │   └── index.js     # Entry point
│   ├── tailwind.config.js
│   └── package.json
├── package.json         # Root scripts
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jericktm
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. Seed the Database

```bash
cd backend && npm run seed
```

This creates sample users, tasks, grades, and events.

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jericktm.com | admin123 |
| Teacher | sarah@jericktm.com | teacher123 |
| Teacher | michael@jericktm.com | teacher123 |
| Student | john@jericktm.com | student123 |
| Student | jane@jericktm.com | student123 |
| Student | alex@jericktm.com | student123 |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Tasks
- `GET /api/tasks` - List tasks (filtered by role)
- `POST /api/tasks` - Create task (teacher/admin)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (teacher/admin)

### Grades
- `GET /api/grades` - List grades
- `POST /api/grades` - Record grade (teacher/admin)
- `PUT /api/grades/:id` - Update grade (teacher/admin)
- `DELETE /api/grades/:id` - Delete grade (teacher/admin)

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (teacher/admin)
- `PUT /api/events/:id` - Update event (teacher/admin)
- `DELETE /api/events/:id` - Delete event (teacher/admin)

### Users
- `GET /api/users` - List users (teacher/admin)
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Activity Logs
- `GET /api/logs` - Get activity logs (admin only)

## Role Permissions

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Own Tasks | ✅ | ✅ | ✅ |
| Create/Edit/Delete Tasks | ❌ | ✅ | ✅ |
| Mark Task Complete | ✅ | ✅ | ✅ |
| View Own Grades | ✅ | ✅ | ✅ |
| Record/Edit Grades | ❌ | ✅ | ✅ |
| View Events | ✅ | ✅ | ✅ |
| Create/Edit Events | ❌ | ✅ | ✅ |
| View Users | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Activity Logs | ❌ | ❌ | ✅ |

## Design

- **Colors:** Black and white primary palette
- **Dark Mode:** Full dark mode support with system preference detection
- **Typography:** Inter font family
- **Responsive:** Mobile-first design, works on all screen sizes
- **Animations:** Fade-in, slide-in, slide-up transitions
