import { describe, expect, it } from 'vitest'
import { completeReading, faithDone, planToday, verseOfDay } from './faith'
import { VERSES } from '../content/faith'
import { addDays, todayKey } from '../dates'
import type { FaithState } from '../types'

const today = todayKey()
const f = (over: Partial<FaithState> = {}): FaithState => ({ createdAt: addDays(today, -30), days: {}, planId: 'wisdom-wealth', planProgress: {}, ...over })

describe('faith', () => {
  it('verse of day stable for a date and changes daily', () => {
    expect(verseOfDay('2026-10-28')).toEqual(verseOfDay('2026-10-28'))
    expect(verseOfDay('2026-10-28').ref).not.toBe(verseOfDay('2026-10-29').ref)
    expect(VERSES).toContain(verseOfDay('2031-01-01'))
  })

  it('faithDone reads the day', () => {
    const s = f({ days: { [today]: { prayer: true } } })
    expect(faithDone(s, today, 'prayer')).toBe(true)
    expect(faithDone(s, today, 'gratitude')).toBe(false)
  })

  it('completeReading advances once per day', () => {
    let s = completeReading(f(), today)
    s = completeReading(s, today)
    expect(s.planProgress['wisdom-wealth']).toBe(1)
    expect(s.days[today].reading).toBe(true)
    expect(planToday(s, addDays(today, 1))?.ref).toBe('Proverbs 2')
  })

  it("planToday keeps today's chapter after reading it", () => {
    const s = completeReading(f(), today)
    expect(planToday(s, today)?.ref).toBe('Proverbs 1')
  })

  it('planToday null without plan', () => {
    expect(planToday(f({ planId: null }), today)).toBeNull()
  })
})
