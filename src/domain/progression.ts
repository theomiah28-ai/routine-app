import { ASCENT } from '../content/ascent'
import { addDays, dateKey } from '../dates'
import { bestStreak, currentStreak, isChecked, isScheduled } from './streaks'
import { EYE_STAGES, eyeStage } from './stillness'
import { LUNG_NAMES, healthStreak, lungScore, lungState } from './health'
import { MOON_NAMES, moonState, sleepScore, sleepStreak } from './sleep'
import { fuelDays, fuelStage, fuelStreak } from './food'
import type { Habit, HabitLink, Section, State } from '../types'

export const linked = (s: State, link: HabitLink) => s.habits.find((h) => h.link === link)

const relapseDays = (s: State) => new Set(s.transmutation.relapses.map((r) => dateKey(new Date(r))))

/** Days climbed on the Ascent: the linked habit's streak, where a relapse day never counts. */
export function ascentDays(s: State, today: string): number {
  const h = linked(s, 'transmutation')
  if (!h) return 0
  const bad = relapseDays(s)
  if (bad.has(today)) return 0
  const checks: State['checks'] = {}
  for (const [k, ids] of Object.entries(s.checks)) checks[k] = bad.has(k) ? ids.filter((x) => x !== h.id) : ids
  return currentStreak(h, checks, today)
}

/** Full reset: untick today, log the relapse, keep the record. */
export function relapseToday(s: State, now: number): State {
  const out = structuredClone(s)
  const today = dateKey(new Date(now))
  const h = linked(out, 'transmutation')
  const days = ascentDays(s, today)
  if (h && out.checks[today]) out.checks[today] = out.checks[today].filter((x) => x !== h.id)
  out.transmutation = { ...out.transmutation, longestDays: Math.max(out.transmutation.longestDays, days), relapses: [...out.transmutation.relapses, now] }
  return out
}

/** Minutes in silence. Per day: the larger of timed sits and the linked habit's minutes, so they never double count. */
export function meditationMinutes(s: State): number {
  const byDay = new Map<string, number>()
  for (const l of s.stillness.logs) {
    if (l.kind !== 'sit') continue
    const k = dateKey(new Date(l.start))
    byDay.set(k, (byDay.get(k) ?? 0) + l.minutes)
  }
  const h = linked(s, 'stillness')
  if (h?.minutes) {
    for (const [k, ids] of Object.entries(s.checks)) if (ids.includes(h.id)) byDay.set(k, Math.max(byDay.get(k) ?? 0, h.minutes))
  }
  let total = 0
  for (const m of byDay.values()) total += m
  return total
}

export const STATUE = [
  { points: 0, name: 'Raw stone' },
  { points: 1, name: 'First cut' },
  { points: 12, name: 'Rough form' },
  { points: 30, name: 'Shaped' },
  { points: 60, name: 'Defined' },
  { points: 100, name: 'Carved' },
  { points: 160, name: 'Polished' },
  { points: 250, name: 'Masterpiece' },
]

/** Consistency (each workout) plus progressive overload (each lift that beat its best), read from the whole history. */
export function statuePoints(s: State): number {
  const best = new Map<string, number>()
  let pbs = 0
  for (const sess of [...s.sessions].sort((a, b) => a.end - b.end)) {
    for (const e of sess.entries) {
      if (!e.sets.length) continue
      const top = Math.max(...e.sets.map((x) => x.weight))
      const prev = best.get(e.exerciseId)
      if (prev !== undefined && top > prev) pbs++
      if (prev === undefined || top > prev) best.set(e.exerciseId, top)
    }
  }
  return s.sessions.length + pbs
}

export function statueStage(points: number) {
  let index = 0
  STATUE.forEach((st, i) => points >= st.points && (index = i))
  const next = STATUE[index + 1]
  return { index, name: STATUE[index].name, next, pct: next ? (points - STATUE[index].points) / (next.points - STATUE[index].points) : 1 }
}

export interface SectionProgress {
  section: Section
  title: string
  value: string
  stage: string
  pct: number
  next: string | null
}

