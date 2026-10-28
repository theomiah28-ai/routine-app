import { nextDayId } from '../gym'
import { ASCENT } from '../content/ascent'
import { elapsed, stageIndex } from '../domain/transmutation'
import { sitDoneOn, sitStreak, totalMinutes, eyeStage } from '../domain/stillness'
import { todayKey } from '../dates'
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
  const sr = elapsed(s.transmutation.start, Date.now())
  const today = todayKey()
  const sat = sitDoneOn(s.stillness, today)
  return [
    { label: 'Transmutation', value: `${sr.days} days`, sub: ASCENT[stageIndex(sr.days)].name, route: { name: 'transmutation' }, lit: sr.days >= 1 },
    { label: 'Stillness', value: sat ? 'Sat today' : `${sitStreak(s.stillness, today)}d streak`, sub: `Eye · ${eyeStage(totalMinutes(s.stillness)).name}`, route: { name: 'stillness' }, lit: sat },
    { label: 'Faith', value: '—', sub: 'Walk with God', route: { name: 'faith' } },
    { label: 'Work', value: '—', sub: 'Daily inputs', route: { name: 'work' } },
    { label: 'Gym', value: next?.name ?? 'Set up', sub: s.active ? 'Workout in progress' : 'Next up', route: { name: 'gym' }, lit: !!s.active },
    { label: 'Screen time', value: 'Preview', sub: 'Brain state', route: { name: 'screentime' } },
  ]
}
