import { dateKey, todayKey, weekStart } from './dates'
import type { SetLog, Session, State } from './types'

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
