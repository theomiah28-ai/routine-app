import { allDoneOn, linkStreak, linkedHabits, windowScore } from './tracked'
import type { State } from '../types'

export type LungState = 'healthy' | 'strained' | 'damaged' | 'blackened'

export const LUNG_NAMES: Record<LungState, string> = { healthy: 'Healthy', strained: 'Strained', damaged: 'Damaged', blackened: 'Blackened' }

export const healthHabits = (s: State) => linkedHabits(s, 'health')

/** Clean = every health habit due that day was ticked. Null when none were due (or none existed yet). */
export const cleanOn = (s: State, key: string) => allDoneOn(s, 'health', key)

/** Lung health 0..1 over the last two weeks. Null when there are no health habits. */
export const lungScore = (s: State, today: string) => windowScore(s, 'health', today)

export function lungState(score: number): LungState {
  if (score >= 0.85) return 'healthy'
  if (score >= 0.6) return 'strained'
  if (score >= 0.3) return 'damaged'
  return 'blackened'
}

/** Consecutive clean days ending today. */
export const healthStreak = (s: State, today: string) => linkStreak(s, 'health', today)
