import { describe, expect, it } from 'vitest'
import { ascentDays, faithDays, meditationMinutes, relapseToday, sectionProgress, statuePoints, statueStage } from './progression'
import { eyeStage } from './stillness'
import { seedState } from '../seed'
import { addDays, parseKey, todayKey } from '../dates'
import type { Habit, State } from '../types'

const today = todayKey()
const now = Date.now()
const hab = (id: string, link?: Habit['link'], extra: Partial<Habit> = {}): Habit => ({ id, name: id, kind: link === 'transmutation' ? 'quit' : 'build', days: [], createdAt: addDays(today, -40), timeOfDay: 'anytime', link, ...extra })
const base = (): State => ({ ...seedState(), habits: [] })

describe('progression', () => {
  it('progression with no linked habits', () => {
    const s = base()
    expect(ascentDays(s, today)).toBe(0)
    expect(meditationMinutes(s)).toBe(0)
    expect(faithDays(s, today)).toBe(0)
    expect(statuePoints(s)).toBe(0)
    expect(() => sectionProgress(s, today)).not.toThrow()
  })

  it('ascent counts the linked habit streak', () => {
    const s = base()
    s.habits = [hab('sr', 'transmutation')]
    for (let i = 0; i < 9; i++) s.checks[addDays(today, -i)] = ['sr']
    expect(ascentDays(s, today)).toBe(9)
  })

  it('relapse today zeroes the ascent', () => {
    const s = base()
    s.habits = [hab('sr', 'transmutation')]
    for (let i = 0; i < 9; i++) s.checks[addDays(today, -i)] = ['sr']
    const r = relapseToday(s, now)
    expect(r.checks[today] ?? []).not.toContain('sr')
    expect(ascentDays(r, today)).toBe(0)
    r.checks[today] = ['sr']
    expect(ascentDays(r, today)).toBe(0)
    expect(r.transmutation.longestDays).toBeGreaterThanOrEqual(9)
  })

  it('sit and habit same day count once', () => {
    const s = base()
    s.habits = [hab('m', 'stillness', { minutes: 30 })]
    s.checks[today] = ['m']
    s.stillness.logs = [{ id: 'l', kind: 'sit', start: parseKey(today).getTime() + 7 * 3600e3, minutes: 30, completed: true }]
    expect(meditationMinutes(s)).toBe(30)
    s.checks[addDays(today, -1)] = ['m']
    expect(meditationMinutes(s)).toBe(60)
    s.stillness.logs.push({ id: 'b', kind: 'box', start: parseKey(today).getTime(), minutes: 10, completed: true })
    expect(meditationMinutes(s)).toBe(60)
  })

  it('eye awake at 365h', () => {
    expect(eyeStage(365 * 60).name).toBe('Awake')
    expect(eyeStage(364 * 60).index).toBe(6)
    expect(eyeStage(25 * 60).name).toBe('Clarity')
  })

  it('statue stage from points', () => {
    expect(statueStage(0).index).toBe(0)
    expect(statueStage(12).index).toBe(2)
    expect(statueStage(250).index).toBe(7)
    const s = base()
    s.sessions = Array.from({ length: 5 }, (_, i) => ({ id: 's' + i, dayId: 'd', dayName: 'A', start: i, end: i, entries: [] }))
    s.milestones = [{ id: 'pb:1:x', section: 'gym', title: 'PB', value: '1', at: 0, seen: true }]
    expect(statuePoints(s)).toBe(6)
  })

  it('faith days counts habit or prayer', () => {
    const s = base()
    s.habits = [hab('b', 'faith', { minutes: 20 })]
    s.checks[addDays(today, -1)] = ['b']
    s.faith.days[addDays(today, -2)] = { prayer: true }
    expect(faithDays(s, today)).toBe(2)
  })

  it('faith hidden when off', () => {
    const s = base()
    s.settings.faith = false
    expect(sectionProgress(s, today).some((p) => p.section === 'faith')).toBe(false)
    s.settings.faith = true
    expect(sectionProgress(s, today).some((p) => p.section === 'faith')).toBe(true)
  })
})

describe('review fixes', () => {
  it('a relapse day stays out of the streak on later days', async () => {
    const s = base()
    s.habits = [hab('sr', 'transmutation')]
    const d2 = addDays(today, -2)
    for (let i = 2; i < 10; i++) s.checks[addDays(today, -i)] = ['sr']
    s.transmutation.relapses = [parseKey(d2).getTime() + 3600e3]
    s.checks[addDays(today, -1)] = ['sr']
    s.checks[today] = ['sr']
    expect(ascentDays(s, today)).toBe(2)
  })

  it('habitStreak uses the Ascent for the transmutation habit', async () => {
    const { habitStreak } = await import('./progression')
    const s = base()
    s.habits = [hab('sr', 'transmutation'), hab('r')]
    for (let i = 0; i < 20; i++) s.checks[addDays(today, -i)] = ['sr', 'r']
    const r = relapseToday(s, now)
    r.checks[today] = ['sr', 'r']
    expect(habitStreak(r, r.habits[0], today)).toBe(0)
    expect(habitStreak(r, r.habits[1], today)).toBe(20)
  })

  it('cross brightness grows through every faith stage', async () => {
    const { faithBrightness } = await import('./progression')
    const vals = [0, 1, 7, 14, 30, 45, 60, 100, 200, 365].map(faithBrightness)
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThan(vals[i - 1])
    expect(faithBrightness(365)).toBe(1)
    expect(faithBrightness(60)).toBeLessThan(1)
  })

  it('warns before a link move or minutes change rewrites progress', async () => {
    const { linkChangeImpact } = await import('./progression')
    const s = base()
    s.habits = [hab('m', 'stillness', { minutes: 30, name: 'Meditate' }), hab('n')]
    for (let i = 0; i < 4; i++) s.checks[addDays(today, -i)] = ['m']
    expect(linkChangeImpact(s, 'n', 'stillness', 30)).toContain('Meditate')
    expect(linkChangeImpact(s, 'm', 'stillness', 10)).toContain('2h')
    expect(linkChangeImpact(s, 'm', 'stillness', 30)).toBeNull()
    expect(linkChangeImpact(s, 'n', undefined, undefined)).toBeNull()
  })
})
