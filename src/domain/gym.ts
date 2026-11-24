import { addDays, dateKey, todayKey, weekStart } from '../dates'
import type { SetLog, Session, State } from '../types'

/** Sessions (oldest first) that include this exercise, with only that exercise's sets. */
export function exerciseHistory(state: State, exerciseId: string) {
  return state.sessions
    .map((s) => ({ session: s, sets: s.entries.find((e) => e.exerciseId === exerciseId)?.sets ?? [] }))
    .filter((h) => h.sets.length > 0)
}

export function lastSets(state: State, exerciseId: string): SetLog[] {
  const h = exerciseHistory(state, exerciseId)
  return h.length ? h[h.length - 1].sets : []
}

export const topWeight = (sets: SetLog[]) => Math.max(...sets.map((s) => s.weight))

const fmt = (n: number) => String(Math.round(n * 100) / 100)

export function summarise(sets: SetLog[]): string {
  if (!sets.length) return ''
  const same = sets.every((s) => s.weight === sets[0].weight && s.reps === sets[0].reps)
  if (same) return `${sets.length} × ${sets[0].reps} @ ${fmt(sets[0].weight)}kg`
  return sets.map((s) => `${fmt(s.weight)}×${s.reps}`).join(', ')
}

export function nextDayId(state: State): string | undefined {
  if (!state.days.length) return undefined
  const last = state.sessions[state.sessions.length - 1]
  const i = last ? state.days.findIndex((d) => d.id === last.dayId) : -1
  return state.days[(i + 1) % state.days.length].id
}

export function sessionsThisWeek(sessions: Session[]): number {
  const start = weekStart(todayKey())
  return sessions.filter((s) => dateKey(new Date(s.end)) >= start).length
}

export { fmt as formatWeight }

/** Strictly heavier than every earlier session's top set for this exercise (and there is history). */
export function isPersonalBest(state: State, exerciseId: string, weight: number): boolean {
  const h = exerciseHistory(state, exerciseId)
  return h.length > 0 && weight > Math.max(...h.map((x) => topWeight(x.sets)))
}

/** "8-12" → [8, 12], "5" → [5, 5]. Null when unset or unreadable. */
export function repRange(reps: string | undefined): [number, number] | null {
  const m = reps?.match(/^\s*(\d+)\s*(?:[-–to]+\s*(\d+))?\s*$/)
  if (!m) return null
  const lo = +m[1]
  const hi = m[2] ? +m[2] : lo
  return lo > 0 && hi >= lo ? [lo, hi] : null
}

/** The best set of a session: heaviest, then most reps at that weight. */
export function bestSet(sets: SetLog[]): SetLog {
  return sets.reduce((b, s) => (s.weight > b.weight || (s.weight === b.weight && s.reps > b.reps) ? s : b), sets[0])
}

const beats = (a: SetLog, b: SetLog) => a.weight > b.weight || (a.weight === b.weight && a.reps > b.reps)

export interface Target {
  weight: number
  reps: number
  /** Why this is the target */
  why: string
  up: boolean
}

const STEP = 2.5

/**
 * Progressive overload, double-progression style: work up the rep range at a weight, and once every
 * set at that weight hits the top of the range, add 2.5kg and start again at the bottom.
 */
export function nextTarget(state: State, exerciseId: string, reps: string | undefined, plannedSets: number): Target | null {
  const last = lastSets(state, exerciseId)
  if (!last.length) return null
  const top = topWeight(last)
  const atTop = last.filter((s) => s.weight === top)
  const range = repRange(reps)
  const fewest = Math.min(...atTop.map((s) => s.reps))
  if (range) {
    const [lo, hi] = range
    if (atTop.length >= plannedSets && fewest >= hi) {
      return { weight: top + STEP, reps: lo, why: `You hit ${hi} reps on every set. Add ${STEP}kg.`, up: true }
    }
    return { weight: top, reps: Math.min(hi, Math.max(lo, fewest + 1)), why: `Same weight. Get every set to ${hi} reps, then add weight.`, up: false }
  }
  return { weight: top, reps: fewest + 1, why: 'Same weight, one more rep than last time.', up: false }
}

export type Trend = { kind: 'up'; text: string } | { kind: 'flat'; sessions: number } | { kind: 'new' }

/** Did the best set improve on the session before, and how many sessions has it been stuck? */
export function trend(state: State, exerciseId: string): Trend {
  const best = exerciseHistory(state, exerciseId).map((h) => bestSet(h.sets))
  if (best.length < 2) return { kind: 'new' }
  const [prev, last] = best.slice(-2)
  if (beats(last, prev)) {
    const text = last.weight > prev.weight ? `+${fmt(last.weight - prev.weight)}kg` : `+${last.reps - prev.reps} ${last.reps - prev.reps === 1 ? 'rep' : 'reps'}`
    return { kind: 'up', text }
  }
  // Sessions since the best set last beat everything before it
  let n = 0
  for (let i = best.length - 1; i > 0; i--) {
    const before = best.slice(0, i).reduce((b, s) => (beats(s, b) ? s : b))
    if (beats(best[i], before)) break
    n++
  }
  return { kind: 'flat', sessions: n }
}

/** Sessions in each of the last `n` weeks (Monday start), oldest first. */
export function weeklySessions(sessions: Session[], today: string, n: number): { week: string; count: number }[] {
  const thisWeek = weekStart(today)
  return Array.from({ length: n }, (_, i) => {
    const week = addDays(thisWeek, (i - n + 1) * 7)
    const end = addDays(week, 7)
    return { week, count: sessions.filter((s) => { const k = dateKey(new Date(s.end)); return k >= week && k < end }).length }
  })
}

/** Total kg moved in a session: weight × reps over every set. */
export const sessionVolume = (s: Session) => s.entries.reduce((t, e) => t + e.sets.reduce((u, x) => u + x.weight * x.reps, 0), 0)

/** Each logged lift's best set the first time and the latest time, most-trained first. */
export function strengthGains(state: State) {
  return Object.values(state.exercises)
    .map((e) => {
      const h = exerciseHistory(state, e.id)
      if (!h.length) return null
      return { id: e.id, name: e.name, sessions: h.length, first: bestSet(h[0].sets), last: bestSet(h[h.length - 1].sets) }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.sessions - a.sessions)
}
