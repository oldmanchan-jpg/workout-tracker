# 🗺️ Future Roadmap

**Last Updated:** January 11, 2026, 12:42 PM

---

## 🎯 Immediate Next Steps (Priority 1)

### 1. Testing & Bug Fixes
**Timeline:** Next session
- [ ] Test compact list view on actual mobile device
- [ ] Verify rest timers work correctly
- [ ] Test auto-complete feature with edge cases
- [ ] Verify RPE saves to database correctly
- [ ] Test "Add Extra Set" functionality
- [ ] Test exercise navigation with incomplete sets
- [ ] Ensure no memory leaks from timers

### 2. UX Refinements
**Timeline:** Next 1-2 sessions
- [ ] Add haptic feedback on set completion (mobile)
- [ ] Sound/vibration when rest timer completes
- [ ] Confirm dialog before skipping exercise with incomplete sets
- [ ] Loading states during workout save
- [ ] Better error messages if save fails
- [ ] Offline indicator if no connection

---

## 🚀 Short-Term Features (Priority 2)

### Template Management
**Effort:** Medium | **Impact:** High
- [ ] Create custom workout templates
- [ ] Edit existing templates
- [ ] Delete templates
- [ ] Duplicate templates
- [ ] Categorize templates (Push/Pull/Legs, etc.)
- [ ] Share templates between users (future)

### Exercise Library Enhancement
**Effort:** Medium | **Impact:** Medium
- [ ] Add exercise descriptions
- [ ] Add exercise images/animations
- [ ] Muscle group tagging
- [ ] Equipment filtering
- [ ] Search functionality
- [ ] Exercise substitutions suggestions

### Workout History Details
**Effort:** Small | **Impact:** Medium
- [ ] View detailed past workouts
- [ ] Edit past workout data
- [ ] Delete workouts
- [ ] Export workout data (CSV/PDF)
- [ ] Notes search/filter

### Profile & Settings
**Effort:** Small | **Impact:** Medium
- [ ] User profile page
- [ ] Default rest timer duration
- [ ] Weight unit preference (kg/lbs)
- [ ] Theme customization (dark/light)
- [ ] Notification preferences

---

## 🎨 Medium-Term Features (Priority 3)

### Advanced Progress Analytics
**Effort:** High | **Impact:** High
- [ ] 1RM calculator based on reps/weight
- [ ] Volume trends by muscle group
- [ ] Personal records (PR) tracking
- [ ] Strength standards comparison
- [ ] RPE correlation with volume
- [ ] Predict optimal working weight
- [ ] Weekly/monthly summary reports

### Social Features
**Effort:** High | **Impact:** Medium-High
- [ ] Follow trainers/coaches
- [ ] Share workouts (optional)
- [ ] Trainer can view client workouts
- [ ] Trainer can assign templates
- [ ] Trainer feedback on workout notes
- [ ] Achievement badges
- [ ] Workout streaks

### Program Builder (For Trainers/Advanced Users)
**Effort:** Very High | **Impact:** High
- [ ] Multi-week programs
- [ ] Progressive overload automation
- [ ] Deload weeks
- [ ] Periodization templates
- [ ] Exercise progression rules
- [ ] Auto-adjust weights based on RPE

### Smart Features (AI/ML)
**Effort:** Very High | **Impact:** Medium
- [ ] Suggest optimal rest times based on RPE
- [ ] Predict next workout performance
- [ ] Fatigue monitoring
- [ ] Recovery recommendations
- [ ] Form check via camera (stretch goal)

---

## 🔧 Technical Improvements

### Performance
**Effort:** Medium | **Impact:** High
- [ ] Offline-first architecture with service workers
- [ ] Local caching of workouts
- [ ] Optimistic UI updates
- [ ] Background sync when back online
- [ ] Lazy loading for charts
- [ ] Image optimization

### Code Quality
**Effort:** Medium | **Impact:** Medium
- [ ] Unit tests for critical functions
- [ ] Integration tests for workout flow
- [ ] E2E tests with Playwright
- [ ] Storybook for component documentation
- [ ] Error boundary components
- [ ] Sentry for error tracking

### Infrastructure
**Effort:** Medium | **Impact:** Medium
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated deployment
- [ ] Environment variables management
- [ ] Database backups
- [ ] Performance monitoring
- [ ] Analytics (PostHog/Mixpanel)

---

## 🌟 Long-Term Vision (Priority 4)

### Wearable Integration
**Effort:** Very High | **Impact:** High
- [ ] Apple Watch app
- [ ] Android Wear app
- [ ] Heart rate monitoring during sets
- [ ] Auto-detect set completion via accelerometer
- [ ] Voice commands for logging

### Nutrition Tracking
**Effort:** Very High | **Impact:** Medium
- [ ] Basic calorie/macro tracking
- [ ] Meal planning
- [ ] Barcode scanner
- [ ] Integration with MyFitnessPal
- [ ] Nutrition recommendations based on workout volume

### Marketplace (Monetization)
**Effort:** Very High | **Impact:** High
- [ ] Premium subscription tier
- [ ] Paid workout programs from trainers
- [ ] Custom template marketplace
- [ ] Trainer certification program
- [ ] Affiliate partnerships (supplements, equipment)

---

## 🚫 Not Planned / Out of Scope

- ❌ Video hosting (use YouTube/Vimeo links instead)
- ❌ Built-in messaging/chat (use external platforms)
- ❌ E-commerce for physical products
- ❌ Complex macro calculators (link to external tools)
- ❌ Medical advice or injury diagnosis

---

## 📊 Feature Prioritization Framework

When deciding what to build next, consider:

1. **User Impact:** Does this solve a real pain point?
2. **Mobile Experience:** Does this improve mobile usability?
3. **Effort vs. Value:** Low effort + high value = do first
4. **Dependencies:** What needs to be built first?
5. **Feedback:** What are users requesting most?

---

## 💬 Feature Requests Tracking

### From Users
- (None yet - app not in production)

### From Internal Testing
- Add sound/vibration for rest timer completion
- Swipe gestures for exercise navigation
- Quick weight adjustment buttons (+2.5kg, -2.5kg)

---

## 🎯 Milestone Goals

### MVP Launch (Target: Q1 2026)
- ✅ Core workout logging
- ✅ RPE tracking
- ✅ Rest timer
- ⚠️ Tested on real devices
- ⚠️ Hosted on public URL
- ⚠️ Onboarding flow

### V1.0 (Target: Q2 2026)
- Custom templates
- Enhanced progress analytics
- Profile customization
- Mobile app (PWA → Native)

### V2.0 (Target: Q3 2026)
- Trainer features
- Social sharing
- Advanced analytics
- Offline mode
