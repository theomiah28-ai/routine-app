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
