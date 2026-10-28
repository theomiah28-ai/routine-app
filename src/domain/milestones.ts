import { ASCENT } from '../content/ascent'
import { todayKey } from '../dates'
import { elapsed, stageIndex } from './transmutation'
import { EYE_NAMES, eyeStage, sitStreak, totalMinutes } from './stillness'
import { faithStreak } from './faith'
import { workStreak } from './work'
import { currentStreak } from './streaks'
import type { Milestone, Section, State } from '../types'

const STREAKS = [7, 30, 100, 365]

/** Milestones reached but not yet recorded in state.milestones. */
export function detectMilestones(s: State, now: number): Milestone[] {
  const today = todayKey()
  const have = new Set(s.milestones.map((m) => m.id))
  const out: Milestone[] = []
  const add = (id: string, section: Section, title: string, value: string) => {
    if (!have.has(id)) out.push({ id, section, title, value, at: now, seen: false })
  }

  const sr = elapsed(s.transmutation.start, now).days
  if (s.transmutation.start !== null) {
    for (let i = 1; i <= stageIndex(sr); i++) add(`ascent:${ASCENT[i].day}`, 'transmutation', `Day ${ASCENT[i].day} · ${ASCENT[i].name}`, `${ASCENT[i].day} days`)
  }

  const eye = eyeStage(totalMinutes(s.stillness)).index
  for (let i = 1; i <= eye; i++) add(`eye:${i}`, 'stillness', `The Eye · ${EYE_NAMES[i]}`, `Stage ${i + 1}`)

  const sit = sitStreak(s.stillness, today)
  for (const n of STREAKS) if (sit >= n) add(`sit-streak:${n}`, 'stillness', `${n}-day sit streak`, `${n} days`)

  const faith = faithStreak(s.faith, today)
  for (const n of STREAKS) if (faith >= n) add(`faith-streak:${n}`, 'faith', `${n} days walking in the light`, `${n} days`)

  const work = workStreak(s.work, today)
  for (const n of [7, 30, 100]) if (work >= n) add(`work-streak:${n}`, 'work', `${n} days hitting every target`, `${n} days`)

  for (const n of [10, 25, 50, 100, 250]) if (s.sessions.length >= n) add(`gym-sessions:${n}`, 'gym', `${n} workouts logged`, `${n} sessions`)

  for (const h of s.habits) {
    const st = currentStreak(h, s.checks, today)
    for (const n of STREAKS) if (st >= n) add(`habit:${h.id}:${n}`, 'routine', `${h.name} · ${n} days`, `${n} days`)
  }
  return out
}

/** When several milestones of one kind land together (e.g. after migrating), celebrate only the biggest. */
export function celebrateOnly(found: Milestone[]): Milestone[] {
  const family = (m: Milestone) => m.id.replace(/:[^:]+$/, '')
  const last = new Map<string, string>()
  for (const m of found) last.set(family(m), m.id)
  return found.map((m) => ({ ...m, seen: last.get(family(m)) !== m.id }))
}
