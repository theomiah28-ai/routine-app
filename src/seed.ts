import { todayKey } from './dates'
import type { Exercise, SplitDay, State } from './types'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

function split(): { days: SplitDay[]; exercises: Record<string, Exercise> } {
  const exercises: Record<string, Exercise> = {}
  const ex = (name: string, sets = 3) => {
    let found = Object.values(exercises).find((e) => e.name === name)
    if (!found) {
      found = { id: uid(), name }
      exercises[found.id] = found
    }
    return { exerciseId: found.id, sets }
  }
  const days: SplitDay[] = [
    { id: uid(), name: 'Upper A', exercises: [ex('Bench press'), ex('Barbell row'), ex('Overhead press'), ex('Pull-ups')] },
    { id: uid(), name: 'Lower A', exercises: [ex('Squat'), ex('Romanian deadlift'), ex('Leg press'), ex('Calf raise', 4)] },
    { id: uid(), name: 'Upper B', exercises: [ex('Incline DB press'), ex('Lat pulldown'), ex('Lateral raise'), ex('Bicep curl')] },
    { id: uid(), name: 'Lower B', exercises: [ex('Deadlift'), ex('Split squat'), ex('Leg curl'), ex('Calf raise', 4)] },
  ]
  return { days, exercises }
}

export function seedState(): State {
  const createdAt = todayKey()
  const h = (name: string, kind: 'build' | 'quit', extra: { days?: number[]; isGym?: boolean } = {}) => ({
    id: uid(),
    name,
    kind,
    days: extra.days ?? [],
    isGym: extra.isGym,
    createdAt,
  })
  return {
    version: 1,
    name: 'Theo',
    habits: [
      h('Wake up by 6:30', 'build'),
      h('Gym', 'build', { days: [1, 2, 4, 5], isGym: true }),
      h('Read 20 min', 'build'),
      h('Meditate', 'build'),
      h('Asleep by 23:00', 'build'),
      h('No vaping', 'quit'),
      h('No PMO', 'quit'),
    ],
    checks: {},
    splitName: 'Upper / Lower',
    ...split(),
    sessions: [],
    active: null,
  }
}
