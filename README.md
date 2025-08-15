
# Workout App Starter (React + Vite + Firebase + Tailwind)

Clean, beginner-friendly starter for a workout logging app featuring:
- Firebase Auth (Google + Email/Password)
- Firestore data model for templates and workouts
- Progress visualization with Recharts
- Mobile-first UI with Tailwind

## Quick Start

1) Install Node LTS (>=18).
2) Create a Firebase project at https://console.firebase.google.com
3) Enable Authentication (Email/Password + Google), create a Firestore database (in **test mode** for local dev).
4) Copy `.env.example` to `.env` and fill in your Firebase config values.
5) Install deps and run:
```bash
npm install
npm run dev
```
App runs at http://localhost:5173

## Firestore Rules (basic)
See `firebase.rules`. For production, harden as needed.

## Scripts
- `npm run dev` — start local dev server
- `npm run build` — build for production
- `npm run preview` — preview built app
