import { addDays } from '../dates'
import { isChecked, isScheduled } from './streaks'
import type { HabitLink, State } from '../types'

// Health and Sleep both take several habits and grade the same way: a day counts when every one is ticked

const WINDOW = 14

export const linkedHabits = (s: State, link: HabitLink) => s.habits.filter((h) => h.link === link)

/** True when every linked habit due that day was ticked. Null when none were due (or none existed yet). */
export function allDoneOn(s: State, link: HabitLink, key: string): boolean | null {
  const due = linkedHabits(s, link).filter((h) => key >= h.createdAt && isScheduled(h, key))
  if (!due.length) return null
  return due.every((h) => isChecked(s.checks, h.id, key))
}

/**
 * Score 0..1 over the last two weeks, recent days weighing most. Today only counts once it's
 * ticked, so an unticked morning doesn't hurt yet. Null when nothing is linked.
 */
export function windowScore(s: State, link: HabitLink, today: string): number | null {
  if (!linkedHabits(s, link).length) return null
  let sum = 0
  let total = 0
  for (let d = 0; d < WINDOW; d++) {
    const key = addDays(today, -d)
    const c = allDoneOn(s, link, key)
    if (c === null || (d === 0 && !c)) continue
    const w = WINDOW - d
    total += w
    if (c) sum += w
  }
  return total ? sum / total : 1
}

/** Consecutive full days ending today; today unticked doesn't break it, days with nothing due are skipped. */
export function linkStreak(s: State, link: HabitLink, today: string): number {
  if (!linkedHabits(s, link).length) return 0
  let key = allDoneOn(s, link, today) ? today : addDays(today, -1)
  let n = 0
  for (let guard = 0; guard < 4000; guard++) {
    const c = allDoneOn(s, link, key)
    if (c === null) {
      if (!linkedHabits(s, link).some((h) => key >= h.createdAt)) break
    } else if (c) n++
    else break
    key = addDays(key, -1)
  }
  return n
}
