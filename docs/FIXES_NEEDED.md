# Acceptance Criteria Fixes Needed

## Critical Issues (Must Fix Before "Done")

### 1. Hardcoded Colors ❌
**Found in:**
- Dashboard: `bg-[#29e33c]` (exercise badge)
- Progress: `text-[#9a9fa4]`, `text-white` (multiple places)
- ActiveWorkout: `bg-[#29e33c]`, `text-[#29e33c]`, `border-white/10` (many places)
- Admin: `bg-[#29e33c]`, `bg-[#141416]`, `text-white`, `text-[#9a9fa4]`, `border-white/5` (many places)

**Fix:** Replace all with CSS variables from tokens

### 2. Button Consistency ❌
**Found in:**
- Progress: Time range tabs use `motion.button` with inline styles
- Settings: Preset buttons use `motion.button` with inline styles
- ActiveWorkout: Multiple `motion.button` instances with custom styling
- Admin: Toggle buttons use `motion.button` with custom styling

**Fix:** Use `Button` component or create proper variants

### 3. Component Usage ❌
**Found in:**
- Admin: Not using `Card` component (hardcoded `bg-[#141416]` with borders)
- ActiveWorkout: Not using `Card` component consistently

**Fix:** Replace with `Card` component

### 4. Borders ❌
**Found in:**
- Admin: `border border-white/5` everywhere
- ActiveWorkout: `border-white/10` in multiple places

**Fix:** Remove borders, use elevation instead

---

## Fix Priority

1. **Admin Page** - Complete refactor needed
2. **ActiveWorkout** - Major refactor needed
3. **Dashboard** - Minor fixes (exercise badge color)
4. **Progress** - Minor fixes (remaining hardcoded colors)
5. **Settings** - Button consistency

---

## Estimated Fixes

### Admin Page
- Replace all `bg-[#141416]` with `Card` component
- Replace all `border border-white/5` with elevation
- Replace all hardcoded colors with tokens
- Replace custom buttons with `Button` component

### ActiveWorkout
- Replace hardcoded colors with tokens
- Use `Card` component for sections
- Use `Button` component for actions
- Remove excessive borders

### Dashboard
- Fix exercise badge: `bg-[#29e33c]` → `var(--accent)`
- Fix tip card icon background: `bg-[#29e33c]/20` → `rgba(41, 227, 60, 0.2)` or token

### Progress
- Replace remaining `text-[#9a9fa4]` with `var(--text-muted)`
- Replace `text-white` with `var(--text)`

### Settings
- Consider creating Button variant for presets/tabs
- Or document that these are acceptable exceptions
