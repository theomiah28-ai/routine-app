import { describe, expect, it } from 'vitest'
import { consistency, dayPct, monthDays, observations, perfectDays } from './progress'
import { seedState } from '../seed'
import { addDays, parseKey, todayKey, weekday } from '../dates'
import type { State } from '../types'

const today = todayKey()

function base(): State {
  const s = seedState()
  const since = addDays(today, -70)
  s.habits = [{ id: 'a', name: 'Read', kind: 'build', days: [], createdAt: since, timeOfDay: 'anytime' }]
  // Only the routine habit counts in these tests: push the V2 sections into the future
  s.work.createdAt = s.faith.createdAt = addDays(today, 1)
  s.transmutation.start = null
  return s
}

describe('progress', () => {
  it('monthDays pct from completion', () => {
    const s = base()
    s.checks[today] = ['a']
    const d = parseKey(today)
    const days = monthDays(s, d.getFullYear(), d.getMonth(), 'all')
    expect(days.find((x) => x.key === today)?.pct).toBe(1)
    const tomorrow = addDays(today, 1)
    const t = days.find((x) => x.key === tomorrow)
    if (t) expect(t.pct).toBeNull()
  })

  it('filter limits to section items', () => {
    const s = base()
    s.work.createdAt = addDays(today, -5)
    s.checks[today] = ['a']
    // routine habit + Morning Sit + work targets (sections share work.createdAt)
    expect(dayPct(s, today, 'all')).toBeCloseTo(1 / 3)
    expect(dayPct(s, today, 'routine')).toBe(1)
    expect(dayPct(s, today, 'work')).toBe(0)
    expect(dayPct(s, today, 'faith')).toBeNull()
  })

  it('consistency and perfect days', () => {
    const s = base()
    s.checks[today] = ['a']
    s.checks[addDays(today, -1)] = ['a']
    expect(perfectDays(s, addDays(today, -3), today, 'all')).toBe(2)
    expect(consistency(s, addDays(today, -3), today, 'all')).toBeCloseTo(0.5)
  })

  it('weakest weekday observation', () => {
    const s = base()
    const weak = weekday(addDays(today, -1))
    for (let i = 1; i <= 56; i++) {
      const k = addDays(today, -i)
      if (weekday(k) !== weak) s.checks[k] = ['a']
    }
    const names = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']
    expect(observations(s, today)[0]).toContain(names[weak])
  })

  it('no weekday observation when days are even', () => {
    const s = base()
    for (let i = 1; i <= 56; i++) s.checks[addDays(today, -i)] = ['a']
    expect(observations(s, today).some((o) => o.includes('slip'))).toBe(false)
  })
})
