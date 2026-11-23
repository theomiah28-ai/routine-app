import { describe, expect, it } from 'vitest'
import { migrate } from '../migrate'
import { beginJourney, journeyStarted, resetProgress } from './journey'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'

const today = todayKey()

describe('begin your journey', () => {
  it('a fresh state has not begun', () => {
    expect(journeyStarted(seedState())).toBe(false)
  })

  it('beginning starts tracking today for every habit', () => {
    const s = seedState()
    s.habits = [
      { id: 'a', name: 'Read', kind: 'build', days: [], createdAt: addDays(today, -5), timeOfDay: 'anytime' },
      { id: 'b', name: 'No PMO', kind: 'quit', days: [], createdAt: addDays(today, -2), timeOfDay: 'anytime', link: 'transmutation' },
    ]
    const r = beginJourney(s, today)
    expect(journeyStarted(r)).toBe(true)
    expect(r.settings.journeyStart).toBe(today)
    expect(r.habits.every((h) => h.createdAt === today)).toBe(true)
  })

  it('beginning twice keeps the first start', () => {
    const s = beginJourney(seedState(), addDays(today, -3))
    expect(beginJourney(s, today).settings.journeyStart).toBe(addDays(today, -3))
  })
})

describe('start again from day 1', () => {
  it('clears all progress but keeps the routine and gym plan', () => {
    const s = beginJourney(seedState(), addDays(today, -30))
    s.settings.name = 'Theo'
    s.settings.onboarded = true
    s.habits = [{ id: 'a', name: 'No PMO', kind: 'quit', days: [], createdAt: addDays(today, -30), timeOfDay: 'anytime', link: 'transmutation' }]
    s.checks = { [addDays(today, -1)]: ['a'] }
    s.days = [{ id: 'up', name: 'Upper', exercises: [{ exerciseId: 'bp', sets: 3, reps: '8-12' }] }]
    s.sessions = [{ id: 's', dayId: 'up', dayName: 'Upper', start: 1, end: 2, entries: [] }]
    s.milestones = [{ id: 'm', section: 'gym', title: 't', value: 'v', at: 1, seen: true }]
    s.transmutation = { start: null, longestDays: 40, relapses: [1] }
    s.stillness = { sitMinutes: 20, logs: [{ kind: 'sit', start: 1, minutes: 20 } as never] }

    const r = resetProgress(s, today, Date.now())
    expect(journeyStarted(r)).toBe(false)
    expect(r.checks).toEqual({})
    expect(r.sessions).toEqual([])
    expect(r.milestones).toEqual([])
    expect(r.transmutation).toEqual({ start: null, longestDays: 0, relapses: [] })
    expect(r.stillness).toEqual({ sitMinutes: 20, logs: [] })
    expect(r.habits.map((h) => h.name)).toEqual(['No PMO'])
    expect(r.days).toEqual(s.days)
    expect(r.settings).toMatchObject({ name: 'Theo', onboarded: true })
  })
})

describe('start again survives saving', () => {
  it('a reset state saved and loaded again (or imported as a backup) is still not begun', () => {
    const s = beginJourney(seedState(), addDays(today, -30))
    s.settings.onboarded = true
    s.habits = [{ id: 'a', name: 'Gym', kind: 'build', days: [], createdAt: addDays(today, -30), timeOfDay: 'morning', link: 'gym' }]
    const loaded = migrate(JSON.parse(JSON.stringify(resetProgress(s, today, Date.now()))), Date.now())
    expect(journeyStarted(loaded)).toBe(false)
    expect(journeyStarted(beginJourney(loaded, today))).toBe(true)
    expect(beginJourney(loaded, today).settings.journeyStart).toBe(today)
  })
})
