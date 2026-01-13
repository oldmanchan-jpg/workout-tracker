# 🗺️ Future Roadmap

**Last Updated:** January 13, 2026

---

## 🚨 CRITICAL BLOCKER

### Fix Table Layout in ActiveWorkout.tsx
**Status:** ❌ BLOCKING ALL PROGRESS  
**File:** `src/pages/ActiveWorkout.tsx` (lines ~360-450)

This must be fixed before ANY other work can proceed.

**The Problem:**
Inputs stack vertically instead of horizontal table rows.

**Next Steps:**
1. Debug with DevTools - see what CSS is actually applied
2. Try explicit widths: `grid-cols-[40px_60px_80px_80px_60px_40px]`
3. Try flexbox: `flex items-center gap-2` with fixed widths
4. Last resort: HTML `<table>` element

---

## 📋 Priority 1: Immediate (After Layout Fix)

### Testing & Verification
- [ ] Test table layout on mobile device
- [ ] Verify set completion flow
- [ ] Verify timer with duration input
- [ ] Test exercise navigation (prev/next)
- [ ] Confirm RPE saves to database
- [ ] Check for timer memory leaks

### Quick Polish
- [ ] Adjust spacing for mobile
- [ ] Polish checkmark styling
- [ ] Loading state during workout save
- [ ] Better error messages on save failure

---

## 📋 Priority 2: Short-Term Features

### Template Management (Admin Only)
- [ ] Create custom templates
- [ ] Edit existing templates
- [ ] Delete templates
- [ ] Categorize (Push/Pull/Legs)

*Note: Clients CANNOT modify templates*

### Workout History
- [ ] View detailed past workouts
- [ ] Edit past workout data
- [ ] Delete workouts
- [ ] Export data (CSV)

### Settings
- [ ] Default rest timer duration
- [ ] Weight unit (kg/lbs)
- [ ] Theme (dark/light)

---

## 📋 Priority 3: Medium-Term Features

### Progress Analytics
- [ ] 1RM calculator
- [ ] Volume trends by muscle group
- [ ] Personal records (PR) tracking
- [ ] Weekly/monthly reports

### Exercise Library
- [ ] Exercise descriptions
- [ ] Muscle group tags
- [ ] Equipment filtering
- [ ] Search functionality

---

## 📋 Priority 4: Long-Term Vision

### Social/Trainer Features
- [ ] Trainer can view client workouts
- [ ] Trainer can assign templates
- [ ] Trainer feedback on notes

### Smart Features
- [ ] Suggest rest times based on RPE
- [ ] Auto-adjust weights based on performance
- [ ] Fatigue monitoring

### Platform Expansion
- [ ] PWA for mobile install
- [ ] Apple Watch companion
- [ ] Offline mode with sync

---

## 🚫 Out of Scope

- Video hosting (use YouTube links)
- Built-in messaging (use external platforms)
- E-commerce
- Medical/injury advice

---

## 📝 Feature Requests Log

### Completed ✅
- Manual timer control (Jan 11)
- Pre-filled input values (Jan 11)

### In Progress ⚠️
- Table-based layout like Strong app (BROKEN)

### Requested
- Sound/vibration for timer completion
- Swipe gestures for exercise navigation
- Quick weight adjustment buttons (+2.5kg, -2.5kg)

---

## 🎯 Milestone Goals

### MVP Launch
**Status:** BLOCKED by layout bug

Requirements:
- ⚠️ Fix table layout (BLOCKER)
- ✅ Core workout logging
- ✅ RPE tracking
- ✅ Rest timer
- ⏳ Mobile testing
- ⏳ Deploy to public URL

### V1.0 (After MVP)
- Custom templates (admin)
- Enhanced analytics
- Profile settings

---

## 📐 Development Rules

1. **Test immediately** after visual changes
2. **2-task increments** max, then approval
3. **Debug systematically** - DevTools first
4. **Explain the WHY** for each approach
5. **Fallback plans** when approach fails twice