/** Each section's progression for Journey, driven by what's ticked on Today. */
export function sectionProgress(s: State, today: string): SectionProgress[] {
  const out: SectionProgress[] = []

  const sr = ascentDays(s, today)
  const ai = ASCENT.reduce((n, st, i) => (sr >= st.day ? i : n), -1)
  const an = ASCENT[ai + 1]
  out.push({
    section: 'transmutation',
    title: 'Transmutation',
    value: `${sr} ${sr === 1 ? 'day' : 'days'}`,
    stage: ai < 0 ? 'Not started' : ASCENT[ai].name,
    pct: an ? (sr - (ai < 0 ? 0 : ASCENT[ai].day)) / (an.day - (ai < 0 ? 0 : ASCENT[ai].day)) : 1,
    next: an ? `Day ${an.day} · ${an.name}` : null,
  })

  const mins = meditationMinutes(s)
  const eye = eyeStage(mins)
  const prev = EYE_STAGES[eye.index]
  out.push({
    section: 'stillness',
    title: 'Stillness',
    value: `${Math.round((mins / 60) * 10) / 10}h`,
    stage: eye.name,
    pct: eye.nextAt ? (mins - prev) / (eye.nextAt - prev) : 1,
    next: eye.nextAt ? `${eye.nextAt / 60}h` : null,
  })


  const pts = statuePoints(s)
  const st = statueStage(pts)
  out.push({ section: 'gym', title: 'Gym', value: `${s.sessions.length} sessions`, stage: st.name, pct: st.pct, next: st.next?.name ?? null })


  const lungs = lungScore(s, today)
  if (lungs !== null) {
    const hs = healthStreak(s, today)
    out.push({ section: 'health', title: 'Health', value: `${hs} clean ${hs === 1 ? 'day' : 'days'}`, stage: LUNG_NAMES[lungState(lungs)], pct: lungs, next: lungs >= 1 ? null : 'Clean days heal the lungs' })
  } else {
    out.push({ section: 'health', title: 'Health', value: 'Not started', stage: '—', pct: 0, next: 'Link a quit habit like no vaping' })
  }

  const moon = sleepScore(s, today)
  if (moon !== null) {
    const ss = sleepStreak(s, today)
    out.push({ section: 'sleep', title: 'Sleep', value: `${ss} ${ss === 1 ? 'night' : 'nights'} on time`, stage: MOON_NAMES[moonState(moon)], pct: moon, next: moon >= 1 ? null : 'On-time nights fill the moon' })
  } else {
    out.push({ section: 'sleep', title: 'Sleep', value: 'Not started', stage: '—', pct: 0, next: 'Set your wake-up and bedtime' })
  }

  // Fuel grows with every day the food score reaches 80
  const fd = fuelDays(s)
  const fuel = fuelStage(fd)
  const run = fuelStreak(s, today)
  out.push({
    section: 'food',
    title: 'Fuel',
    value: `${fd} ${fd === 1 ? 'day' : 'days'}`,
    stage: `${fuel.name}${run ? ` · ${run}-day streak` : ''}`,
    pct: fuel.pct,
    next: fuel.next ? `${fuel.next.days} ${fuel.next.days === 1 ? 'day' : 'days'} · ${fuel.next.name}` : null,
  })
  return out
}

/** The streak shown next to a habit: the Ascent for the transmutation habit (relapse-aware), the plain streak otherwise. */
export function habitStreak(s: State, h: Habit, today: string): number {
  return h.link === 'transmutation' ? ascentDays(s, today) : currentStreak(h, s.checks, today)
}


const LINK_NAMES: Record<HabitLink, string> = { transmutation: 'the Ascent', stillness: 'the Eye', gym: 'the statue', health: 'the lungs', sleep: 'the moon' }

/**
 * Saving a habit with this link/minutes would change past progress (moving a link away from a habit
 * with history, or changing the minutes each past tick counts for). Returns a warning, or null.
 */
export function linkChangeImpact(s: State, habitId: string | undefined, link: HabitLink | undefined, minutes: number | undefined): string | null {
  // Health and Sleep take any number of habits, so linking one never moves another
  if (!link || link === 'health' || link === 'sleep') return null
  const holder = linked(s, link)
  const ticks = (id: string) => Object.values(s.checks).filter((ids) => ids.includes(id)).length
  if (holder && holder.id !== habitId && ticks(holder.id)) {
    return `"${holder.name}" currently grows ${LINK_NAMES[link]}. Moving the link starts ${LINK_NAMES[link]} again from this habit's ticks.`
  }
  if (link === 'stillness' && holder && holder.id === habitId && holder.minutes !== undefined && minutes !== holder.minutes) {
    const before = meditationMinutes(s)
    const after = meditationMinutes({ ...s, habits: s.habits.map((h) => (h.id === habitId ? { ...h, minutes } : h)) })
    if (Math.round(before) !== Math.round(after)) return `Past ticks will count as ${minutes} min each: the Eye goes from ${fmtH(before)} to ${fmtH(after)}.`
  }
  return null
}

const fmtH = (m: number) => `${Math.round((m / 60) * 10) / 10}h`

export interface HabitDays {
  /** The run going right now */
  current: number
  best: number
  /** Every day it was ticked, ever */
  total: number
  /** First day of the current run, or null when there isn't one */
  since: string | null
}

/** How long you've kept a habit going: the current run, the best run, all-time days and when this run began. */
export function habitDays(s: State, h: Habit, today: string): HabitDays {
  const current = habitStreak(s, h, today)
  const best = h.link === 'transmutation' ? Math.max(s.transmutation.longestDays, current) : bestStreak(h, s.checks, today)
  let total = 0
  for (const [k, ids] of Object.entries(s.checks)) if (k >= h.createdAt && k <= today && ids.includes(h.id)) total++
  let since: string | null = null
  let key = isScheduled(h, today) && !isChecked(s.checks, h.id, today) ? addDays(today, -1) : today
  for (let n = 0; n < current; key = addDays(key, -1)) {
    if (!isScheduled(h, key)) continue
    since = key
    n++
  }
  return { current, best: Math.max(best, current), total, since }
}
