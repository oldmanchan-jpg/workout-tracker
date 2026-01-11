
# Workout Tracker App (React + Vite + Supabase + Tailwind)

A mobile-first workout logging app with professional features for tracking your gym sessions. Built with modern web technologies for a smooth, fast user experience.

## ✨ Key Features

### 🏋️ Smart Workout Logging
- **Compact List View** - See all your sets at once without scrolling
- **Set Status Indicators** - Visual feedback for pending, in-progress, and completed sets
- **Auto-complete Sets** - Automatically pre-fills values from your previous set
- **RPE Tracking** - Log Rate of Perceived Exertion (1-10 scale) for each set

### ⏱️ Built-in Rest Timer
- **Per-Set Rest Timers** - Individual countdown timers for each completed set
- **Manual Controls** - Play, pause, and reset your rest timer as needed
- **Visual Alerts** - Timer changes color when time is running low or complete
- **Customizable Duration** - Adjust rest time to fit your workout needs

### 📊 Progress Tracking
- **Workout History** - View all your completed workouts
- **Volume Tracking** - See total volume (reps × weight) over time
- **Progress Charts** - Visual representation of your progress with Recharts
- **Exercise Library** - Browse and select from workout templates

### 🔐 Authentication
- Supabase Auth (Email/Password)
- Secure user sessions
- Per-user workout data isolation

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

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key

4. **Install and Run**
   ```bash
   npm install
   npm run dev
   ```

App runs at http://localhost:5173

## 📱 Mobile-First Design

This app is optimized for mobile use (99.9% of usage). The workout logging interface uses a **compact list view** that allows you to:
- See all sets without excessive scrolling
- Quickly log reps, weight, and RPE
- Track rest times between sets
- Navigate between exercises smoothly

Desktop view is primarily for template management and progress analysis.

## Scripts
- `npm run dev` — start local dev server
- `npm run build` — build for production
- `npm run preview` — preview built app
