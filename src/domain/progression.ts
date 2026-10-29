import { ASCENT } from '../content/ascent'
import { dateKey } from '../dates'
import { currentStreak } from './streaks'
import { EYE_STAGES, eyeStage } from './stillness'
import { LUNG_NAMES, healthStreak, lungScore, lungState } from './health'
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


  const lungs = lungScore(s, today)
  if (lungs !== null) {
    const hs = healthStreak(s, today)
    out.push({ section: 'health', title: 'Health', value: `${hs} clean ${hs === 1 ? 'day' : 'days'}`, stage: LUNG_NAMES[lungState(lungs)], pct: lungs, next: lungs >= 1 ? null : 'Clean days heal the lungs' })
  } else {
    out.push({ section: 'health', title: 'Health', value: 'Not started', stage: '—', pct: 0, next: 'Link a quit habit like no vaping' })
  }

  const pts = statuePoints(s)
  const st = statueStage(pts)
  out.push({ section: 'gym', title: 'Gym', value: `${s.sessions.length} sessions`, stage: st.name, pct: st.pct, next: st.next?.name ?? null })

  return out
}

/** The streak shown next to a habit: the Ascent for the transmutation habit (relapse-aware), the plain streak otherwise. */
export function habitStreak(s: State, h: Habit, today: string): number {
  return h.link === 'transmutation' ? ascentDays(s, today) : currentStreak(h, s.checks, today)
}


const LINK_NAMES: Record<HabitLink, string> = { transmutation: 'the Ascent', stillness: 'the Eye', gym: 'the statue', health: 'the lungs' }

/**
 * Saving a habit with this link/minutes would change past progress (moving a link away from a habit
 * with history, or changing the minutes each past tick counts for). Returns a warning, or null.
 */
export function linkChangeImpact(s: State, habitId: string | undefined, link: HabitLink | undefined, minutes: number | undefined): string | null {
  // Health takes any number of habits, so linking one never moves another
  if (!link || link === 'health') return null
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
