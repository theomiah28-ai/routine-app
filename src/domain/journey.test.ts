import { describe, expect, it } from 'vitest'
import { beginJourney, journeyStarted } from './journey'
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
