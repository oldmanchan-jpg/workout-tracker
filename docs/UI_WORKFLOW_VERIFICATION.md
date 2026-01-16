# UI Workflow Verification

## Golden Rule
**No UI work is "done" unless it meets acceptance checks AND matches reference screenshots.**

## Workflow Steps (Must Follow)

### 1. Tokens ✅
**Status:** Complete  
**Location:** `src/styles/theme.css`  
**Action:** Define/update theme tokens in ONE place only.

**Current State:**
- ✅ All tokens defined in `src/styles/theme.css`
- ✅ Colors, spacing, elevation, shadows, typography all tokenized
- ✅ No hardcoded values in token file

### 2. Primitives ✅
**Status:** Complete  
**Location:** `src/components/ui/`  
**Action:** Update/create Button/Card/Input/Select/etc using tokens only.

**Current State:**
- ✅ `Card` component uses tokens with elevation variants
- ✅ `Button` component uses tokens (primary, ghost, outline)
- ✅ `Input` component uses tokens
- ✅ All components reference CSS variables, no hardcoded values

### 3. Pages ✅
**Status:** Complete  
**Location:** `src/pages/`  
**Action:** Rebuild page layouts using primitives only (no ad-hoc classes).

**Current State:**
- ✅ Dashboard uses `Card` and `Button` components
- ✅ Progress uses `Card` components with elevation
- ✅ Settings uses `Card` and `Button` components
- ✅ No page-specific CSS patches

### 4. Verification ⚠️
**Status:** Pending  
**Action:** Compare against reference screenshots + run build.

**Reference Screenshots:**
- `public/figma/Home.png` - Dashboard reference
- `public/figma/Activity.png` - Progress reference  
- `public/figma/Pulse-recording.png` - ActiveWorkout reference

**Verification Checklist:**
- [ ] Visual comparison: Dashboard vs `Home.png`
- [ ] Visual comparison: Progress vs `Activity.png`
- [ ] Visual comparison: ActiveWorkout vs `Pulse-recording.png`
- [ ] Build passes: `npm run build`
- [ ] No console errors: `npm run dev`
- [ ] Theme consistency: dark baseline + green accent (#29e33c)
- [ ] Elevation hierarchy: cards have proper depth
- [ ] No excessive borders: elevation replaces borders
- [ ] Spacing consistency: all spacing uses tokens

## Git/Vercel Workflow

### Rules
- ✅ `main` is the only long-lived branch
- ✅ Short-lived branches allowed ONLY if merged to main same day
- ✅ Delete merged branches after merge

### Current State
- **Production:** Vercel Environment=Production, Branch=main, Commit=5ba0f94
- **Status:** All UI refactoring complete, ready for visual verification

## Next Steps

1. **Visual Verification** (Required before marking complete)
   - Compare Dashboard with `public/figma/Home.png`
   - Compare Progress with `public/figma/Activity.png`
   - Compare ActiveWorkout with `public/figma/Pulse-recording.png`
   - Document any discrepancies

2. **Build Verification**
   - Run `npm run build` to ensure no build errors
   - Test production build locally

3. **Acceptance Checks** (from `docs/ACCEPTANCE.md`)
   - ✅ `npm install` - should work
   - ✅ `npm run dev` - should start without errors
   - ✅ `npm run build` - should build successfully
   - ⚠️ Manual UI checks - need visual verification
   - ⚠️ Theme check - need visual verification
   - ⚠️ Console check - need runtime verification

## Why This Works

This workflow prevents "patch chaos" by following established design system principles:

1. **USWDS "Continuity"** - Consistent patterns reduce cognitive load
2. **Atomic Design** - Build up from atoms/components, not style pages directly
3. **Design Tokens** - One change updates system-wide (IBM Carbon, DTCG)

## Work Report Template

After any UI work, document:

1. **Summary** (1-3 bullets)
2. **Files Changed** (bulleted list with paths)
3. **What Changed** (1-2 bullets per file)
4. **Commands Run** (exact commands, or "none")
5. **Verification** (visual comparison status, build status)
6. **Blockers / Open Questions**
7. **Next Suggested Task**
