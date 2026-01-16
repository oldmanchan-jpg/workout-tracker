# Handover — Workout Tracker

**Last Updated**: 2026-01-16

## Current Status Summary

### What Is Done
- ✅ Tailwind CSS v4 installed and compiling
- ✅ BottomNav single source of truth enforced (duplicate deleted)
- ✅ BottomNav redesigned: centered glass pill with horizontal grid layout
- ✅ Global link styling: no underlines, no purple visited states
- ✅ Page wrappers normalized: `max-w-[420px] px-4 pb-28 pt-4`
- ✅ TopBar cleaned: removed redundant nav icons
- ✅ Route alignment verified: `/workout` tab matches route

### What Needs Work
- ⚠️ BottomNav spacing/glow polish (fine-tuning needed)
- ⚠️ Card surface consistency audit across all pages
- ⚠️ Progress charts (Recharts) styling refinement for dark theme
- ⚠️ Route edge case verification (`/` → `/dashboard` alias)

## Design Constraints

### HealthPulse Style
- **Theme**: Dark theme only
- **Accent Color**: `#29e33c` (green)
- **Background**: Dark gradients (`#0b0d10` → `#0f1115`)
- **Cards**: Glass morphism with `rgba(20,22,26,0.72)` backgrounds
- **Typography**: Inter for body, Poppins for display
- **Spacing**: Mobile-first, max-width `420px` for content

### Color Tokens
- Primary accent: `#29e33c`
- Text primary: `rgba(255, 255, 255, 0.92)`
- Text muted: `rgba(255, 255, 255, 0.65)`
- Background: `var(--bg)` from `src/styles/theme.css`
- Surface: `var(--surface)` from `src/styles/theme.css`

## Navigation System

### BottomNav Only
- **Location**: `src/components/BottomNav.tsx`
- **Layout**: Fixed bottom, centered glass pill
- **Tabs**: Dashboard, Progress, Workout, Settings, Admin (conditional)
- **Active State**: Green (`#29e33c`) color + underline bar
- **No Top Navigation**: TopBar contains only logo and logout

### Routes
- `/` → Dashboard (alias)
- `/dashboard` → Dashboard
- `/progress` → Progress
- `/workout` → ActiveWorkout
- `/settings` → Settings
- `/admin` → Admin (admin only)

## Tailwind Status

### Installed & Compiling
- **Version**: v4.1.18
- **Config**: `tailwind.config.cjs`
- **PostCSS**: `postcss.config.cjs` with `@tailwindcss/postcss`
- **Directives**: Added to `src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

### How to Confirm Tailwind is Working
1. Run `npm run build`
2. Open `dist/assets/index-*.css`
3. Search for Tailwind classes (e.g., `.flex`, `.grid`, `.text-white`)
4. If classes exist, Tailwind is compiling correctly

## Commands

```powershell
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Git Expectations

### One Source of Truth
- **No duplicate components**: If a component exists, there should be only ONE file
- **Delete unused files**: Remove any duplicate or orphaned component files
- **Verify imports**: Ensure all imports point to the correct single source

### File Organization
- Components: `src/components/`
- Pages: `src/pages/`
- Styles: `src/styles/` (theme tokens), `src/index.css` (global styles)
- Services: `src/services/`
- Hooks: `src/hooks/`

### Before Committing
1. Verify no duplicate components exist
2. Run `npm run build` to ensure Tailwind compiles
3. Test in browser: verify BottomNav renders correctly
4. Check routes: verify all navigation works

## Key Files

- `src/components/BottomNav.tsx` - Single source of truth for navigation
- `src/components/TopBar.tsx` - Header (logo + logout only)
- `src/index.css` - Global styles + Tailwind directives
- `src/styles/theme.css` - Design tokens
- `tailwind.config.cjs` - Tailwind configuration
- `postcss.config.cjs` - PostCSS configuration
