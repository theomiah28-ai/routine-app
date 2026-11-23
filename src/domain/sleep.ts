import { allDoneOn, linkStreak, linkedHabits, windowScore } from './tracked'
import type { Habit, State } from '../types'

export type MoonState = 'full' | 'waning' | 'half' | 'crescent'

export const MOON_NAMES: Record<MoonState, string> = { full: 'Rested', waning: 'Steady', half: 'Drained', crescent: 'Exhausted' }

export const sleepHabits = (s: State) => linkedHabits(s, 'sleep')

/** On time = woke up and went to sleep when you said you would. Null when nothing was due. */
export const onTimeOn = (s: State, key: string) => allDoneOn(s, 'sleep', key)

/** How full the moon is, 0..1 over the last two weeks. Null when no sleep habits are linked. */
export const sleepScore = (s: State, today: string) => windowScore(s, 'sleep', today)

/** Consecutive on-time days ending today. */
export const sleepStreak = (s: State, today: string) => linkStreak(s, 'sleep', today)

export function moonState(score: number): MoonState {
  if (score >= 0.85) return 'full'
  if (score >= 0.6) return 'waning'
  if (score >= 0.3) return 'half'
  return 'crescent'
}

/** Morning sleep habits are the wake-up, evening ones the bedtime. */
export const sleepRole = (h: Pick<Habit, 'timeOfDay'>): 'wake' | 'bed' => (h.timeOfDay === 'evening' ? 'bed' : 'wake')

/** "06:30" → "6:30" */
export const showTime = (t: string) => t.replace(/^0(\d)/, '$1')

export const sleepName = (role: 'wake' | 'bed', time: string) => (role === 'wake' ? `Wake up by ${showTime(time)}` : `Asleep by ${showTime(time)}`)

/** Pull a target time out of a habit name like "Wake up by 6:30" or "Asleep by 23.00". */
export function timeIn(name: string): string | undefined {
  const m = name.match(/(\d{1,2})[:.](\d{2})/)
  if (!m || +m[1] > 23 || +m[2] > 59) return undefined
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** Unlinked habits that look like a wake-up or bedtime, so Sleep can offer to adopt them. */
export const sleepLike = (s: State) => s.habits.filter((h) => !h.link && h.kind === 'build' && /wake|asleep|bed\b|bedtime|sleep/i.test(h.name))
