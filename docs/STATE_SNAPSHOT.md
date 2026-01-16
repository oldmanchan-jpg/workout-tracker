# Stack Snapshot

## 1) Framework/Runtime
**Vite** (v5.2.0) + **React** (v18.2.0)
- Evidence: `package.json` devDependencies shows `"vite": "^5.2.0"` and `"react": "^18.2.0"`
- Not Next.js, not Create React App
- Build tool: Vite with `@vitejs/plugin-react` v5.0.0
- TypeScript: v5.4.5

## 2) Dev/Build/Test Commands
From `package.json` scripts:
- `npm run dev` → `vite` (dev server)
- `npm run build` → `tsc -b && vite build` (TypeScript check + Vite build)
- `npm run preview` → `vite preview` (preview production build)
- No test script found

## 3) Router Type
**react-router-dom** v6.26.1
- Evidence: `package.json` dependencies shows `"react-router-dom": "^6.26.1"`
- Usage: `src/App.tsx` imports `BrowserRouter, Routes, Route, Navigate` from `react-router-dom`
- Router pattern: BrowserRouter wraps app, nested Routes with Outlet pattern via SwipeablePages component

## 4) Styling System
**Tailwind CSS** + **Custom CSS**
- Evidence: `tailwind.config.cjs` exists with HealthPulse theme colors (accent: `#29e33c`)
- Custom CSS: `src/index.css` (941 lines) with HealthPulse utility classes (`.hp-card`, `.hp-pill`, `.hp-glow`, etc.)
- Theme: Dark baseline (`#010101`, `#15181d`) + green accent (`#29e33c`)
- Additional: `src/styles/theme.css` exists (not examined in detail)

## 5) Polished UI Pages
Located in `src/pages/`:
- `Dashboard.tsx` (route: `/` or `/dashboard`)
- `ActiveWorkout.tsx` (route: `/workout`)
- `Progress.tsx` (route: `/progress`)
- `Settings.tsx` (route: `/settings`)
- `Admin.tsx` (route: `/admin`)
- Auth pages: `src/components/Auth/Login.tsx` (`/login`), `SignUp.tsx` (`/signup`)

## 6) TypeScript Path Alias
**`@` → `src`**
- Evidence from `vite.config.ts` line 10: `'@': path.resolve(__dirname, './src')`
- Evidence from `tsconfig.json` lines 18-21: `"paths": { "@/*": ["src/*"] }`
- Base URL: `tsconfig.json` line 17: `"baseUrl": "."`

## 7) Entry Points
- **HTML entry**: `index.html` (root level) → mounts to `#root`
- **JS entry**: `src/main.tsx` → renders `<App />` wrapped in `React.StrictMode`
- **App shell**: `src/App.tsx` → sets up `BrowserRouter`, `AuthProvider`, `ErrorBoundary`, and `AppRoutes`
- Routing logic: `App.tsx` defines all routes, uses `ProtectedRoute` wrapper, `SwipeablePages` provides layout/Outlet for nested routes
