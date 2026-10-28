import { dateKey } from '../dates'
import { logPractice } from './stillness'
import type { ActiveSit, StillnessState } from '../types'

export const sitLeft = (a: ActiveSit, now: number) => Math.max(0, a.minutes * 60e3 - (now - a.start))

/**
 * Close the active sit. Completed logs the full length; partial logs the time up to when the app
 * was left (or now). Returns the day the sit belongs to (its start), for ticking a linked habit.
 */
export function finishSit(s: StillnessState, completed: boolean, now: number): { stillness: StillnessState; dayKey: string } {
  const a = s.activeSit
  if (!a) return { stillness: s, dayKey: dateKey(new Date(now)) }
  const total = a.minutes * 60e3
  const sat = completed ? total : Math.min(total, Math.max(0, (a.hiddenAt ?? now) - a.start))
  const minutes = Math.round((sat / 60e3) * 10) / 10
  const cleared = { ...s, activeSit: null }
  const stillness = minutes > 0 ? logPractice(cleared, { id: `sit-${a.start}`, kind: 'sit', start: a.start, minutes, completed }) : cleared
  return { stillness, dayKey: dateKey(new Date(a.start)) }
}
