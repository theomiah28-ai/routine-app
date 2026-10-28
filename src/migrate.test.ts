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

  it('converts No PMO', () => {
    const checks: Record<string, string[]> = {}
    const tick = (n: number) => (checks[ago(n)] = [...(checks[ago(n)] ?? []), 'sr'])
    for (let i = 0; i <= 9; i++) tick(i)
    for (let i = 11; i <= 25; i++) tick(i)
    checks[ago(3)].push('a')
    const s = migrate(v1([h('a', 'Read'), h('sr', 'No PMO', { kind: 'quit' })], checks), now)
    expect(s.habits.map((x) => x.id)).toEqual(['a'])
    expect(Object.values(s.checks).some((l) => l.includes('sr'))).toBe(false)
    expect(s.checks[ago(3)]).toEqual(['a'])
    expect(s.transmutation.start).toBe(parseKey(ago(9)).getTime())
    expect(s.transmutation.longestDays).toBe(15)
    expect(s.transmutation.needsPick).toBeFalsy()
  })

  it('migrates without SR habit', () => {
    const s = migrate(v1([h('a', 'Read')]), now)
    expect(s.transmutation.start).toBeNull()
    expect(s.transmutation.needsPick).toBe(true)
  })

  it('import v1 backup', () => {
    const raw = v1([h('a', 'Read'), h('sr', 'NoFap', { kind: 'quit' })], { [today]: ['sr'] })
    expect(migrate(JSON.parse(JSON.stringify(raw)), now)).toEqual(migrate(raw, now))
  })

  it('v2 passthrough', () => {
    const s = migrate(v1([h('a', 'Read')]), now)
    expect(migrate(structuredClone(s), now)).toEqual(s)
  })

  it('seed is v2', () => {
    const s = seedState()
    expect(s.version).toBe(2)
    expect(s.habits.some((x) => /pmo/i.test(x.name))).toBe(false)
    expect(s.transmutation.start).not.toBeNull()
  })
})
