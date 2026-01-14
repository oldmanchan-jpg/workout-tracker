# 📋 Project Overview: Workout Tracker App

**Last Updated:** January 14, 2026

---

## 🎯 Project Goal
Build a **mobile-first workout tracking application** that allows users to:
- Log workouts with detailed set/rep/weight data
- Track RPE (Rate of Perceived Exertion) for progressive overload
- Use built-in rest timers for optimal recovery
- View progress over time with charts and analytics
- Access pre-built workout templates
- Navigate naturally with swipe gestures

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend & Database
- **Supabase** for authentication and database
- PostgreSQL (via Supabase)
- Row Level Security for data isolation

### Deployment
- Static hosting (Netlify/Vercel recommended)
- GitHub for version control

---

## 👥 Target Users
- **Primary:** Mobile users (99.9% of usage)
- Gym-goers who want fast, efficient workout logging
- Users who track progressive overload and RPE
- People following structured workout programs
- **Trainers** managing multiple clients (admin role)

---

## 🎨 Design Philosophy
1. **Mobile-First:** Every feature optimized for one-handed mobile use
2. **Speed:** Minimal taps/scrolls to log a workout
3. **Visual Clarity:** Clear status indicators and feedback
4. **Functional:** Form follows function - no unnecessary decoration
5. **Natural Gestures:** Swipe navigation feels native
6. **Progressive Disclosure:** Show what's needed, hide what's done

---

## 📊 Current Status
**Phase:** MVP Complete ✅
- ✅ Authentication system with role-based access
- ✅ Workout template library
- ✅ Active workout logging (Accordion Layout)
- ✅ Progress tracking and charts
- ✅ RPE tracking
- ✅ Rest timer system
- ✅ Mobile-first responsive design
- ✅ Swipe navigation between pages
- ✅ Pending approval system for inactive clients
- 🚧 Admin features (see roadmap)

---

## 🔑 Core Features

### Workout Logging (Accordion Layout)
- **All exercises visible** on one page in vertical list
- **Collapsible exercise cards** - expand/collapse as needed
- **Auto-collapse** - Exercises collapse when all sets are completed
- **Per-set status indicators** (pending/in-progress/completed)
- **Inline input forms** for reps, weight, and RPE
- **Previous set reference** - See last set's values
- **Global rest timer** with manual controls
- **No pagination** - Complete entire workout on one page

### Progress Tracking
- Historical workout data
- Volume tracking (reps × weight)
- Progress charts with date ranges (last 10 workouts)
- Week-over-week comparison with percentage changes
- Exercise-specific history
- Total stats (workouts, reps, volume, averages)

### Template System
- Pre-built workout templates
- Quick-start from library
- Template preview before starting
- Custom template creation (future - admin only)

### Navigation
- **Swipe gestures** - Swipe left/right between Dashboard and Progress
- **Page indicators** - Visual dots showing current page
- **Touch-optimized** - All interactions sized for mobile
- **No horizontal scroll** - Everything fits mobile viewport

### Access Control
- **Role-based access** - Admin vs Client roles
- **Pending approval** - Inactive clients see approval screen
- **Secure data isolation** - Each user only sees their own workouts

---

## 📁 Project Structure
```
workout-tracker/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Auth/         # Login, SignUp
│   │   ├── PendingApproval.tsx  # Inactive client screen
│   │   ├── SwipeablePages.tsx   # Global swipe navigation wrapper
│   │   └── TopBar.tsx    # Navigation bar (mobile/desktop)
│   ├── contexts/         # React Context (Auth)
│   ├── data/            # Static data (templates)
│   ├── hooks/           # Custom hooks (useProfile)
│   ├── lib/             # External integrations (Supabase)
│   ├── pages/           # Main views
│   │   ├── Dashboard.tsx      # Template selection & start
│   │   ├── ActiveWorkout.tsx  # Main workout logging UI (Accordion)
│   │   ├── Progress.tsx       # Progress tracking & charts
│   │   └── Admin.tsx          # Admin panel
│   ├── services/        # API/Database services
│   └── types.ts         # TypeScript definitions
├── dist/                # Built files
└── [config files]
```

---

## 🗄️ Database Schema

### `workouts` Table
```sql
- id: uuid (PK)
- user_id: uuid (FK to auth.users)
- workout_date: timestamp
- template_name: text
- exercises: jsonb (array of exercise logs)
- total_volume: numeric
- total_reps: integer
- notes: text
- created_at: timestamp
```

### `profiles` Table
```sql
- id: uuid (FK to auth.users, PK)
- email: text
- full_name: text
- role: text ('admin' | 'client')
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
```

### Exercise Log Structure (JSONB)
```json
{
  "name": "Bench Press",
  "sets": [
    { "reps": 12, "weight": 45, "rpe": 7 },
    { "reps": 10, "weight": 50, "rpe": 8 }
  ]
}
```

---

## 🎯 Success Metrics
- **Speed:** Log a full workout in under 3 minutes
- **Accuracy:** No missed data due to UI confusion
- **Retention:** Users return for every workout session
- **Mobile UX:** 95%+ satisfaction on mobile devices
- **Navigation:** Zero confusion about where to go next
- **Completion Rate:** Users complete workouts without abandoning

---

## 🚀 Key Differentiators

1. **Accordion Layout** - Unlike other apps that paginate exercises, we show everything at once
2. **Auto-Collapse** - Exercises disappear when done, keeping focus on what's next
3. **Swipe Navigation** - Natural mobile gestures for page navigation
4. **Mobile-First** - Built specifically for mobile, desktop is secondary
5. **No Horizontal Scroll** - Everything fits perfectly on mobile screens
6. **Role-Based Access** - Support for trainers managing clients