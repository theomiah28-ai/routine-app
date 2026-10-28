import { describe, expect, it } from 'vitest'
import { migrate } from './migrate'
import { seedState } from './seed'
import { addDays, dateKey, parseKey } from './dates'

const now = new Date(2026, 9, 28, 14, 0).getTime()
const today = dateKey(new Date(now))
const ago = (n: number) => addDays(today, -n)

function v1(habits: object[], checks: Record<string, string[]> = {}) {
  return {
    version: 1,
    name: 'Theo',
    habits,
    checks,
    splitName: 'Upper / Lower',
    days: [{ id: 'd1', name: 'Upper A', exercises: [{ exerciseId: 'e1', sets: 3 }] }],
    exercises: { e1: { id: 'e1', name: 'Bench press' } },
    sessions: [{ id: 's1', dayId: 'd1', dayName: 'Upper A', start: now - 9e6, end: now - 8e6, entries: [{ exerciseId: 'e1', sets: [{ weight: 80, reps: 8 }] }] }],
    active: null,
  }
}

const h = (id: string, name: string, extra: object = {}) => ({ id, name, kind: 'build', days: [], createdAt: ago(30), ...extra })

describe('migrate', () => {
  it('migrates v1 habits', () => {
    const s = migrate(
      v1([h('a', 'Wake up by 6:30'), h('b', 'Gym', { isGym: true, days: [1, 2] }), h('c', 'Meditate'), h('d', 'Asleep by 23:00'), h('e', 'Read 20 min')]),
      now,
    )
    const by = Object.fromEntries(s.habits.map((x) => [x.name, x]))
    expect(by['Wake up by 6:30'].timeOfDay).toBe('morning')
    expect(by['Meditate'].timeOfDay).toBe('morning')
    expect(by['Meditate'].link).toBe('stillness')
    expect(by['Asleep by 23:00'].timeOfDay).toBe('evening')
    expect(by['Read 20 min'].timeOfDay).toBe('anytime')
    expect(by['Gym'].link).toBe('gym')
    expect(by['Gym'].days).toEqual([1, 2])
    expect('isGym' in by['Gym']).toBe(false)
    expect(s.version).toBe(2)
    expect(s.settings.name).toBe('Theo')
    expect(s.sessions).toHaveLength(1)
    expect(s.days[0].name).toBe('Upper A')
  })

  it('v1 keeps No PMO as a transmutation habit', () => {
    const checks: Record<string, string[]> = {}
    const tick = (n: number) => (checks[ago(n)] = [...(checks[ago(n)] ?? []), 'sr'])
    for (let i = 0; i <= 9; i++) tick(i)
    for (let i = 11; i <= 25; i++) tick(i)
    const s = migrate(v1([h('a', 'Read'), h('sr', 'No PMO', { kind: 'quit' })], checks), now)
    const sr = s.habits.find((x) => x.id === 'sr')!
    expect(sr.link).toBe('transmutation')
    expect(s.checks[ago(0)]).toContain('sr')
    expect(s.transmutation.longestDays).toBe(15)
    expect(s.transmutation.start).toBeNull()
  })

  it('migrates without SR habit', () => {
    const s = migrate(v1([h('a', 'Read')]), now)
    expect(s.habits.some((x) => x.link === 'transmutation')).toBe(false)
    expect(s.settings.faith).toBe(true)
    expect(s.settings.goals).toEqual([])
  })

  it('normalises v2 preview state', () => {
    const s = seedState() as unknown as Record<string, any>
    delete s.settings.faith
    delete s.settings.goals
    s.transmutation = { start: parseKey(ago(5)).getTime(), longestDays: 3, relapses: [] }
    s.habits = [{ id: 'm', name: 'Meditate', kind: 'build', days: [], createdAt: ago(20), timeOfDay: 'morning', link: 'stillness' }]
    const n = migrate(s, now)
    expect(n.settings.faith).toBe(true)
    expect(n.settings.goals).toEqual([])
    const sr = n.habits.find((x) => x.link === 'transmutation')!
    expect(sr.name).toBe('No PMO')
    for (let i = 0; i <= 5; i++) expect(n.checks[ago(i)]).toContain(sr.id)
    expect(n.transmutation.start).toBeNull()
    expect(n.habits.find((x) => x.id === 'm')!.minutes).toBe(30)
    // idempotent
    expect(migrate(structuredClone(n), now)).toEqual(n)
  })

  it('import v1 backup', () => {
    const raw = v1([h('a', 'Read'), h('sr', 'NoFap', { kind: 'quit' })], { [today]: ['sr'] })
    expect(migrate(JSON.parse(JSON.stringify(raw)), now)).toEqual(migrate(raw, now))
  })

  it('v2 passthrough', () => {
    const s = migrate(v1([h('a', 'Read')]), now)
    expect(migrate(structuredClone(s), now)).toEqual(s)
  })

  it('seed has no habits', () => {
    const s = seedState()
    expect(s.version).toBe(2)
    expect(s.habits).toEqual([])
    expect(s.settings.faith).toBe(true)
  })
})

describe('srFromHabit', () => {
  it('respects the habit schedule and finds the longest run', async () => {
    const { srFromHabit } = await import('./migrate')
    const { weekday } = await import('./dates')
    // scheduled on every weekday except the one 3 days ago
    const skip = weekday(ago(3))
    const habit = { id: 'sr', name: 'Stay clean', kind: 'quit' as const, days: [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== skip), createdAt: ago(40), timeOfDay: 'anytime' as const }
    const checks: Record<string, string[]> = {}
    for (const n of [0, 1, 2, 4, 5]) checks[ago(n)] = ['sr']
    for (let n = 10; n < 30; n++) checks[ago(n)] = ['sr']
    const r = srFromHabit(habit, checks, today)
    expect(r.start).toBe(parseKey(ago(5)).getTime())
    // 20 ticked days, 3 of them on the unscheduled weekday
    expect(r.longestDays).toBe(17)
  })
})
