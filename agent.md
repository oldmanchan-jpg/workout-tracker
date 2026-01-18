# agent.md — Workout Tracker (PM Runbook)

**Owner:** Aby  
**App:** Workout Tracker (React + TypeScript + Supabase)  
**Timezone:** Europe/Tirane  
**Last updated:** 2026-01-18

This file is the *single source of truth* for what’s done, what’s next, and the guardrails the coding agent (Cursor) must follow.

---

## 1) Project Snapshot

### ✅ Working Features (latest confirmed)
- Bottom navigation + PWA mode
- Vercel routing (no 404 on refresh)
- Admin template import (JSON upload/paste) → **writes to Supabase**
- Template selection on Workout page (loaded from **Supabase**, RLS-filtered)
- Start Workout flow (no crash)
- Set completion + RPE tracking (strength workouts)
- Rest timers
- Template auto-update across Admin → Workout dropdown
- **Conditioning workouts supported** (EMOM + Circuit) via `type`-based templates + `ActiveWorkout` branching
- Excel **Day 2 (EMOM)** + **Day 4 (Circuit)** conversion supported via `convert_workout_excel_to_json.py`
- Supabase schema: `templates` + `template_assignments` with RLS (coach/admin elevated; clients see assigned only)
- `ActiveWorkout` has loading + empty states for Supabase template fetch

### ⚠️ Known Minor Issue
- PWA bottom safe-area gap (iOS / safe-area-inset-bottom handling) — optional polish, not blocking

### Previous Major Root Cause (resolved)
- Cursor-created **git worktrees** locked `main`, causing changes to deploy from the wrong branch.

---

## 2) What We Achieved Recently

### Done ✅
- Fixed **React hooks crash** (referenced as issue **#310**) — Start Workout no longer crashes.
- Fixed **template auto-update** — importing templates in Admin instantly makes them available in Workout template selection.
- Preserved workout flow — logging, RPE, timers unchanged.
- Resolved prior deployment confusion — worktrees removed and `main` deployment restored.
- Added EMOM + Circuit workout support (type-based templates + `ActiveWorkout` branching).
- Converted Excel Day 2 (EMOM) + Day 4 (Circuit) via `convert_workout_excel_to_json.py`.
- Created Supabase schema for templates + assignments with RLS policies.
- Admin import now writes templates to Supabase; clients load assigned templates via RLS.

---

## 3) Today’s Priorities (2026-01-18)

### Critical Reality (Excel Program vs App Capabilities)
- The program Excel block contains **4 weeks**, each with **4 training days**:
  - **Day 1 (Strength)**
  - **Day 2 (Conditioning — EMOM)**
  - **Day 3 (Strength)**
  - **Day 4 (Conditioning — Circuit)**
- **Day 2 + Day 4 are NOT optional.** They are high importance and must be runnable in-app.

### Decision: Theme revamp is NOT a priority today
**Rationale (Opus pushback):** core features must ship for paying clients; Cursor is in auto mode (higher risk). Theme/token migration is valuable but does not unlock client delivery.

**Rule:** No theme/token refactor today unless Aby explicitly green-lights it.

---

## 4) P0 — End-of-day Deliverables (must be true)

By end of day, the app must support:

1) ✅ **Login works** (client + coach)

2) ✅ **Templates can be imported via Admin (JSON upload/paste)**
   - Coach authoring source remains **Excel → JSON conversion** (not direct Excel upload today).

3) ✅ **Conditioning workout support (Day 2 EMOM + Day 4 Circuit)**
   - Imported EMOM/Circuit templates must be **startable and usable**.
   - MVP definition for “supported” today:
     - Client can open a conditioning template and see:
       - Warm-up list
       - Main block definition (EMOM minutes OR circuit rounds + rest)
       - Exercise/station list with targets
       - Optional extras
     - Client can **start a timer** appropriate to the workout type:
       - EMOM: countdown timer for total duration (e.g., 16/20 min) + “Minute A / Minute B” indicator
       - Circuit: per-round flow with rest-between-rounds timer (e.g., 90s)
     - Client can mark the workout **Completed** (even if detailed per-station logging is minimal today).

4) ✅ **Client-scoped templates (privacy + assignment)**
   - Coach can assign templates to a specific client.
   - Client sees **only templates assigned to them** (no other clients’ templates).

