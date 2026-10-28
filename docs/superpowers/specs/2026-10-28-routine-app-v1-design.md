# Routine App — v1 Design

## Intent
A personal productivity app for Theo's iPhone that helps him stick to good habits, quit bad ones, and progress in the gym. v1 is the tracker: a clean daily tick-off and a gym log. It has to look and feel premium. That's the point, not decoration.

## v1 scope
1. **Today**: daily routine tick-off with streaks
2. **Gym**: customisable split, workout logging (weight + reps), progress per exercise, session count

## Not in v1 (later phases)
- Morning alarm with camera-verified dismiss, and the night-time sleep reminder (needs native Swift)
- Screen Time tracking and warnings (needs native Swift + paid Apple Developer account)
- Food logging
- Accounts, sync, sharing, anything multi-user

## Anti-goals
- Cluttered or "template-y" UI
- Logging that takes more than a tap or two per item
- Losing data

## Platform (decided)
An installable web app (PWA) added to the iPhone home screen from Safari. It works fully offline. All data stays on the phone. A later move to native Swift will rebuild the screens. Data carries over through a JSON export.

**Builder's calls:** Vite + React + TypeScript, `vite-plugin-pwa` for offline/installability, IndexedDB for storage (home-screen web apps are exempt from Safari's storage eviction). Hosted free on GitHub Pages (account `theomiah28-ai`; repo must be public for free Pages, but only code is public, never data).

## Visual style (decided: option A, "dark minimal")
- Near-black background (`#0b0b0c`), off-white text, one accent: lime `#c6f432`. Quit-habit streaks use coral `#ff6b5b`.
- System font (SF Pro on iPhone), big bold headings, small uppercase section labels, thin dividers, rounded 7px checkboxes that fill lime when ticked. Ticked items dim and strike through.
- Mockups: `.superpowers/brainstorm/*/content/visual-style.html` (option A) and `gym-section.html`.
- Respects iPhone safe areas (notch, home bar). Bottom tab bar: **Today · Gym**.

## Today screen (decided)
- Header: date, greeting, "X of Y done" + progress bar.
- Two sections: **Build** (e.g. wake up by 6:30, gym, read, meditate, asleep by 23:00) and **Quit** (e.g. no vaping, no PMO).
- Each item: checkbox, name, current streak in days.
- Habits are fully user-defined: add, rename, delete, reorder, choose Build or Quit.
- Tap a habit → its detail: current streak, best streak, and a grid of the last ~90 days showing done/missed.

**Builder's calls:**
- A streak = consecutive scheduled days ticked. Today not being ticked yet doesn't break it; the streak only breaks once a scheduled day ends unticked.
- Quit habits are ticked daily too ("stayed clean today"). Same streak logic, coral colour.
- Each habit has optional weekdays (default every day) so non-daily habits like Gym don't break on rest days.
- Can tick/untick today and yesterday (for forgetting before bed). Older days are read-only.
- Ships with Theo's example habits pre-loaded, all editable/deletable.

## Gym (decided)
Three screens, per `gym-section.html`:
1. **Split**: list of training days (Theo: Upper A, Lower A, Upper B, Lower B), each with its exercises. Total session count on top. The next day in rotation is highlighted with a **Start** button. Days and exercises can be added, renamed, removed and reordered (drag) seamlessly.
2. **Workout**: elapsed timer, exercises in order. Each set row = weight (kg) + reps + tick. Pre-filled from last time's numbers for that exercise. "Last time: 3 × 8 @ 100kg" shown. Add/remove sets on the fly. **Finish** saves the session.
3. **Exercise progress**: line chart of top-set weight over time (1M / 3M / 1Y / All), gain over the range, best weight, full session history.

**Builder's calls:**
- "Next up" = the day after the most recently completed one, in split order. Any day can still be started manually.
- Finishing a workout auto-ticks the habit marked as the gym habit (if one exists) for today.
- Stats on split screen: total sessions + sessions this week.
- An in-progress workout survives the app being closed.
- Units: kg only.

## Data safety
- Settings (small gear on Today) → **Export backup** (downloads JSON) and **Import backup**.

## Done when
Installed on Theo's iPhone from the home screen, works offline, and he can run a full day: tick habits, do a logged upper/lower session, and see streaks and lift progress update.
