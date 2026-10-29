# Foundry app — V2 design

Working title: **Foundry Crucible** (name not final; keep it in one constant so it's a one-line change).

## Intent

A discipline and self-mastery app from Foundry, Theo's business. Foundry runs a Skool community and course for e-commerce students, and the app will eventually come bundled with that offer. Its job is to keep people self-accountable and help them reach their goals with as little friction as possible.

For now it's for **Theo and one friend only**. Public release, accounts and community come later.

The bar is a mainstream, top-of-the-App-Store app (Theo's reference: Cal AI). It should not feel like a hobby project. The tracking is the core. Every tracker should feel *special*: each section has its own symbol and its own journey, not just another checklist.

## Who it's for

Ambitious young men and women building e-commerce businesses who want to:
- improve their life and get disciplined
- connect with God
- make more money and become successful

Some are lost and don't know which habits help their mind and body, so the app explains the *why* (Insights) without cluttering the trackers.

## Goals

- **Tracking that's fast, beautiful and motivating:** people *want* to open it daily.
- **A distinct, meaningful visual per section.**
- **Daily structure:** a morning and an evening flow that tie the sections into one ritual.
- **Reminders and shareable milestone cards** to drive consistency.

## Non-goals (V2)

- Accounts, sign-in, cloud sync, community, leaderboards.
- Choosing sections in onboarding (agreed for later). All sections are visible in V2.
- Real Screen Time data, the camera-verified alarm, native iOS. These need the later Swift app.
- Food logging.

## Anti-goals

- Cluttered or templated-looking UI, or anything that reads as vibe-coded.
- Logging that takes more than a tap or two.
- Preaching. Esoteric content is available but **never pushed** (see Insights).
- **No chakra or energy-centre framing anywhere.** The language is mental mastery and mastery of the mind and body.

## Constraints

- **Platform:** the existing installable web app (Vite + React + TS) at `~/routine-app`, served from GitHub Pages and installed to the iPhone home screen.
- **Data:** stays on the device in IndexedDB.
- **Migration:** Theo's V1 data (habits, checks, gym split, sessions) **must migrate into V2 intact**, at the same URL, so it updates in place.
- **Content:** much of it is Theo's and will come later. Build every content surface with placeholder content, structured so real content drops in without code changes (see Content).
- **iPhone web limits:** no vibration API, and no local scheduled notifications. Reminders need Web Push from a server (see Reminders).

## Visual system (decided)

- **Base:** warm near-black backgrounds (subtle warm radial glow at the top), off-white text, warm grey for secondary text and dividers.
- **The gold rule:** gold (`#e8c46a` family, with a light-gold to deep-gold gradient for buttons) is reserved for **progress, completion, milestones and each screen's single primary action**. Everyday interface (labels, inactive icons, borders, secondary buttons) stays neutral warm grey and off-white, so gold always means "earned" or "do this". *Theo agreed the all-gold version looked samey.*
- **Each section has its own symbol and journey** (below). They share the palette but differ in shape.
- **Motion and feel:**
  - smooth transitions between screens
  - satisfying tick animations
  - soft tones where useful (Web Audio)
  - symbols animate as they change state
- **The rest is the builder's call:** detailed polish, spacing, type scale and micro-interactions. Theo explicitly handed UI polish over ("you know more than me about that part").

## Navigation (decided)

A bottom tab bar with four tabs:
- **Today:** the daily hub.
- **Journey:** all section symbols in one place, plus the Progress calendar.
- **Learn:** Insights.
- **You:** settings, reminders, backups, milestone cards gallery, esoteric toggle.

There's no centre "+" button. Each section opens as its own full screen from Today or Journey.

## Today (home)

- Header: date, greeting, a **completion ring** that fills as today's items get done and glows gold at 100%. It replaces the "score out of 100".
- **Start morning** and **Wind down** buttons, which launch the flows below. Show whichever fits the time of day.
- **Routine habits grouped by time of day, with symbols:** ☀ Morning, Anytime, ☾ Evening. Quit habits sit in their own group.
- **Compact cards for each section**, showing today's state and one tap in: Transmutation, Stillness, Faith, Work, Gym, Screen Time.

### Morning flow (decided in principle; order is the builder's call)
A guided sequence:
1. Morning Sit
2. Verse of the day
3. Set today's work targets
4. Tick off morning habits

### Evening flow
A guided sequence:
1. Tick off anything left
2. Evening gratitude
3. Review today's ring
4. Glance at tomorrow
5. "Go to sleep" message

## Routine (carried over from V1, with changes)

- Habits are Build or Quit, with weekday schedules, as in V1.
- **New:** each habit has a time of day (Morning / Anytime / Evening), shown with sun and moon symbols.
- Streak logic is unchanged from V1: consecutive scheduled days, and today being unticked doesn't break it. A missed day resets it to 0.
- Press-and-hold drag to reorder, as in V1.
- **No duplicates:** NoFap/SR lives only in Transmutation. Remove "No PMO" from Routine when migrating V1 data, carrying its tick history into Transmutation (see Migration).
- Each habit can link to an Insights article ("Why?").

## Transmutation (SR): "The Ascent" (decided)

**The journey:**
- A rising, serpent-like path through **7 stages at days 1, 7, 14, 30, 60, 100 and 365**.
- Stage names are placeholders: Foundation, Creation, Will, Magnetism, Expression, Vision, Mastery. Rename them to mental-mastery themes and drop anything chakra-related.
- Reached stages glow. Future stages are dim with a lock.

**Counter and stage detail:**
- A **live counter** in days and hours since the streak started.
- Tapping a reached stage opens its detail: an image, a teaching (Theo's content), "What you gain" and "What wasting it costs".

**Relapse is a full reset** (Theo's decision):
- An "I relapsed" action, with a confirm, sets the counter to 0 and returns the Ascent to the start. No grace and no partial credit.
- **Builder's call:** show "Longest" as a record stat. It doesn't soften the reset.

**"Transmute an urge" (the primary action):**
- A short guided intervention: a 60-second breath, your reasons, and what's at stake at your current stage.
- It ends with redirect buttons: start a deep-work session, start a workout, or start a sit.

**Other:**
- Tracked as a start date/time, not daily ticks.
- **Migration:** seed the start from V1's "No PMO" current streak.

## Stillness: meditation first (decided)

**The symbol is "The Opening Eye":**
- A closed eye that opens over time and radiates more light.
- Its stage is driven by **total minutes in silence**. Thresholds are the builder's call: a sensible curve over roughly 1, 5, 10, 25, 50, 100 and 250+ hours.
- It also shows the sit streak.

**The Morning Sit is the hero:**
- 30 minutes of pure silent awareness: no intention, no guidance, no music, nothing to look at. Just observing thoughts as they come up.
- The session screen is almost black, with a faint ring, the time remaining and a single bell at start, halfway and end.
- Keep the screen awake (Wake Lock) and dim the interface.
- Minutes count towards the Eye, and a finished sit keeps the sit streak.
- The length can be changed, but defaults to 30.

**Breathwork** (secondary):
- **Box:** 4-4-4-4.
- **Power breath:** about 30 fast breaths, then a hold, for 3 rounds. Don't use the name "Wim Hof".
- **Calm:** 4-7-8.
- Each uses an animated orb that grows and shrinks with the breath, plus a light tracing the square for Box, with soft tones on each phase change.

**Visualisation** (secondary):
- Guided scripts shown as slow-paced text on screen. Audio can come later.
- Practices are grouped by intent: Focus, Clarity, Energy, Calm, Sleep.

## Faith (decided)

**The symbol is a cross of light:** it glows brighter with the faith streak (consecutive days with morning prayer done).

**Verse of the day:**
- Picked for ambitious believers. Each verse is tagged with a theme: Purpose, Prosperity, Discipline, Renew your mind, Closer to God, Courage.
- Each has an optional "Why this matters for builders" note. Theo writes these, and they're placeholders until then.

**Reading plans:**
- *Wisdom & Wealth* (Proverbs, 31 days)
- *From Pit to Palace* (Joseph, Genesis 37–50)
- *Build the Wall* (Nehemiah)
- *Renew Your Mind* (Romans 12, Philippians 4)
- *Strong & Courageous* (Joshua, Psalms)

Theo will refine the plans later. Progress is tracked per plan, and today's reading appears as a daily item.

**Daily items:** morning prayer, today's reading, and evening gratitude with an optional short note.

**Translation:** KJV, which is public domain. Bundle the verses and the chapters the plans use. Modern translations need licensing, so they're out.

**Builder's call:** drafting the starter verse list (about 60 verses) and the plan day-by-day chapter lists.

## Work (decided: the most important section)

**Daily inputs**, entered quickly with steppers or number entry:
1. Videos posted (count)
2. Products tested (count)
3. Hours worked
4. Hours of deep work. A **deep-work timer** logs this automatically, and it can be edited by hand.

**Targets:**
- Daily targets per input, which the user can set.
- A day "hits" when every target is met, and the work streak counts days hit. Which days count (every day, or chosen weekdays) is the builder's call, following the Routine scheduling model.

**Visual:** a focus ring for today's deep work, plus weekly and monthly totals and charts for each input.

## Gym (V1 logger, restyled)

- Everything from V1: the split, sets pre-filled from last time, per-exercise progress, session count.
- **New: rest timer.** It starts automatically when a set is ticked. The default is 2:00, adjustable per exercise or globally (builder's call), with a tone at the end. It runs as a bar that doesn't get in the way, and can be skipped.
- **New: personal-best celebration** when a set beats the previous top weight for that exercise.
- Finishing a workout still auto-ticks the gym habit.

## Screen Time (interface only in V2)

- **The brain character:** a side-view brain with a face.
  - **Sharp** (under 2h): glowing gold, bright eyes, smiling.
  - **Foggy** (2–4h): heavy lids, a wobbly mouth, fog drifting in.
  - **Rotting** (4h+): X eyes, cracks, mould, drool, flies.
  - It animates between states. Thresholds are settings.
- **Per-app breakdown and limits.**
- **Clearly labelled preview:** "Connects in the iPhone app". It runs on sample data, and the user can enter their daily total by hand from iOS Screen Time if they want, which is the builder's call.

## Journey and Progress

- **Journey** shows every section's symbol in its current state: the Ascent, the Eye, the Cross, the Brain, Work's ring, Gym's lift trend.
- **Progress** is a month calendar where each day's colour shows how complete it was, with a filter for each section. It shows consistency %, perfect days, and short plain-language observations (e.g. "Sundays are where streaks break").

## Insights (Learn tab)

- An image-led library of Theo's material. The categories are Mindset, Neuroplasticity, Identity, Subconscious and Transmutation.
- **Esoteric content** sits in its own category, **hidden unless turned on** in You ("Show esoteric teachings"). It's available but never pushed.
- Article view: hero image, title, reading time, rich text.
- Articles can be linked from habits ("Why?"), Ascent stages and Stillness practices.

## Milestone cards (decided: across all sections)

- At milestones (Ascent stages, sit streaks and Eye stages, gym session counts and personal bests, work streaks, faith streaks, routine streaks), the app shows a celebratory moment.
- It produces a **shareable image card** in the gold style: symbol, number, name. It's shared through the iPhone share sheet, e.g. into Skool.
- Cards are kept in a gallery in You.

## Reminders (decided)

- Morning reminder, wind-down / go-to-sleep reminder, and "haven't sat today" / "haven't logged work today" nudges, each with its own time.
- iPhone home-screen web apps support Web Push, but only sent from a server. So V2 needs a **small push service**: it stores the push subscription and reminder times, and sends at those times. No habit data is sent.
- **Builder's call:** a free-tier serverless option (e.g. a Cloudflare Worker with a cron trigger). It needs an account Theo owns, so reminders are the **last build phase**. Theo creates the free account when we get there. Everything else ships without it.
- **Hosting stays on GitHub Pages with a public repo.** Theo confirmed the content is fine to be public.

## Onboarding

- Light for V2, since it's only Theo and a friend: name, then pick suggested habits (each with a "Why?"), then set work targets, then turn on reminders.
- **Saved for later:** the full Cal AI-style goal-first quiz with a plan reveal.

## Content model

- All content (Insights articles, Ascent stage text, verses and notes, reading plans, practice scripts, suggested habits) lives in **content files in the repo** (Markdown or JSON plus images), separate from code. Theo sends content, and it gets dropped in.
- **Builder writes the starter content:** KJV verses and plans, breathwork instructions, 2–3 visualisation scripts, suggested-habit "why" blurbs. Everything else is a clearly marked placeholder.

## Data and migration

- Version the stored state.
- V1 to V2: keep habits (assign time of day, Morning by default unless the name suggests otherwise), checks, split, sessions and settings.
- Convert "No PMO" into the Transmutation start date and remove it from Routine.
- Keep the V1 JSON backup working, and extend export/import to the V2 state.

## Calls made after the builder check (builder's calls, flagged for Theo)

- **What fills the completion ring** (and colours each day in Progress):
  - Counts: scheduled routine habits, the three Faith daily items, the Morning Sit, Work targets hit, and Gym on scheduled gym days.
  - Transmutation counts as done automatically while the streak is unbroken.
  - Screen Time is excluded while it's a preview.
- **Overlapping V1 habits:**
  - Finishing a Morning Sit auto-ticks a habit marked "linked to Stillness" (V1's "Meditate" gets this flag on migration), the same way Gym works. Nothing is deleted.
  - "Read 20 min" stays separate (books, not scripture).
- **Nudge state:**
  - The app sends the push service a minimal daily flag ("sat today", "logged work today") so those nudges are skipped once done.
  - Plain timed reminders (morning, wind-down) need no flag.
- **"No PMO" migration:**
  - Match the Quit habit whose name contains "PMO" (case-insensitive). If none matches, ask once in-app which habit was the SR tracker.
  - Start = 00:00 on the day after the last missed scheduled day.
  - "Longest" = the best run in its V1 tick history.
  - Migration runs automatically on first launch. Theo isn't sending a real export, so test against realistic synthetic V1 data, including a renamed SR habit. Before migrating, the app saves a copy of the V1 state under a separate key as a safety net.
- **Home-screen name and icon:** iOS won't rename an existing install. The release includes a short in-app guide to export, re-add the app to the home screen, then import.

## Left to the builder

- All visual polish and micro-interaction details within the visual system above.
- Exact milestone thresholds for Stillness, Work and Routine cards. Ascent stages are fixed.
- Starter content as listed. Push service implementation.
