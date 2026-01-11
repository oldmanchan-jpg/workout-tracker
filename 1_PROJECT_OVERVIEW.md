# 📋 Project Overview: Workout Tracker App

**Last Updated:** January 11, 2026, 12:42 PM

---

## 🎯 Project Goal
Build a **mobile-first workout tracking application** that allows users to:
- Log workouts with detailed set/rep/weight data
- Track RPE (Rate of Perceived Exertion) for progressive overload
- Use built-in rest timers for optimal recovery
- View progress over time with charts and analytics
- Access pre-built workout templates

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

---

## 🎨 Design Philosophy
1. **Mobile-First:** Every feature optimized for one-handed mobile use
2. **Speed:** Minimal taps/scrolls to log a workout
3. **Visual Clarity:** Clear status indicators and feedback
4. **Functional:** Form follows function - no unnecessary decoration
5. **Offline-Ready:** (Future consideration)

---

## 📊 Current Status
**Phase:** MVP Development - Core Features Complete ✅
- ✅ Authentication system
- ✅ Workout template library
- ✅ Active workout logging (Compact List View)
- ✅ Progress tracking and charts
- ✅ RPE tracking
- ✅ Rest timer system
- 🚧 Advanced features (see roadmap)

---

## 🔑 Core Features

### Workout Logging (Compact List View)
- All sets visible in a single scrollable list
- Per-set status indicators (pending/in-progress/completed)
- Inline input forms for reps, weight, and RPE
- Auto-complete from previous set
- Individual rest timers per set with manual controls

### Progress Tracking
- Historical workout data
- Volume tracking (reps × weight)
- Progress charts with date ranges
- Exercise-specific history

### Template System
- Pre-built workout templates
- Custom template creation (future)
- Quick-start from library

---

## 📁 Project Structure
```
workout-tracker/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Auth/         # Login, SignUp
│   │   └── TopBar.tsx    # Navigation
│   ├── contexts/         # React Context (Auth)
│   ├── data/            # Static data (templates)
│   ├── lib/             # External integrations (Supabase)
│   ├── pages/           # Main views
│   │   ├── Dashboard.tsx
│   │   ├── ActiveWorkout.tsx  # Main workout logging UI
│   │   ├── Library.tsx
│   │   └── Progress.tsx
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
