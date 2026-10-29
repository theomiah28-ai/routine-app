import { describe, expect, it } from 'vitest'
import { cleanOn, healthStreak, lungScore, lungState } from './health'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'
import type { Habit, State } from '../types'

const today = todayKey()
const q = (id: string, extra: Partial<Habit> = {}): Habit => ({ id, name: id, kind: 'quit', days: [], createdAt: addDays(today, -40), timeOfDay: 'anytime', link: 'health', ...extra })
const base = (): State => ({ ...seedState(), habits: [q('vape'), q('weed')] })
const tick = (s: State, n: number, ids = ['vape', 'weed']) => (s.checks[addDays(today, -n)] = ids)

describe('health', () => {
  it('a day is clean only when every health habit is ticked', () => {
    const s = base()
    tick(s, 1)
    tick(s, 2, ['vape'])
    expect(cleanOn(s, addDays(today, -1))).toBe(true)
    expect(cleanOn(s, addDays(today, -2))).toBe(false)
  })

  it('no health habits means no lungs to score', () => {
    const s = { ...seedState(), habits: [] }
    expect(lungScore(s, today)).toBeNull()
    expect(healthStreak(s, today)).toBe(0)
  })

  it('all clean days keep the lungs fully healthy; today unticked does not hurt yet', () => {
    const s = base()
    for (let i = 1; i <= 14; i++) tick(s, i)
    expect(lungScore(s, today)).toBe(1)
    expect(lungState(1)).toBe('healthy')
    expect(healthStreak(s, today)).toBe(14)
  })

  it('missed days make the lungs worse, and recent misses hurt more', () => {
    const s = base()
    for (let i = 1; i <= 14; i++) tick(s, i)
    const recentMiss = structuredClone(s)
    delete recentMiss.checks[addDays(today, -1)]
    const oldMiss = structuredClone(s)
    delete oldMiss.checks[addDays(today, -13)]
    expect(lungScore(recentMiss, today)!).toBeLessThan(1)
    expect(lungScore(recentMiss, today)!).toBeLessThan(lungScore(oldMiss, today)!)
    const none = base()
    expect(lungState(lungScore(none, today)!)).toBe('blackened')
  })

  it('only counts days since the habits began', () => {
    const s = { ...seedState(), habits: [q('vape', { createdAt: addDays(today, -2) })] }
    tick(s, 1, ['vape'])
    tick(s, 2, ['vape'])
    expect(lungScore(s, today)).toBe(1)
  })
})
