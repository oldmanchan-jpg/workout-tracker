# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Type-check with tsc then build for production
npm run preview  # Preview production build locally
```

No test runner is configured in this project.

## Architecture Overview

This is a mobile-first React workout tracking app using Vite, TypeScript, Tailwind CSS v4, and Supabase for backend.

### Routing & Layout
- `App.tsx` defines all routes via react-router-dom
- `SwipeablePages` wraps authenticated routes and provides swipe navigation between Dashboard/Progress/Settings
- `ProtectedRoute` handles auth checks and redirects inactive clients to `PendingApproval`
- `/workout` route renders outside SwipeablePages for full-screen workout logging

### State & Auth
- `AuthContext` (contexts/AuthContext.tsx) wraps the app and exposes `useAuth()` hook for user/session state and auth methods
- `useProfile` hook (hooks/useProfile.ts) fetches user profile from Supabase `profiles` table and exposes `isAdmin`/`isClient` flags
- No global state library - component state and context only

### Data Layer
- `lib/supabase.ts` initializes the Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars
- `services/workoutService.ts` contains all workout CRUD operations against Supabase `workouts` table
- Workout data stored as JSONB in `exercises` column

### Styling System
- Tailwind CSS v4 with PostCSS (`postcss.config.cjs`, `tailwind.config.cjs`)
- Design tokens defined in `src/styles/theme.css` as CSS custom properties (--bg, --accent, --text, --border, etc.)
- Reusable UI components in `src/components/ui/` (Button, Card, Input, Avatar, IconButton, Pill, StatTile)
- UI components use CSS classes like `.ui-button`, `.ui-card`, `.ui-input` defined in theme.css
- Icons from lucide-react

### Path Aliases
- `@/*` maps to `src/*` (configured in tsconfig.json and vite.config.ts)

### Key Types
- `types.ts` defines core domain types: `ExerciseSet`, `ExerciseEntry`, `Workout`, `Template`
- `Profile` type in `hooks/useProfile.ts` with role-based access (admin/client)

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

Two main tables:
- `workouts`: id, user_id, workout_date, template_name, exercises (jsonb), total_volume, total_reps, notes, created_at
- `profiles`: id (FK to auth.users), email, full_name, role ('admin'|'client'), is_active, created_at, updated_at

RLS enabled - users can only access their own workouts.
