import { nextDayId } from '../gym'
import { ASCENT } from '../content/ascent'
import { elapsed, stageIndex } from '../domain/transmutation'
import { sitDoneOn, sitStreak, totalMinutes, eyeStage } from '../domain/stillness'
import { todayKey } from '../dates'
import { faithDone, faithStreak } from '../domain/faith'
import { workHit, workLog } from '../domain/work'
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
    { label: 'Faith', value: `${faithStreak(s.faith, today)}d`, sub: faithDone(s.faith, today, 'prayer') ? 'Prayed today' : 'Morning prayer', route: { name: 'faith' }, lit: faithDone(s.faith, today, 'prayer') },
    { label: 'Work', value: s.work.focusStart ? 'In focus' : `${Math.round(workLog(s.work, today).deepMinutes / 6) / 10}h deep`, sub: workHit(s.work, today) ? 'Targets hit' : `${workLog(s.work, today).videos} videos · ${workLog(s.work, today).products} products`, route: { name: 'work' }, lit: workHit(s.work, today) || !!s.work.focusStart },
    { label: 'Gym', value: next?.name ?? 'Set up', sub: s.active ? 'Workout in progress' : 'Next up', route: { name: 'gym' }, lit: !!s.active },
    { label: 'Screen time', value: 'Preview', sub: 'Brain state', route: { name: 'screentime' } },
  ]
}
