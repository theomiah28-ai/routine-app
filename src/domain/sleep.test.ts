import { describe, expect, it } from 'vitest'
import { moonState, onTimeOn, sleepLike, sleepName, sleepScore, sleepStreak, timeIn } from './sleep'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'
import type { Habit, State } from '../types'

const today = todayKey()
const h = (id: string, timeOfDay: Habit['timeOfDay'], extra: Partial<Habit> = {}): Habit => ({ id, name: id, kind: 'build', days: [], createdAt: addDays(today, -40), timeOfDay, link: 'sleep', ...extra })
const base = (): State => ({ ...seedState(), habits: [h('wake', 'morning'), h('bed', 'evening')] })
const tick = (s: State, n: number, ids = ['wake', 'bed']) => (s.checks[addDays(today, -n)] = ids)

describe('sleep', () => {
  it('a day is on time only when both the wake-up and the bedtime are ticked', () => {
    const s = base()
    tick(s, 1)
    tick(s, 2, ['wake'])
    expect(onTimeOn(s, addDays(today, -1))).toBe(true)
    expect(onTimeOn(s, addDays(today, -2))).toBe(false)
  })

  it('a fortnight on time keeps the moon full and counts the streak', () => {
    const s = base()
    for (let i = 1; i <= 14; i++) tick(s, i)
    expect(sleepScore(s, today)).toBe(1)
    expect(moonState(1)).toBe('full')
    expect(sleepStreak(s, today)).toBe(14)
  })

  it('missed nights wane the moon and break the streak', () => {
    const s = base()
    for (let i = 1; i <= 14; i++) if (i % 2) tick(s, i)
    expect(moonState(sleepScore(s, today)!)).not.toBe('full')
    expect(sleepStreak(s, today)).toBe(1)
  })

  it('no sleep habits means no moon', () => {
    expect(sleepScore({ ...seedState(), habits: [] }, today)).toBeNull()
  })

  it('reads and writes target times', () => {
    expect(timeIn('Wake up by 6:30')).toBe('06:30')
    expect(timeIn('Asleep by 23.00')).toBe('23:00')
    expect(timeIn('Read 20 min')).toBeUndefined()
    expect(sleepName('wake', '06:30')).toBe('Wake up by 6:30')
    expect(sleepName('bed', '23:00')).toBe('Asleep by 23:00')
  })

  it('offers unlinked wake-up and bedtime habits to adopt', () => {
    const s: State = { ...seedState(), habits: [h('Wake up by 6:30', 'morning', { link: undefined }), h('Read', 'anytime', { link: undefined }), h('Asleep by 23:00', 'evening', { link: undefined })] }
    expect(sleepLike(s).map((x) => x.name)).toEqual(['Wake up by 6:30', 'Asleep by 23:00'])
  })
})
