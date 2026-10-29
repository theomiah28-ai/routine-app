import { describe, expect, it } from 'vitest'
import { isPersonalBest } from './gym'
import { seedState } from '../seed'
import type { State } from '../types'

function withHistory(weights: number[]): State {
  const s = seedState()
  s.sessions = weights.map((w, i) => ({ id: 's' + i, dayId: 'd', dayName: 'Lower A', start: i, end: i + 1, entries: [{ exerciseId: 'sq', sets: [{ weight: w - 10, reps: 8 }, { weight: w, reps: 5 }] }] }))
  return s
}

describe('isPersonalBest', () => {
  it('pb false with no history', () => expect(isPersonalBest(withHistory([]), 'sq', 100)).toBe(false))
  it('pb true when above previous top', () => expect(isPersonalBest(withHistory([95, 100]), 'sq', 102.5)).toBe(true))
  it('pb false when equal', () => expect(isPersonalBest(withHistory([95, 100]), 'sq', 100)).toBe(false))
  it('pb ignores other exercises', () => expect(isPersonalBest(withHistory([95]), 'bench', 200)).toBe(false))
})
