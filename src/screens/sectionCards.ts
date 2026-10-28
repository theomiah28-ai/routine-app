import { nextDayId } from '../gym'
import type { Route } from '../nav'
import type { State } from '../types'

export interface SectionCard {
  label: string
  value: string
  sub: string
  route: Route
  /** Gold-lit: something earned or done today */
  lit?: boolean
}

/** One-line state for each section's tile on Today. */
export function sectionCards(s: State): SectionCard[] {
  const next = s.days.find((d) => d.id === nextDayId(s))
  return [
    { label: 'Transmutation', value: '—', sub: 'The Ascent', route: { name: 'transmutation' } },
    { label: 'Stillness', value: '—', sub: 'Morning Sit', route: { name: 'stillness' } },
    { label: 'Faith', value: '—', sub: 'Walk with God', route: { name: 'faith' } },
    { label: 'Work', value: '—', sub: 'Daily inputs', route: { name: 'work' } },
    { label: 'Gym', value: next?.name ?? 'Set up', sub: s.active ? 'Workout in progress' : 'Next up', route: { name: 'gym' }, lit: !!s.active },
    { label: 'Screen time', value: 'Preview', sub: 'Brain state', route: { name: 'screentime' } },
  ]
}
