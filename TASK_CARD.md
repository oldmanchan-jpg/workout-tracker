# TASK CARD (Active)

**Status:** IN PROGRESS — Shipping client-ready programming (Strength + Conditioning) + assignments
**Last Updated:** 2026-01-18

---

## End-of-Day Must-Haves

By end of day, we must have:
1) Working login (client + coach)
2) Admin template import working (JSON upload/paste)
   - Today’s workflow: **Excel → JSON → Import** (no direct Excel upload)
3) **Conditioning workouts supported** (non-negotiable):
   - Day 2 = EMOM
   - Day 4 = Circuit
   - Must be startable in-app with minimal timers + completion
4) **Client-scoped templates** (privacy):
   - Coach assigns templates to a specific client
   - Client sees only their assigned templates

---

## Recently Completed ✅

- ✅ React hooks crash (#310) fixed — Start Workout no longer crashes
- ✅ Template auto-update fixed — Admin import instantly shows in Workout dropdown
- ✅ Workout flow preserved — set logging, RPE, timers unchanged
- ✅ Deployment workflow fixed — removed Cursor worktrees locking `main`

---

## Scope Guardrail (Opus pushback)

- 🚫 **Do NOT do theme/token migration today** unless Aby explicitly green-lights it.
- Reason: deadline + Cursor auto mode risk; revenue unlock = programming support + assignments.

---

## Today’s Task Queue (execute in this order)

### P0 — Regression Smoke (must pass before/after each major change)
- [ ] `npm run build`
- [ ] Desktop smoke: Login → Dashboard → Start Strength workout → log a set → rest timer
- [ ] Admin smoke: Import templates → verify immediate availability in Workout selection

### P0 — Step 1: Add Conditioning Support (EMOM + Circuit)
**Goal:** Day 2 + Day 4 are runnable in-app.
- [ ] Identify current template type shape + importer expectations
- [ ] Extend template schema with `type: 'strength' | 'emom' | 'circuit'` (default strength)
- [ ] Implement EMOM UI (duration + minute A/B display + timer + complete)
- [ ] Implement Circuit UI (rounds + rest-between-rounds + station list + timers + complete)
- [ ] Keep strength workout flow unchanged

**Acceptance:**
- [ ] Can start an EMOM template and see timer + A/B indicator
- [ ] Can start a Circuit template and see rounds + rest timer
- [ ] Can mark either completed without crashing

### P0 — Step 2: Convert Excel Day 2/Day 4 → JSON + Import
- [ ] Update `convert_workout_excel_to_json.py` to emit EMOM/Circuit templates using the new schema
- [ ] Generate a **single JSON** containing **all 16 workouts** (4 weeks × 4 days)
- [ ] Import into Admin
- [ ] Verify Day 2 and Day 4 workouts are usable

**Acceptance:**
- [ ] Workout list includes Strength + EMOM + Circuit workouts for the block
- [ ] EMOM and Circuit templates run end-to-end

### P0 — Step 3: Client-Scoped Assignment + Visibility
- [ ] Confirm whether templates currently live in localStorage or Supabase
- [ ] Implement minimal per-client assignment (prefer Supabase/RLS if templates are shared)
- [ ] Admin: assign templates to a client
- [ ] Client: Workout list shows only assigned templates
- [ ] Empty state when none assigned

**Acceptance:**
- [ ] Client A sees only Client A templates
- [ ] Client B sees only Client B templates
- [ ] No template leakage via UI (and via API/list if applicable)

---

## Proof-of-Work Rules (Cursor Auto Mode)

**After EACH prompt:**
- Paste outputs of:
  - `git status --short`
  - `git diff --stat`
  - `npm run build` (or state why build was not run)

**After every 2 prompts max:**
- Full smoke test evidence:
  - Login
  - Import JSON
  - Start EMOM
  - Start Circuit
  - Complete workout

---

## Do Not Touch (unless explicitly tasked)

- Theme/token migration
- Broad UI redesign
- Strength workout logging logic
- Routing / Vite config

---

## Git Verification (every change)

```bash
git branch --show-current
git status --short
git fetch origin
git log -1 --oneline HEAD
git log -1 --oneline origin/main
```
