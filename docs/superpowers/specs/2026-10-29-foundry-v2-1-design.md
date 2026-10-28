# Foundry V2.1: progression from Today's habits

This changes the V2 design (`2026-10-28-foundry-v2-design.md`). Anything not mentioned here stays as V2. Theo approved this in chat on 2026-10-29.

## Decided by Theo

1. **Onboarding forces nothing.**
   - First step: goals, multi-select (better physique, more money, more focus, more energy, connect with God, better sleep, quit bad habits).
   - Second step: faith. Christianity only for now. Choosing "not for me" hides Faith everywhere. It can be switched later in You.
   - Then suggested habits based on the chosen goals, **none pre-selected**. The user can add their own or skip and start empty.
2. **Today holds only habits** to tick, plus Edit to add or customise them. Habits stay until removed. The section tiles move off Today.
3. **Journey shows each section's progression:** symbol, streak or total, and a progress bar to the next stage, all driven by habits ticked on Today.
4. **Transmutation:** a NoFap habit ticked daily climbs the Ascent. A missed day or a relapse resets it (no grace, as in V2).
5. **Stillness:** the Eye opens by **total hours meditated**, so longer daily sits open it faster.
   - Stages: 0, 1h, 10h, 25h, 50h, 100h, 200h, then **fully awake at 365h**.
   - A meditation habit carries minutes (e.g. "Meditate 30 min"), and ticking it adds them. The sit timer logs actual minutes.
6. **Faith (Christianity):** progression is the faith streak. It counts days with a faith-linked habit ticked (e.g. "Read the Bible 20 min", "Pray") or morning prayer done. The cross brightens through 7 stages (1, 7, 14, 30, 60, 100, 365 days).
7. **Gym:** a stone statue carved over 7 stages.
   - Points = workouts + personal bests (overload).
   - Final stage at roughly 18 months of training 4 times a week.
   - Uses images when supplied (`public/statue/stage-N.png`, prompts in `docs/statue-prompts.md`), with an SVG placeholder until then.
8. **Screen Time:** today's brain, plus the 7-day and 30-day brains (average daily minutes).

## Builder's calls

- **Habit links:** a habit can link to `transmutation`, `stillness`, `faith` or `gym`, one habit per section. Ticking a linked habit feeds that section. A meditation or faith habit can carry `minutes`.
- **The day ring** counts Today's scheduled habits only.
- **Kept on Today:** the morning/evening flow button.
- **Transmutation day count** = the current streak of the transmutation-linked habit, or 0 if a relapse was logged today. "I relapsed" logs a relapse and unticks today.
  - **V1 → V2 migration** keeps "No PMO" as a habit and gives it the `transmutation` link, instead of converting it to a start time.
  - **Existing V2 states** (anyone who ran the preview) get a "No PMO" habit linked to Transmutation, with ticks backfilled from `transmutation.start`.
- **Stillness minutes for a day** = the larger of that day's logged sits and the linked habit's minutes if ticked, so a timed sit that auto-ticks the habit isn't counted twice. Breathwork and visualisation don't count, since they aren't silence.
- **Statue stage thresholds (points):** 0, 1, 12, 30, 60, 100, 160, 250.
- **When Faith is off:** the Faith route, the Journey row, the onboarding suggestions, the morning-flow verse step and the faith milestones are all hidden.
- **Milestones** follow the new progressions (Ascent stages from the habit streak, Eye stages, Faith stages, Statue stages).
