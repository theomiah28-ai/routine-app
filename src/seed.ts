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

/** The V2-only sections, fresh. */
export function defaultSections(today: string, now: number): Pick<State, 'transmutation' | 'stillness' | 'faith' | 'work' | 'screenTime' | 'milestones' | 'journal'> {
  return {
    transmutation: { start: null, longestDays: 0, relapses: [] },
    stillness: { sitMinutes: 30, logs: [] },
    faith: { createdAt: today, days: {}, planId: 'wisdom-wealth', planProgress: {} },
    work: {
      createdAt: today,
      targets: { videos: 1, products: 1, hoursWorked: 6, deepMinutes: 180 },
      days: [],
      log: {},
      focusStart: null,
    },
    screenTime: { limit: 120, foggy: 120, rotting: 240, manual: {} },
    milestones: [],
    journal: {},
  }
}

export function seedState(): State {
  const createdAt = todayKey()
  return {
    version: 2,
    settings: { name: '', showEsoteric: false, onboarded: false, restSeconds: 120, faith: true, goals: [] },
    // Nothing forced: onboarding suggests, the user picks
    habits: [],
    checks: {},
    splitName: 'Upper / Lower',
    ...split(),
    sessions: [],
    active: null,
    ...defaultSections(createdAt, Date.now()),
  }
}
