import { ASCENT } from '../content/ascent'
import { dateKey } from '../dates'
import { EYE_NAMES, eyeStage, sitStreak } from './stillness'
import { STATUE, ascentDays, meditationMinutes, statuePoints, statueStage } from './progression'
import { currentStreak } from './streaks'
import { healthStreak } from './health'
import type { Milestone, Section, State } from '../types'

const STREAKS = [7, 30, 100, 365]

/** Milestones reached but not yet recorded in state.milestones. */
export function detectMilestones(s: State, now: number): Milestone[] {
  const today = dateKey(new Date(now))
  const have = new Set(s.milestones.map((m) => m.id))
  const out: Milestone[] = []
  const add = (id: string, section: Section, title: string, value: string) => {
    if (!have.has(id)) out.push({ id, section, title, value, at: now, seen: false })
  }

  const sr = ascentDays(s, today)
  ASCENT.forEach((st, i) => i > 0 && sr >= st.day && add(`ascent:${st.day}`, 'transmutation', `Day ${st.day} · ${st.name}`, `${st.day} days`))

  const eye = eyeStage(meditationMinutes(s)).index
  for (let i = 1; i <= eye; i++) add(`eye:${i}`, 'stillness', `The Eye · ${EYE_NAMES[i]}`, `Stage ${i + 1}`)

  const sit = sitStreak(s.stillness, today)
  for (const n of STREAKS) if (sit >= n) add(`sit-streak:${n}`, 'stillness', `${n}-day sit streak`, `${n} days`)

  const hs = healthStreak(s, today)
  for (const n of STREAKS) if (hs >= n) add(`health-streak:${n}`, 'health', `${n} clean days · lungs healing`, `${n} days`)

  const statue = statueStage(statuePoints(s)).index
  for (let i = 2; i <= statue; i++) add(`statue:${i}`, 'gym', `The statue · ${STATUE[i].name}`, `${s.sessions.length} sessions`)

  // Linked habits celebrate through their section's symbol instead
  for (const h of s.habits) {
    if (h.link) continue
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
