# 🗺️ Future Roadmap

**Last Updated:** January 14, 2026

---

## ✅ RESOLVED BLOCKERS

### ~~Fix Table Layout in ActiveWorkout.tsx~~
**Status:** ✅ RESOLVED  
**Solution:** Complete redesign with HTML table structure and accordion layout

### ~~Mobile Scaling Issues~~
**Status:** ✅ RESOLVED  
**Solution:** Proper responsive design, removed horizontal scroll, touch-friendly inputs

---

## 📋 Priority 1: Immediate Enhancements

### Testing & Verification
- [ ] Test accordion layout on real mobile devices
- [ ] Verify swipe navigation feels natural
- [ ] Test auto-collapse behavior with multiple exercises
- [ ] Verify timer persists across exercise changes
- [ ] Check for any memory leaks in timer
- [ ] Test pending approval flow end-to-end
- [ ] Verify all inputs work correctly on mobile keyboards

### UX Polish
- [ ] Add haptic feedback on swipe navigation (if supported)
- [ ] Smooth animations for exercise collapse/expand
- [ ] Loading state during workout save
- [ ] Better error messages on save failure
- [ ] Toast notifications for set completion
- [ ] Visual feedback when swiping between pages

### Performance
- [ ] Optimize re-renders in ActiveWorkout
- [ ] Lazy load charts on Progress page
- [ ] Add loading skeletons for data fetching

---

## 📋 Priority 2: Short-Term Features

### Admin Features
- [ ] **Client Management Dashboard**
  - [ ] View all clients and their status
  - [ ] Activate/deactivate clients
  - [ ] View client workout history
  - [ ] Assign templates to clients
  
- [ ] **Template Management**
  - [ ] Create custom templates
  - [ ] Edit existing templates
  - [ ] Delete templates
  - [ ] Categorize templates (Push/Pull/Legs/Full Body)
  - [ ] Duplicate templates
  - [ ] Template preview/edit UI

### Workout History Enhancements
- [ ] View detailed past workouts (expandable cards)
- [ ] Edit past workout data
- [ ] Delete workouts
- [ ] Filter workouts by date range
- [ ] Filter workouts by template
- [ ] Export data (CSV/JSON)
- [ ] Print workout summary

### Settings & Preferences
- [ ] User profile page
- [ ] Default rest timer duration
- [ ] Weight unit preference (kg/lbs)
- [ ] Theme preference (dark/light) - currently dark only
- [ ] Notification preferences
- [ ] Change password

---

## 📋 Priority 3: Medium-Term Features

### Progress Analytics
- [ ] **1RM Calculator** - Estimate one-rep max from multiple sets
- [ ] **Volume Trends by Muscle Group** - Track volume per muscle group
- [ ] **Personal Records (PR) Tracking** - Track PRs per exercise
- [ ] **Weekly/Monthly Reports** - Summary reports
- [ ] **Exercise-Specific Charts** - Track individual exercise progress
- [ ] **Volume Progression** - Visualize volume increases over time
- [ ] **RPE Trends** - See how RPE changes over time

### Exercise Library Enhancements
- [ ] Exercise descriptions and instructions
- [ ] Muscle group tags
- [ ] Equipment filtering
- [ ] Search functionality
- [ ] Exercise images/videos (YouTube links)
- [ ] Alternative exercises suggestions

### Workout Enhancements
- [ ] **Quick Weight Adjustment** - +2.5kg/-2.5kg buttons
- [ ] **Set Templates** - Save common set patterns
- [ ] **Workout Templates** - Save completed workouts as templates
- [ ] **Rest Timer Presets** - Quick select (30s, 60s, 90s, 2min, 3min)
- [ ] **Sound/Vibration** - Timer completion alerts
- [ ] **Auto-Start Timer** - Start timer when set is completed

---

## 📋 Priority 4: Long-Term Vision

