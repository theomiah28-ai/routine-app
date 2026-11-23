import { defaultSections } from '../seed'
import type { State } from '../types'

export const journeyStarted = (s: State) => !!s.settings.journeyStart

/** "Begin your journey": tracking starts today for every habit in the routine. Pressing it again changes nothing. */
export function beginJourney(s: State, today: string): State {
  if (journeyStarted(s)) return s
  return {
    ...s,
    settings: { ...s.settings, journeyStart: today },
    habits: s.habits.map((h) => ({ ...h, createdAt: today })),
  }
}

/**
 * Start again from day 1: wipe every tick, workout, milestone and log but keep the routine and gym plan,
 * so "Begin your journey" can be pressed again on the day you start.
 */
export function resetProgress(s: State, today: string, now: number): State {
  const fresh = defaultSections(today, now)
  return {
    ...s,
    ...fresh,
    stillness: { ...fresh.stillness, sitMinutes: s.stillness.sitMinutes },
    settings: { ...s.settings, journeyStart: undefined, whatsNew: false },
    habits: s.habits.map((h) => ({ ...h, createdAt: today })),
    checks: {},
    sessions: [],
    active: null,
  }
}
