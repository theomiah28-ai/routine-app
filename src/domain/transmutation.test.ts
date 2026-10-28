import { describe, expect, it } from 'vitest'
import { elapsed, longest, relapse, stageIndex } from './transmutation'

const DAY = 86400e3

describe('transmutation', () => {
  it('stage at 0 days is Foundation (0)', () => expect(stageIndex(0)).toBe(0))
  it('stage at 6 days is still Foundation', () => expect(stageIndex(5)).toBe(0))
  it('stage at 6 elapsed days reaches Creation (day 7)', () => expect(stageIndex(6)).toBe(1))
  it('stage at 42 days is 3 (Magnetism)', () => expect(stageIndex(42)).toBe(3))
  it('stage at 365 is 6', () => expect(stageIndex(365)).toBe(6))

  it('elapsed splits days and hours', () => {
    expect(elapsed(0, 42 * DAY + 6 * 3600e3)).toEqual({ ms: 42 * DAY + 6 * 3600e3, days: 42, hours: 6 })
  })

  it('clamps negative elapsed', () => {
    expect(elapsed(10 * DAY, 0)).toEqual({ ms: 0, days: 0, hours: 0 })
    expect(elapsed(null, 5)).toEqual({ ms: 0, days: 0, hours: 0 })
  })

  it('relapse resets start to now and updates longest', () => {
    const now = 50 * DAY
    const t = relapse({ start: 8 * DAY, longestDays: 30, relapses: [] }, now)
    expect(t.start).toBe(now)
    expect(t.longestDays).toBe(42)
    expect(t.relapses).toEqual([now])
  })

  it('relapse keeps a longer record', () => {
    const t = relapse({ start: 40 * DAY, longestDays: 90, relapses: [] }, 50 * DAY)
    expect(t.longestDays).toBe(90)
  })

  it('longest includes the running streak', () => {
    expect(longest({ start: 0, longestDays: 10, relapses: [] }, 20 * DAY)).toBe(20)
  })
})
