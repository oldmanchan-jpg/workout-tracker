# Workout Tracker App (React + Vite + Supabase + Tailwind)

A mobile-first workout logging app with professional features for tracking your gym sessions. Built with modern web technologies for a smooth, fast user experience.

## ✨ Key Features

### 🏋️ Smart Workout Logging
- **Accordion Layout** - All exercises visible on one page in collapsible cards
- **Auto-Collapse** - Exercises automatically collapse when all sets are completed
- **Set Status Indicators** - Visual feedback for pending, in-progress, and completed sets
- **Inline Input Forms** - Quick entry for weight, reps, and RPE directly in the table
- **Previous Set Reference** - See your previous set's weight and reps for easy progression
- **RPE Tracking** - Log Rate of Perceived Exertion (1-10 scale) for each set

### ⏱️ Built-in Rest Timer
- **Global Rest Timer** - Single timer for your entire workout session
- **Manual Controls** - Play, pause, and reset your rest timer as needed
- **Visual Alerts** - Timer changes color when time is running low or complete
- **Customizable Duration** - Adjust rest time to fit your workout needs

### 📊 Progress Tracking
- **Workout History** - View all your completed workouts with notes
- **Volume Tracking** - See total volume (reps × weight) over time
- **Progress Charts** - Visual representation of your progress with Recharts
- **Week Comparison** - Compare this week vs last week with percentage changes
- **Exercise Library** - Browse and select from workout templates

### 📱 Mobile-First Navigation
- **Swipe Navigation** - Swipe left/right between Dashboard and Progress pages
- **Page Indicators** - Visual dots showing your current page
- **Touch-Optimized** - All inputs sized for easy mobile interaction
- **No Horizontal Scroll** - Everything fits perfectly on mobile screens

### 🔐 Authentication & Access Control
- Supabase Auth (Email/Password)
- Secure user sessions
- Per-user workout data isolation
- **Pending Approval System** - Inactive clients see approval screen until activated by admin

## 🚀 Quick Start

### Prerequisites
- Node.js LTS (>=18)
- A Supabase account (free tier available)

### Setup Steps

1. **Create a Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Enable Email/Password authentication

2. **Set up Database**
   - Create a `workouts` table with the following schema:
     ```sql
     create table workouts (
       id uuid default uuid_generate_v4() primary key,
       user_id uuid references auth.users not null,
       workout_date timestamp with time zone not null,
       template_name text not null,
       exercises jsonb not null,
       total_volume numeric,
       total_reps integer,
       notes text,
       created_at timestamp with time zone default now()
     );
     ```
   
   - Create a `profiles` table for user roles:
     ```sql
     create table profiles (
       id uuid references auth.users primary key,
       email text not null,
       full_name text,
       role text check (role in ('admin', 'client')) default 'client',
       is_active boolean default false,
       created_at timestamp with time zone default now(),
       updated_at timestamp with time zone default now()
     );
     ```

3. **Configure Environment**
   - Copy `.env.example` to `.env` (if exists)
   - Add your Supabase URL and anon key:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Install and Run**
   ```bash
   npm install
   npm run dev
   ```

App runs at http://localhost:5173

## 📱 Mobile-First Design

This app is optimized for mobile use (99.9% of usage). The workout logging interface features:

- **Accordion Layout** - All exercises in a vertical list, expand/collapse as needed
- **No Pagination** - See and complete all exercises on one page
- **Touch-Friendly** - All inputs are properly sized for mobile interaction
- **Swipe Navigation** - Natural mobile gestures to navigate between pages
- **Proper Scaling** - Everything fits mobile screens without horizontal scrolling
- **Auto-Collapse** - Exercises collapse when complete, keeping focus on what's next

Desktop view is primarily for template management and progress analysis.

## 🎨 User Experience Highlights

- **One-Page Workout Flow** - Start to finish without navigating between exercises
- **Visual Progress** - See which exercises are complete at a glance
- **Quick Set Entry** - Log sets with minimal taps
- **Smart Defaults** - Previous set values pre-filled for easy progression
- **Workout Notes** - Add notes about how you felt during the session

## 📁 Project Structure
```
workout-tracker/
├── src/
│   ├── components/
│   │   ├── Auth/              # Login, SignUp
│   │   ├── PendingApproval.tsx # Inactive client screen
│   │   ├── SwipeablePages.tsx # Global swipe navigation
│   │   └── TopBar.tsx         # Navigation bar
│   ├── contexts/              # React Context (Auth)
│   ├── data/                  # Static data (templates)
│   ├── hooks/                 # Custom hooks (useProfile)
│   ├── lib/                   # External integrations (Supabase)
│   ├── pages/                 # Main views
│   │   ├── Dashboard.tsx      # Template selection
│   │   ├── ActiveWorkout.tsx  # Main workout logging UI
│   │   ├── Progress.tsx      # Progress tracking & charts
│   │   └── Admin.tsx          # Admin panel
│   ├── services/              # API/Database services
│   └── types.ts               # TypeScript definitions
├── dist/                      # Built files
└── [config files]
```

## 🗄️ Database Schema

### `workouts` Table
- `id`: uuid (PK)
- `user_id`: uuid (FK to auth.users)
- `workout_date`: timestamp
- `template_name`: text
- `exercises`: jsonb (array of exercise logs)
- `total_volume`: numeric
- `total_reps`: integer
- `notes`: text
- `created_at`: timestamp

### `profiles` Table
- `id`: uuid (FK to auth.users, PK)
- `email`: text
- `full_name`: text
- `role`: text ('admin' | 'client')
- `is_active`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

## Scripts
- `npm run dev` — start local dev server
- `npm run build` — build for production
- `npm run preview` — preview built app

## 🎯 Current Status

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

## 📝 Recent Updates

- **Accordion Workout Layout** - All exercises visible, collapsible cards
- **Global Swipe Navigation** - Swipe between Dashboard and Progress
- **Mobile Scaling Fixes** - Proper table layout, no horizontal scroll
- **Auto-Collapse Exercises** - Exercises collapse when all sets complete
- **Pending Approval Screen** - Inactive clients see approval message
