import { addDays, parseKey } from '../dates'
import { PLANS, VERSES, type Plan, type Verse } from '../content/faith'
import type { FaithState } from '../types'

export type FaithItem = 'prayer' | 'reading' | 'gratitude'

const EPOCH = parseKey('2026-01-01').getTime()

export function verseOfDay(key: string): Verse {
  const n = Math.round((parseKey(key).getTime() - EPOCH) / 86400e3)
  return VERSES[((n % VERSES.length) + VERSES.length) % VERSES.length]
}

export function faithDone(f: FaithState, key: string, item: FaithItem): boolean {
  return !!f.days[key]?.[item]
}

/** Consecutive days with morning prayer, ending today; today not done yet doesn't break it. */
export function faithStreak(f: FaithState, today: string): number {
  let key = faithDone(f, today, 'prayer') ? today : addDays(today, -1)
  let n = 0
  while (faithDone(f, key, 'prayer')) {
    n++
    key = addDays(key, -1)
  }
  return n
}

/** Today's chapter in the active plan. Stays on the chapter just read until tomorrow. */
export function planToday(f: FaithState, key: string): { plan: Plan; dayIndex: number; ref: string } | null {
  const plan = PLANS.find((p) => p.id === f.planId)
  if (!plan) return null
  const progress = f.planProgress[plan.id] ?? 0
  const dayIndex = faithDone(f, key, 'reading') ? progress - 1 : progress
  if (dayIndex < 0 || dayIndex >= plan.days.length) return null
  return { plan, dayIndex, ref: plan.days[dayIndex] }
}

export function completeReading(f: FaithState, key: string): FaithState {
  if (faithDone(f, key, 'reading')) return f
  const id = f.planId
  return {
    ...f,
    days: { ...f.days, [key]: { ...f.days[key], reading: true } },
    planProgress: id ? { ...f.planProgress, [id]: (f.planProgress[id] ?? 0) + 1 } : f.planProgress,
  }
}