### Social/Trainer Features
- [ ] **Trainer Dashboard** - Overview of all clients
- [ ] **Client Communication** - In-app messaging or notes
- [ ] **Workout Comments** - Trainer can comment on workouts
- [ ] **Program Assignment** - Assign multi-week programs
- [ ] **Progress Reports** - Automated reports for trainers
- [ ] **Client Groups** - Organize clients into groups

### Smart Features
- [ ] **AI Suggestions** - Suggest rest times based on RPE
- [ ] **Auto-Adjust Weights** - Suggest weight increases based on performance
- [ ] **Fatigue Monitoring** - Track recovery and suggest deloads
- [ ] **Volume Recommendations** - Suggest optimal volume per muscle group
- [ ] **Progressive Overload Tracking** - Visualize if you're progressing

### Platform Expansion
- [ ] **PWA Support** - Install as mobile app
- [ ] **Offline Mode** - Work offline, sync when online
- [ ] **Apple Watch Companion** - Start timers from watch
- [ ] **Android Widget** - Quick access to timer
- [ ] **Export to Other Apps** - Integration with other fitness apps
- [ ] **API Access** - Allow third-party integrations

### Advanced Analytics
- [ ] **Volume Periodization** - Track volume over training blocks
- [ ] **RPE Distribution** - See RPE patterns over time
- [ ] **Exercise Frequency** - Track how often you do each exercise
- [ ] **Recovery Metrics** - Track rest days and recovery
- [ ] **Goal Tracking** - Set and track fitness goals

---

## 🚫 Out of Scope (For Now)

- Video hosting (use YouTube links)
- Built-in messaging (use external platforms)
- E-commerce
- Medical/injury advice
- Social media features
- Workout sharing/public profiles
- Nutrition tracking
- Body measurements tracking

---

## 📝 Feature Requests Log

### Completed ✅
- Manual timer control (Jan 11)
- Pre-filled input values (Jan 11)
- Table-based layout (Jan 13)
- Accordion layout (Jan 14)
- Swipe navigation (Jan 14)
- Mobile scaling fixes (Jan 14)
- Pending approval system (Jan 14)

### In Progress ⚠️
- None currently

### Requested
- Sound/vibration for timer completion
- Quick weight adjustment buttons (+2.5kg, -2.5kg)
- Rest timer presets
- Auto-start timer on set completion
- Haptic feedback on swipe
- Exercise images/videos

---

## 🎯 Milestone Goals

### MVP Launch ✅
**Status:** COMPLETE

Requirements:
- ✅ Core workout logging
- ✅ RPE tracking
- ✅ Rest timer
- ✅ Progress tracking
- ✅ Mobile-first design
- ✅ Swipe navigation
- ✅ Role-based access
- ✅ Pending approval system

### V1.0 (Next Release)
**Target:** Q1 2026

Goals:
- [ ] Admin client management
- [ ] Template creation/editing
- [ ] Enhanced analytics (1RM, PRs)
- [ ] Settings/preferences
- [ ] Workout history enhancements

### V1.5 (Future)
**Target:** Q2 2026

Goals:
- [ ] Trainer features
- [ ] Smart suggestions
- [ ] PWA support
- [ ] Offline mode

### V2.0 (Long-term)
**Target:** Q3-Q4 2026

Goals:
- [ ] Apple Watch companion
- [ ] Advanced analytics
- [ ] API access
- [ ] Third-party integrations

---

## 📐 Development Rules

1. **Test immediately** after visual changes
2. **Mobile-first** - Always test on mobile device
3. **2-task increments** max, then approval
4. **Debug systematically** - DevTools first
5. **Explain the WHY** for each approach
6. **Fallback plans** when approach fails twice
7. **User feedback** - Prioritize user-requested features
8. **Performance** - Monitor bundle size and load times

---

## 🔄 Continuous Improvement

### Regular Tasks
- [ ] Review user feedback
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Update dependencies
- [ ] Security audits
- [ ] Mobile device testing

### Code Quality
- [ ] TypeScript strict mode
- [ ] ESLint configuration
- [ ] Component documentation
- [ ] Test coverage (future)
- [ ] Code reviews
