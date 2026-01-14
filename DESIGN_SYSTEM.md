# 🎨 Workout Tracker - Design System v2.0

**Date:** January 14, 2026  
**Direction:** Sophisticated Athletic - Clean, modern, premium feel

---

## 🎯 Design Philosophy

### Aesthetic Direction
**"Sophisticated Athletic"** - A refined dark interface that feels premium and focused, not generic. Think Linear meets Nike Training Club.

### Core Principles
1. **Focus** - Remove distractions during workout
2. **Clarity** - Every element has clear purpose
3. **Premium** - Feels like a $10/month app, not a free tutorial
4. **Athletic** - Energetic accents, but not overwhelming

---

## 🎨 Color Palette

### Background System
```css
--bg-primary: #0a0a0b;      /* Near black - main background */
--bg-elevated: #141416;      /* Cards, elevated surfaces */
--bg-surface: #1c1c1f;       /* Interactive surfaces */
--bg-hover: #242428;         /* Hover states */
```

### Accent Colors
```css
--accent-primary: #22d3ee;   /* Cyan - primary actions */
--accent-secondary: #818cf8; /* Indigo - secondary elements */
--accent-success: #4ade80;   /* Green - completion, success */
--accent-warning: #fbbf24;   /* Amber - warnings, timer alerts */
--accent-danger: #f87171;    /* Red - errors, timer critical */
```

### Text Hierarchy
```css
--text-primary: #fafafa;     /* Primary text - headings */
--text-secondary: #a1a1aa;   /* Secondary text - labels */
--text-muted: #52525b;       /* Muted text - placeholders */
--text-accent: #22d3ee;      /* Accent text - highlights */
```

### Border & Dividers
```css
--border-subtle: #27272a;    /* Subtle borders */
--border-default: #3f3f46;   /* Default borders */
--border-focus: #22d3ee;     /* Focus rings */
```

---

## 📝 Typography

### Font Stack
```css
/* Display/Headlines - Character */
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body - Clean readability */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Mono - Timer, numbers */
font-family: 'JetBrains Mono', 'SF Mono', monospace;
```

### Scale (Mobile-First)
```css
--text-xs: 0.75rem;    /* 12px - Tiny labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Section headers */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Big numbers */
--text-4xl: 2.25rem;   /* 36px - Hero numbers (timer) */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 📐 Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

---

## 🔘 Component Styles

### Cards
```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: var(--space-4);
}

.card-interactive:hover {
  background: var(--bg-surface);
  border-color: var(--border-default);
}
```

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  color: #0a0a0b;
  font-weight: 600;
  padding: 14px 24px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  padding: 14px 24px;
  border-radius: 12px;
}
```

#### Success Button (Complete Set)
```css
.btn-success {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #0a0a0b;
  font-weight: 600;
}
```

### Input Fields

#### Active Input (Currently logging)
```css
.input-active {
  background: #1e293b;
  border: 2px solid #22d3ee;
  color: #fafafa;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 14px 8px;
  border-radius: 10px;
}

.input-active:focus {
  box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.2);
}
```

#### Disabled Input (Future sets)
```css
.input-disabled {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 16px;
  text-align: center;
  padding: 14px 8px;
  border-radius: 10px;
}
```

#### Completed Input
```css
.input-completed {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}
```

### Checkmark / Complete Button

#### Pending (Empty circle)
```css
.check-pending {
  width: 44px;
  height: 44px;
  border: 2px solid var(--border-default);
  border-radius: 50%;
}
```

#### Active (Ready to complete)
```css
.check-active {
  width: 44px;
  height: 44px;
  border: 3px solid #22d3ee;
  border-radius: 50%;
  background: rgba(34, 211, 238, 0.1);
}

.check-active:hover {
  background: rgba(34, 211, 238, 0.2);
  transform: scale(1.05);
}
```

#### Completed
```css
.check-completed {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-completed svg {
  color: #0a0a0b;
  width: 24px;
  height: 24px;
  stroke-width: 3;
}
```

---

## ⏱️ Timer Styles

### Default State
```css
.timer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 48px;
  font-weight: 700;
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: 24px;
  border-radius: 16px;
  text-align: center;
}
```

### Warning State (≤30s)
```css
.timer-warning {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}
```

### Critical State (≤10s)
```css
.timer-critical {
  color: #f87171;
  animation: pulse 1s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(248, 113, 113, 0.6);
}
```

### Complete State (0s)
```css
.timer-complete {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #0a0a0b;
}
```

---

## 📱 ActiveWorkout Specific

### Header (Replaces TopBar)
- Minimal: Back button (left) + Finish button (right)
- No navigation links during workout
- Workout name as subtle header

### Exercise Accordion
```css
.exercise-header {
  background: var(--bg-elevated);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exercise-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.exercise-progress {
  font-size: 14px;
  color: var(--text-secondary);
}

.exercise-completed .exercise-name {
  color: #4ade80;
}
```

### Set Table
- Minimum column widths enforced
- Checkmark column: min 56px (for 44px touch target + padding)
- Input columns: flex to fill space evenly
- Clear visual separation between sets

---

## 🚫 What We're Removing

1. **Generic orange** - Replaced with sophisticated cyan accent
2. **Gray-on-gray** - Better contrast throughout
3. **Small checkmarks** - Now 44px touch targets
4. **TopBar during workout** - Minimal header only
5. **Generic gradients** - Subtle, purposeful gradients only
6. **Mid-2000s icons** - Cleaner, simpler icon usage

---

## ✅ Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Hide TopBar during ActiveWorkout
- [ ] Fix checkmark column width (min 56px)
- [ ] Increase checkmark size to 44px
- [ ] Apply new color variables

### Phase 2: Component Updates
- [ ] Update input field styles
- [ ] Update button styles
- [ ] Update timer component
- [ ] Update card styles

### Phase 3: Page Refinements
- [ ] ActiveWorkout full redesign
- [ ] Dashboard refresh
- [ ] Progress page refresh
- [ ] Admin page refresh

---

## 🎨 Color Comparison

| Element | Old | New |
|---------|-----|-----|
| Background | `#111827` (gray-900) | `#0a0a0b` (near black) |
| Cards | `#1f2937` (gray-800) | `#141416` (elevated) |
| Primary Accent | `#f97316` (orange-500) | `#22d3ee` (cyan-400) |
| Success | `#22c55e` (green-500) | `#4ade80` (green-400) |
| Active Input | Gray bg | Slate bg + cyan border |
| Checkmark | 20px | 44px |

---

## 📱 Touch Targets

All interactive elements must be minimum 44x44px:
- Checkmark buttons: 44px
- Timer control buttons: 48px
- Input fields: 48px height
- Accordion headers: 56px height
