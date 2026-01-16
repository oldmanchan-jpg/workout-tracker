# Acceptance Criteria Audit

## Status: ⚠️ IN PROGRESS

### 1. Visual Hierarchy

#### Dashboard ✅
- ✅ Clear title → subtitle → key metric → secondary content
- ✅ One primary CTA (Start Workout button) visually dominant
- ✅ Welcome card is prominent variant
- ✅ Stats cards are secondary

#### Progress ⚠️
- ✅ Clear title (date) → subtitle (Today)
- ⚠️ Time range tabs could be clearer hierarchy
- ✅ Main stats card is visually dominant
- ✅ Secondary cards are subordinate

#### Settings ✅
- ✅ Clear section headers
- ✅ One primary CTA (Save button)
- ✅ Form controls are subordinate

#### ActiveWorkout ❌ NEEDS AUDIT
- ⚠️ Need to verify hierarchy

#### Admin ❌ NEEDS AUDIT
- ⚠️ Need to verify hierarchy

---

### 2. Spacing & Layout

#### Current Token Scale ✅
- ✅ `--space-1` (4px) through `--space-12` (48px)
- ✅ Consistent scale defined

#### Dashboard ⚠️
- ✅ Uses `space-y-4` (16px) for card spacing
- ✅ Uses `p-5` (20px) and `p-6` (24px) for card padding
- ⚠️ Some hardcoded spacing: `gap-3`, `gap-4`, `mb-2`, `mb-4`
- ✅ Max width: `max-w-[420px]`

#### Progress ⚠️
- ✅ Uses `space-y-6` (24px) for card spacing
- ⚠️ Some hardcoded spacing: `gap-2`, `gap-4`, `pt-4`
- ✅ Max width: `max-w-lg`

#### Settings ⚠️
- ✅ Uses `space-y-6` (24px) for card spacing
- ⚠️ Some hardcoded spacing: `gap-2`, `gap-3`, `mb-4`
- ✅ Max width: `max-w-lg`

#### ActiveWorkout ❌ NEEDS AUDIT
- ⚠️ Need to verify spacing consistency

#### Admin ❌ NEEDS AUDIT
- ⚠️ Need to verify spacing consistency

**Issue:** Hardcoded Tailwind spacing classes instead of token-based spacing

---

### 3. Components

#### Borders ❌ ISSUES FOUND
- ✅ Dashboard: Minimal borders (only divider line)
- ✅ Progress: Removed excessive borders
- ✅ Settings: Removed excessive borders
- ❌ Admin: Still has `border border-white/5` everywhere
- ❌ ActiveWorkout: Need to check

#### Cards ✅
- ✅ All use `Card` component
- ✅ Elevation variants used appropriately
- ✅ Consistent radius (`--radius-lg`)
- ✅ Subtle shadows via elevation system

#### Form Controls ⚠️
- ✅ Input uses `ui-input` class (tokens)
- ✅ Select uses `ui-input` class (tokens)
- ⚠️ Custom button styling in Progress tabs (not using Button component)
- ⚠️ Custom button styling in Settings (not using Button component)
- ⚠️ Admin buttons need audit

**Issue:** Some buttons not using Button component

---

### 4. Consistency

#### Button Component ❌ ISSUES
- ✅ Dashboard: Uses `Button` component
- ❌ Progress: Custom button styling for tabs (inline styles)
- ❌ Settings: Custom button styling for presets (inline styles)
- ❌ Admin: Need to check
- ❌ ActiveWorkout: Need to check

#### Card Component ✅
- ✅ Dashboard: Uses `Card` component
- ✅ Progress: Uses `Card` component
- ✅ Settings: Uses `Card` component
- ❌ Admin: Still uses hardcoded classes
- ❌ ActiveWorkout: Need to check

#### Colors ❌ ISSUES
- ❌ Dashboard: Hardcoded `bg-[#29e33c]` in exercise number badge
- ✅ Progress: Uses tokens
- ✅ Settings: Uses tokens
- ❌ Admin: Hardcoded colors (`bg-[#29e33c]`, `bg-[#141416]`, etc.)
- ❌ ActiveWorkout: Need to check

**Issue:** Inconsistent component usage and hardcoded colors

---

### 5. Proof Check

#### Screenshots Comparison ⚠️ PENDING
- ⚠️ Dashboard vs `public/figma/Home.png` - Not compared
- ⚠️ Progress vs `public/figma/Activity.png` - Not compared
- ⚠️ ActiveWorkout vs `public/figma/Pulse-recording.png` - Not compared
- ⚠️ Settings - No reference screenshot
- ⚠️ Admin - No reference screenshot

---

## Summary of Issues

### Critical (Must Fix)
1. ❌ Admin page: Hardcoded colors, borders, not using Card component
2. ❌ ActiveWorkout: Needs full audit
3. ❌ Button consistency: Progress/Settings tabs not using Button component
4. ❌ Hardcoded colors: Dashboard exercise badge, Admin page

### Medium Priority
1. ⚠️ Spacing: Some hardcoded Tailwind classes instead of tokens
2. ⚠️ Visual hierarchy: Progress tabs could be clearer

### Low Priority
1. ⚠️ Screenshot comparison: Need visual verification

---

## Next Steps

1. **Fix Admin page** - Use Card component, remove hardcoded colors
2. **Fix ActiveWorkout** - Audit and refactor to use components
3. **Fix Button consistency** - Create Button variants or use existing ones
4. **Fix hardcoded colors** - Replace with tokens
5. **Visual verification** - Compare screenshots
