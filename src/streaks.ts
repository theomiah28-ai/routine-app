import { addDays, weekday } from './dates'
import type { Habit, State } from './types'

export function isScheduled(habit: Habit, key: string): boolean {
  return habit.days.length === 0 || habit.days.includes(weekday(key))
}

export function isChecked(checks: State['checks'], habitId: string, key: string): boolean {
  return checks[key]?.includes(habitId) ?? false
}

/**
 * Consecutive scheduled days ticked, ending today. Today not being ticked yet
 * doesn't break the streak — only a scheduled day that has fully passed does.
 */
export function currentStreak(habit: Habit, checks: State['checks'], today: string): number {
  let streak = 0
  let key = today
  if (isScheduled(habit, key) && !isChecked(checks, habit.id, key)) key = addDays(key, -1)
  while (key >= habit.createdAt) {
    if (isScheduled(habit, key)) {
      if (!isChecked(checks, habit.id, key)) break
      streak++
    }
    key = addDays(key, -1)
  }
  return streak
}

export function bestStreak(habit: Habit, checks: State['checks'], today: string): number {
  let best = 0
  let run = 0
  for (let key = habit.createdAt; key <= today; key = addDays(key, 1)) {
    if (!isScheduled(habit, key)) continue
    if (isChecked(checks, habit.id, key)) {
      run++
      best = Math.max(best, run)
    } else if (key !== today) {
      run = 0
    }
  }
  return best
}
