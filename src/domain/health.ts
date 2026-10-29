import { addDays } from '../dates'
import { isChecked, isScheduled } from './streaks'
import type { State } from '../types'

export type LungState = 'healthy' | 'strained' | 'damaged' | 'blackened'

export const LUNG_NAMES: Record<LungState, string> = { healthy: 'Healthy', strained: 'Strained', damaged: 'Damaged', blackened: 'Blackened' }

const WINDOW = 14

export const healthHabits = (s: State) => s.habits.filter((h) => h.link === 'health')

/** Clean = every health habit due that day was ticked. Null when none were due (or none existed yet). */
export function cleanOn(s: State, key: string): boolean | null {
  const due = healthHabits(s).filter((h) => key >= h.createdAt && isScheduled(h, key))
  if (!due.length) return null
  return due.every((h) => isChecked(s.checks, h.id, key))
}

/**
 * Lung health 0..1 over the last two weeks, recent days weighing most. Today only counts once it's
 * ticked, so an unticked morning doesn't hurt yet. Null when there are no health habits.
 */
export function lungScore(s: State, today: string): number | null {
  if (!healthHabits(s).length) return null
  let sum = 0
  let total = 0
  for (let d = 0; d < WINDOW; d++) {
    const key = addDays(today, -d)
    const c = cleanOn(s, key)
    if (c === null || (d === 0 && !c)) continue
    const w = WINDOW - d
    total += w
    if (c) sum += w
  }
  return total ? sum / total : 1
}

export function lungState(score: number): LungState {
  if (score >= 0.85) return 'healthy'
  if (score >= 0.6) return 'strained'
  if (score >= 0.3) return 'damaged'
  return 'blackened'
}

/** Consecutive clean days ending today; today unticked doesn't break it, days with nothing due are skipped. */
export function healthStreak(s: State, today: string): number {
  if (!healthHabits(s).length) return 0
  let key = cleanOn(s, today) ? today : addDays(today, -1)
  let n = 0
  for (let guard = 0; guard < 4000; guard++) {
    const c = cleanOn(s, key)
    if (c === null) {
      if (!healthHabits(s).some((h) => key >= h.createdAt)) break
    } else if (c) n++
    else break
    key = addDays(key, -1)
  }
  return n
}
