import { describe, expect, it } from 'vitest'
import { completion, dayItems } from './completion'
import { seedState } from '../seed'
import { addDays, parseKey, todayKey } from '../dates'
import type { State } from '../types'

const today = todayKey()
const yesterday = addDays(today, -1)

function base(): State {
  const s = seedState()
  const since = addDays(today, -10)
  s.habits = [
    { id: 'a', name: 'Read', kind: 'build', days: [], createdAt: since, timeOfDay: 'anytime' },
    { id: 'g', name: 'Gym', kind: 'build', days: [], createdAt: since, timeOfDay: 'anytime', link: 'gym' },
    { id: 'm', name: 'Meditate', kind: 'build', days: [], createdAt: since, timeOfDay: 'morning', link: 'stillness' },
  ]
  s.faith.createdAt = since
  s.work.createdAt = since
  s.transmutation = { start: parseKey(since).getTime(), longestDays: 0, relapses: [] }
  return s
}

describe('dayItems', () => {
  it('counts scheduled habits only', () => {
    const s = base()
    const wd = parseKey(today).getDay()
    s.habits[0].days = [(wd + 1) % 7]
    expect(dayItems(s, today).some((i) => i.id === 'habit:a')).toBe(false)
  })

  it('transmutation counts done while streak unbroken', () => {
    const s = base()
    expect(dayItems(s, today).find((i) => i.section === 'transmutation')?.done).toBe(true)
    s.transmutation.start = null
    expect(dayItems(s, today).some((i) => i.section === 'transmutation')).toBe(false)
  })

  it('relapse day is not done', () => {
    const s = base()
    const r = parseKey(today).getTime() + 3600e3
    s.transmutation = { start: r, longestDays: 9, relapses: [r] }
    expect(dayItems(s, today).find((i) => i.section === 'transmutation')?.done).toBe(false)
    expect(dayItems(s, yesterday).find((i) => i.section === 'transmutation')?.done).toBe(true)
  })

  it('completion for a past day', () => {
    const s = base()
    s.checks[yesterday] = ['a']
    const items = dayItems(s, yesterday)
    expect(items.find((i) => i.id === 'habit:a')?.done).toBe(true)
    expect(dayItems(s, today).find((i) => i.id === 'habit:a')?.done).toBe(false)
  })

  it('screen time excluded', () => {
    expect(dayItems(base(), today).some((i) => i.section === 'screentime')).toBe(false)
  })

  it('gym habit counted once and stillness-linked habit folded into the sit', () => {
    const items = dayItems(base(), today)
    expect(items.filter((i) => i.section === 'gym' || i.id === 'habit:g')).toHaveLength(1)
    expect(items.some((i) => i.id === 'habit:m')).toBe(false)
    expect(items.filter((i) => i.section === 'stillness')).toHaveLength(1)
  })

  it('nothing before sections existed', () => {
    const s = base()
    const before = addDays(today, -20)
    expect(dayItems(s, before)).toEqual([])
  })
})

describe('completion', () => {
  it('reports done/total/pct', () => {
    const s = base()
    s.checks[today] = ['a', 'g']
    const c = completion(s, today)
    // a, g, sit, prayer, reading, gratitude, work, transmutation
    expect(c.total).toBe(8)
    expect(c.done).toBe(3)
    expect(c.pct).toBeCloseTo(3 / 8)
  })
})
