# Next Steps — Workout Tracker

**Last Updated**: 2026-01-16

## Priority 1: UI Polish

### BottomNav Spacing/Glow
- Fine-tune pill padding (`px-2 py-2` → adjust if needed)
- Refine glow intensity (`shadow-[0_10px_35px_rgba(0,0,0,0.55)]` → test variations)
- Verify active state indicator positioning and visibility
- Test on different screen sizes (iPhone SE, iPhone 14 Pro, etc.)

### Consistent Card Surfaces Across Pages
- Audit all pages: Dashboard, Progress, Settings, Admin, ActiveWorkout
- Ensure all cards use consistent background: `var(--bg-elevated)` or HealthPulse card classes
- Verify border radius consistency: `rounded-[24px]` or `rounded-3xl`
- Check hover states match across all cards

## Priority 2: Route Edge Cases

- Verify `/` → `/dashboard` alias works correctly
- Test all route transitions (especially with BottomNav)
- Ensure no route mismatches between BottomNav paths and App.tsx routes
- Test deep linking (direct URL navigation)

## Priority 3: Charts & Progress UI

### Recharts Styling
- Refine Progress page chart colors for dark theme
- Ensure tooltip styling matches HealthPulse design
- Verify gradient fills use `#29e33c` accent color
- Test chart responsiveness on mobile

### Progress UI Refinement
- Review stat tiles layout and spacing
- Ensure time range selector matches BottomNav styling
- Verify loading states match HealthPulse design
- Test empty states (no workouts)

## Do Not Add New Features

**⚠️ CRITICAL**: Do not add new features until UI baseline is stable.

Focus on:
1. Polish existing UI components
2. Fix inconsistencies
3. Verify all routes work correctly
4. Ensure design system is applied consistently

Only after UI baseline is stable should new features be considered.
