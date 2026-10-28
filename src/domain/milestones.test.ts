import { describe, expect, it } from 'vitest'
import { detectMilestones, celebrateOnly } from './milestones'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'
import type { State } from '../types'

const now = Date.now()
const today = todayKey()
const DAY = 864e5

function base(): State {
  const s = seedState()
  s.habits = []
  s.transmutation = { start: now - 2 * DAY, longestDays: 0, relapses: [] }
  return s
}
const ids = (s: State) => detectMilestones(s, now).map((m) => m.id)

describe('milestones', () => {
  it('ascent milestone at day 7 once', () => {
    const s = base()
    expect(ids(s).some((i) => i.startsWith('ascent:'))).toBe(false)
    s.transmutation.start = now - 6.5 * DAY
    expect(ids(s)).toContain('ascent:7')
  })

  it('no duplicate when already recorded', () => {
    const s = base()
    s.transmutation.start = now - 6.5 * DAY
    s.milestones = detectMilestones(s, now)
    expect(ids(s)).toEqual([])
  })

  it('gym sessions 10', () => {
    const s = base()
    s.sessions = Array.from({ length: 10 }, (_, i) => ({ id: 's' + i, dayId: 'd', dayName: 'A', start: i, end: i, entries: [] }))
    expect(ids(s)).toContain('gym-sessions:10')
    expect(ids(s)).not.toContain('gym-sessions:25')
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
    s.sessions = Array.from({ length: 30 }, (_, i) => ({ id: 's' + i, dayId: 'd', dayName: 'A', start: i, end: i, entries: [] }))
    const found = celebrateOnly(detectMilestones(s, now))
    expect(found.filter((m) => !m.seen).map((m) => m.id)).toEqual(['gym-sessions:25'])
    expect(found.find((m) => m.id === 'gym-sessions:10')?.seen).toBe(true)
  })
})
