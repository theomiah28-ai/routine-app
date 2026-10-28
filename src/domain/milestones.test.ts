import { describe, expect, it } from 'vitest'
import { detectMilestones, celebrateOnly } from './milestones'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'
import type { State } from '../types'

const now = Date.now()
const today = todayKey()

function base(): State {
  const s = seedState()
  s.habits = [{ id: 'sr', name: 'No PMO', kind: 'quit', days: [], createdAt: addDays(today, -60), timeOfDay: 'anytime', link: 'transmutation' }]
  for (let i = 0; i < 2; i++) s.checks[addDays(today, -i)] = ['sr']
  return s
}
const srDays = (s: State, n: number) => {
  for (let i = 0; i < n; i++) s.checks[addDays(today, -i)] = ['sr']
}
const ids = (s: State) => detectMilestones(s, now).map((m) => m.id)

describe('milestones', () => {
  it('ascent milestone at day 7 once', () => {
    const s = base()
    expect(ids(s).some((i) => i.startsWith('ascent:'))).toBe(false)
    srDays(s, 7)
    expect(ids(s)).toContain('ascent:7')
  })

  it('no duplicate when already recorded', () => {
    const s = base()
    srDays(s, 7)
    s.milestones = detectMilestones(s, now)
    expect(ids(s)).toEqual([])
  })

  it('statue stage at 12 workouts', () => {
    const s = base()
    s.sessions = Array.from({ length: 12 }, (_, i) => ({ id: 's' + i, dayId: 'd', dayName: 'A', start: i, end: i, entries: [] }))
    expect(ids(s)).toContain('statue:2')
    expect(ids(s)).not.toContain('statue:3')
  })

  it('faith milestones skipped when faith is off', () => {
    const s = base()
    s.faith.days = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [addDays(today, -i), { prayer: true }]))
    expect(ids(s)).toContain('faith:7')
    s.settings.faith = false
    expect(ids(s).some((i) => i.startsWith('faith'))).toBe(false)
  })

  it('habit streak 7', () => {
    const s = base()
    s.habits = [{ id: 'h', name: 'Read', kind: 'build', days: [], createdAt: addDays(today, -20), timeOfDay: 'anytime' }]
    for (let i = 0; i < 7; i++) s.checks[addDays(today, -i)] = ['h']
    expect(ids(s)).toContain('habit:h:7')
    expect(detectMilestones(s, now).find((m) => m.id === 'habit:h:7')?.title).toContain('Read')
  })

  it('celebrates only the highest per family', () => {
    const s = base()
    srDays(s, 35)
    const found = celebrateOnly(detectMilestones(s, now))
    expect(found.filter((m) => !m.seen && m.id.startsWith('ascent')).map((m) => m.id)).toEqual(['ascent:30'])
    expect(found.find((m) => m.id === 'ascent:7')?.seen).toBe(true)
  })
})
