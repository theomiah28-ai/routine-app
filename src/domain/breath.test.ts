import { describe, expect, it } from 'vitest'
import { breathAt, totalSeconds, type BreathPattern } from './breath'

const box: BreathPattern = {
  rounds: 2,
  phases: [
    { kind: 'in', seconds: 4 },
    { kind: 'hold', seconds: 4 },
    { kind: 'out', seconds: 4 },
    { kind: 'rest', seconds: 4 },
  ],
}

describe('breathAt', () => {
  it('starts at round 1, first phase', () => {
    expect(breathAt(box, 0)).toEqual({ round: 1, phase: 0, progress: 0, remaining: 4, done: false })
  })
  it('moves through phases', () => {
    const b = breathAt(box, 5000)
    expect(b.phase).toBe(1)
    expect(b.progress).toBeCloseTo(0.25)
    expect(b.remaining).toBe(3)
  })
  it('wraps to the next round', () => {
    expect(breathAt(box, 16000)).toMatchObject({ round: 2, phase: 0 })
  })
  it('finishes after all rounds', () => {
    expect(breathAt(box, 32000).done).toBe(true)
    expect(totalSeconds(box)).toBe(32)
  })
})
