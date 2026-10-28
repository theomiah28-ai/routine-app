import { addDays, dateKey } from '../dates'
import type { PracticeLog, StillnessState } from '../types'

/** Minutes in silence at which each Eye stage begins: 0, 1h, 10h, 25h, 50h, 100h, 200h, fully awake at 365h. */
export const EYE_STAGES = [0, 1, 10, 25, 50, 100, 200, 365].map((h) => h * 60)
export const EYE_NAMES = ['Closed', 'Stirring', 'Waking', 'Clarity', 'Presence', 'Insight', 'Vision', 'Awake']

export const totalMinutes = (s: StillnessState) => s.logs.reduce((n, l) => n + l.minutes, 0)

/** Stage reached plus how open the eye is (0.08 at the start → 1 when Awake), rising smoothly within each stage. */
export function eyeStage(minutes: number): { index: number; name: string; openness: number; nextAt: number | null } {
  let index = 0
  EYE_STAGES.forEach((m, i) => minutes >= m && (index = i))
  const last = EYE_STAGES.length - 1
  const nextAt = index < last ? EYE_STAGES[index + 1] : null
  const within = nextAt === null ? 1 : (minutes - EYE_STAGES[index]) / (nextAt - EYE_STAGES[index])
  const openness = index === last ? 1 : 0.08 + 0.92 * ((index + within) / last)
  return { index, name: EYE_NAMES[index], openness, nextAt }
}

export function sitDoneOn(s: StillnessState, key: string): boolean {
  return s.logs.some((l) => l.kind === 'sit' && l.completed && dateKey(new Date(l.start)) === key)
}

/** Consecutive days with a completed sit, ending today; today not done yet doesn't break it. */
export function sitStreak(s: StillnessState, today: string): number {
  let key = sitDoneOn(s, today) ? today : addDays(today, -1)
  let n = 0
  while (sitDoneOn(s, key)) {
    n++
    key = addDays(key, -1)
  }
  return n
}

export function logPractice(s: StillnessState, log: PracticeLog): StillnessState {
  return { ...s, logs: [...s.logs, log] }
}
