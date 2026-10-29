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
    { id: 'sr', name: 'No PMO', kind: 'quit', days: [], createdAt: since, timeOfDay: 'anytime', link: 'transmutation' },
  ]
  return s
}

describe('dayItems', () => {
  it('counts scheduled habits only', () => {
    const s = base()
    s.habits[0].days = [(parseKey(today).getDay() + 1) % 7]
    expect(dayItems(s, today).some((i) => i.id === 'habit:a')).toBe(false)
  })

  it('linked habits carry their section', () => {
    const items = dayItems(base(), today)
    expect(items.find((i) => i.id === 'habit:g')?.section).toBe('gym')
    expect(items.find((i) => i.id === 'habit:sr')?.section).toBe('transmutation')
    expect(items.find((i) => i.id === 'habit:a')?.section).toBe('routine')
  })

  it('only habits count — no section items', () => {
    expect(dayItems(base(), today).every((i) => i.id.startsWith('habit:'))).toBe(true)
  })

  it('completion for a past day', () => {
    const s = base()
    s.checks[yesterday] = ['a']
    expect(dayItems(s, yesterday).find((i) => i.id === 'habit:a')?.done).toBe(true)
    expect(dayItems(s, today).find((i) => i.id === 'habit:a')?.done).toBe(false)
  })

  it('nothing before a habit existed', () => {
    expect(dayItems(base(), addDays(today, -20))).toEqual([])
  })
})

describe('completion', () => {
  it('reports done/total/pct', () => {
    const s = base()
    s.checks[today] = ['a', 'g']
    expect(completion(s, today)).toEqual({ done: 2, total: 3, pct: 2 / 3 })
  })
})