---

## 3.1) Current Caveats / UX Debt (P1)

- Conditioning UX is functional but not “usable polish” yet:
  - EMOM needs clearer visual separation for Minute A vs Minute B.
  - Circuit needs station-level flow (next station), station timer, and structured rest (between stations + between rounds).
  - Current “single pause” / “clamped layout” makes circuits harder to follow.

---

## 3.2) Next Priority Options

- **P0**: Verify assignment flow end-to-end with 2 clients + empty state for unassigned.
- **P1**: Conditioning runner UX overhaul (station/interval model + UI separation).
- **P1**: Decide final source of truth (localStorage fallback rules for coach).
- **P2**: Add small “debug panel” in Admin showing template counts in Supabase vs local.

---

## 5) Proposed Minimal Template Schema (to implement today)

### Backward compatibility requirement
- Existing strength templates ("name" + "exercises" with sets/reps/weight) must continue to work unchanged.

### Extension (new fields)
A template may now include:
- `type`: `'strength' | 'emom' | 'circuit'` (default to `'strength'` if missing)

**EMOM template (example shape):**
```json
{
  "name": "Week 1 Day 2 - EMOM 16",
  "type": "emom",
  "durationMinutes": 16,
  "warmup": [
    {"label": "Ski Erg", "target": "2 min easy"},
    {"label": "Dynamic prep", "target": "3 min (10+10+10)"}
  ],
  "minuteA": [
    {"label": "Ski Erg", "target": "40 seconds"},
    {"label": "Goblet Squat", "target": "10 reps @ 12kg"}
  ],
  "minuteB": [
    {"label": "KB Swing", "target": "12 reps @ 12kg"},
    {"label": "Step-up", "target": "8 reps/leg"}
  ],
  "extras": [
    {"label": "Box Jump", "target": "8 reps"},
    {"label": "Burpees", "target": "8 reps"}
  ]
}
```

**Circuit template (example shape):**
```json
{
  "name": "Week 1 Day 4 - Circuit",
  "type": "circuit",
  "rounds": 3,
  "restBetweenRoundsSeconds": 90,
  "warmup": [
    {"label": "Ski Erg", "target": "2 min easy"},
    {"label": "Dynamic prep", "target": "3 min (10+10+20)"}
  ],
  "stations": [
    {"order": 1, "label": "Ski Erg", "target": "30 seconds"},
    {"order": 2, "label": "KB Swing", "target": "12 reps @ 12kg"},
    {"order": 3, "label": "Goblet Squat", "target": "10 reps @ 12kg"}
  ]
}
```

---

## 6) Execution Plan (3 steps today)

### Step 1 — Add EMOM + Circuit support in the app (P0)
- Extend template types + Admin importer validation
- Update Workout/ActiveWorkout rendering to support `type: emom | circuit`
- Add minimal timers and “Complete workout” action for conditioning workouts

### Step 2 — Convert Excel Day 2/Day 4 → JSON using the schema (P0)
- Update the Excel→JSON conversion script to output EMOM/Circuit templates
- Generate a full 16-template JSON file for the provided block (4 weeks × 4 days)
- Import into Admin and confirm both conditioning workout types run

### Step 3 — Client-scoped template assignment + visibility (P0)
- Implement per-client template assignment (minimal data model)
- Enforce: clients can only fetch/see their own assigned templates
- Confirm with 2 test users (Client A/B) that templates do not leak

---

## 7) Guardrails (Cursor must follow)

### Proof-of-work cadence
- **After every 1 prompt**: run the requested verification commands.
- **After every 2 prompts max**: do a full smoke test (login + import + start EMOM + start Circuit + complete).

### Git
- **Always** work on `main` unless Aby explicitly approves a branch.
- **Never** use `git worktree`.
- Before pushing, verify:
  - `git branch --show-current` → `main`
  - `git status --short` → clean (or expected)
  - `git log -1 --oneline origin/main` matches local HEAD after push

### Execution style
- One prompt = one atomic change.
- Touch only the files explicitly listed in the prompt.
- No refactors, no styling sweep, no token/theme migration.

---

## 8) Standard Verification Commands

```bash
# sanity
git branch --show-current
git status --short

# build
npm run build

# verify remote
git fetch origin
git log -1 --oneline HEAD
git log -1 --oneline origin/main
```
