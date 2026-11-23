import { describe, expect, it } from 'vitest'
import { isPersonalBest, nextTarget, repRange, trend } from './gym'
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

const sessions = (...bests: [number, number][][]): State => {
  const s = seedState()
  s.sessions = bests.map((sets, i) => ({ id: 's' + i, dayId: 'd', dayName: 'Upper', start: i, end: i + 1, entries: [{ exerciseId: 'bp', sets: sets.map(([weight, reps]) => ({ weight, reps })) }] }))
  return s
}

describe('repRange', () => {
  it('reads ranges and fixed reps', () => {
    expect(repRange('8-12')).toEqual([8, 12])
    expect(repRange('8–12')).toEqual([8, 12])
    expect(repRange('5')).toEqual([5, 5])
    expect(repRange('')).toBeNull()
    expect(repRange('12-8')).toBeNull()
  })
})

describe('nextTarget', () => {
  it('nothing to aim at before the first session', () => expect(nextTarget(sessions(), 'bp', '8-12', 3)).toBeNull())

  it('adds 2.5kg once every set hits the top of the range', () => {
    const t = nextTarget(sessions([[60, 12], [60, 12], [60, 12]]), 'bp', '8-12', 3)!
    expect(t).toMatchObject({ weight: 62.5, reps: 8, up: true })
  })

  it('keeps the weight and adds a rep while still climbing the range', () => {
    const t = nextTarget(sessions([[60, 11], [60, 10], [60, 9]]), 'bp', '8-12', 3)!
    expect(t).toMatchObject({ weight: 60, reps: 10, up: false })
  })

  it('does not add weight if fewer sets than planned were done', () => {
    expect(nextTarget(sessions([[60, 12], [60, 12]]), 'bp', '8-12', 3)!.up).toBe(false)
  })

  it('without a range, aims for one more rep', () => {
    expect(nextTarget(sessions([[100, 5], [100, 5]]), 'bp', undefined, 2)).toMatchObject({ weight: 100, reps: 6 })
  })
})

describe('trend', () => {
  it('new until there are two sessions', () => expect(trend(sessions([[60, 10]]), 'bp').kind).toBe('new'))
  it('shows the weight gained', () => expect(trend(sessions([[60, 10]], [[62.5, 8]]), 'bp')).toEqual({ kind: 'up', text: '+2.5kg' }))
  it('shows reps gained at the same weight', () => expect(trend(sessions([[60, 10]], [[60, 12]]), 'bp')).toEqual({ kind: 'up', text: '+2 reps' }))
  it('counts sessions stuck since the last best', () => {
    expect(trend(sessions([[60, 10]], [[62.5, 8]], [[62.5, 8]], [[60, 12]]), 'bp')).toEqual({ kind: 'flat', sessions: 2 })
  })
})
