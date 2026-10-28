import { describe, expect, it } from 'vitest'
import { bestStreak, currentStreak } from './streaks'
import type { Habit } from './types'

const daily: Habit = { id: 'h', name: 'Read', kind: 'build', days: [], createdAt: '2026-10-01' }
// 2026-10-26 is a Monday
const monWedFri: Habit = { ...daily, days: [1, 3, 5] }
const checks = (...keys: string[]) => Object.fromEntries(keys.map((k) => [k, ['h']]))

describe('currentStreak', () => {
  it('counts consecutive ticked days including today', () => {
    expect(currentStreak(daily, checks('2026-10-26', '2026-10-27', '2026-10-28'), '2026-10-28')).toBe(3)
  })

  it('does not break because today is not ticked yet', () => {
    expect(currentStreak(daily, checks('2026-10-26', '2026-10-27'), '2026-10-28')).toBe(2)
  })

  it('breaks on a missed past day', () => {
    expect(currentStreak(daily, checks('2026-10-25', '2026-10-27', '2026-10-28'), '2026-10-28')).toBe(2)
  })

  it('skips unscheduled days', () => {
    // Mon 26, Wed 28 ticked; Tue 27 not scheduled
    expect(currentStreak(monWedFri, checks('2026-10-23', '2026-10-26', '2026-10-28'), '2026-10-28')).toBe(3)
  })

  it('stops at createdAt', () => {
    const fresh = { ...daily, createdAt: '2026-10-28' }
    expect(currentStreak(fresh, {}, '2026-10-28')).toBe(0)
    expect(currentStreak(fresh, checks('2026-10-28'), '2026-10-28')).toBe(1)
  })
})

describe('bestStreak', () => {
  it('finds the longest run', () => {
    const c = checks('2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06')
    expect(bestStreak(daily, c, '2026-10-28')).toBe(3)
  })
})
