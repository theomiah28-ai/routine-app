import { ASCENT } from '../content/ascent'
import { addDays, dateKey } from '../dates'
import { currentStreak, isChecked } from './streaks'
import { EYE_STAGES, eyeStage } from './stillness'
import { workStreak } from './work'
import type { HabitLink, Section, State } from '../types'

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

const faithDone = (s: State, key: string) => {
  const h = linked(s, 'faith')
  return !!s.faith.days[key]?.prayer || (!!h && isChecked(s.checks, h.id, key))
}

/** Consecutive days with the faith habit ticked or morning prayer done; today not done yet doesn't break it. */
export function faithDays(s: State, today: string): number {
  let key = faithDone(s, today) ? today : addDays(today, -1)
  let n = 0
  while (faithDone(s, key)) {
    n++
    key = addDays(key, -1)
  }
  return n
}

export const FAITH_STAGES = [
  { day: 1, name: 'Seed' },
  { day: 7, name: 'Root' },
  { day: 14, name: 'Light' },
  { day: 30, name: 'Lamp' },
  { day: 60, name: 'Fire' },
  { day: 100, name: 'Radiance' },
  { day: 365, name: 'Glory' },
]

function dayStage(stages: { day: number; name: string }[], days: number) {
  let i = -1
  stages.forEach((st, idx) => days >= st.day && (i = idx))
  const next = stages[i + 1]
  const from = i < 0 ? 0 : stages[i].day
  return { index: i, name: i < 0 ? 'Not started' : stages[i].name, next, pct: next ? (days - from) / (next.day - from) : 1 }
}

export const faithStage = (days: number) => dayStage(FAITH_STAGES, days)

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

/** Consistency (workouts) plus progressive overload (personal bests). */
export const statuePoints = (s: State) => s.sessions.length + s.milestones.filter((m) => m.id.startsWith('pb:')).length

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

  if (s.settings.faith) {
    const fd = faithDays(s, today)
    const f = faithStage(fd)
    out.push({ section: 'faith', title: 'Faith', value: `${fd} ${fd === 1 ? 'day' : 'days'}`, stage: f.name, pct: f.pct, next: f.next ? `Day ${f.next.day} · ${f.next.name}` : null })
  }

  const pts = statuePoints(s)
  const st = statueStage(pts)
  out.push({ section: 'gym', title: 'Gym', value: `${s.sessions.length} sessions`, stage: st.name, pct: st.pct, next: st.next?.name ?? null })

  const ws = workStreak(s.work, today)
  out.push({ section: 'work', title: 'Work', value: `${ws}-day streak`, stage: 'Inputs', pct: Math.min(1, ws / 30), next: ws < 30 ? '30-day streak' : null })
  return out
}
