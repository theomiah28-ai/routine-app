import { addDays, dateKey, parseKey } from './dates'
import { bestStreak, isChecked, isScheduled } from './domain/streaks'
import { defaultSections } from './seed'
import type { Habit, State, TimeOfDay } from './types'

export const V1_BACKUP_KEY = 'state-v1-backup'

const SR = /pmo|nofap|no fap|semen|\bsr\b/i

interface V1Habit {
  id: string
  name: string
  kind: 'build' | 'quit'
  days: number[]
  isGym?: boolean
  createdAt: string
}

function timeOfDay(name: string): TimeOfDay {
  if (/wake|morning|cold|sunlight|meditat/i.test(name)) return 'morning'
  if (/sleep|asleep|bed|gratitude|journal/i.test(name)) return 'evening'
  return 'anytime'
}

/** Midnight of the day after the last missed scheduled day (the first day of the current run). */
function runStart(h: Habit, checks: State['checks'], today: string): number {
  let key = today
  if (!isChecked(checks, h.id, key)) key = addDays(key, -1)
  while (key >= h.createdAt && (!isScheduled(h, key) || isChecked(checks, h.id, key))) key = addDays(key, -1)
  const first = key < h.createdAt ? h.createdAt : addDays(key, 1)
  return parseKey(first > today ? today : first).getTime()
}

/** Transmutation state rebuilt from a V1-style daily SR habit. */
export function srFromHabit(h: Habit, checks: State['checks'], today: string): { start: number; longestDays: number } {
  return { start: runStart(h, checks, today), longestDays: bestStreak(h, checks, today) }
}

/**
 * Fill fields added after V2 first shipped. Idempotent. A preview-era V2 state that tracked SR as a
 * start time gets a "No PMO" habit linked to Transmutation, ticked from that start day to today.
 */
export function normaliseV2(s: State, now: number): State {
  const out = structuredClone(s)
  out.settings = { ...out.settings, faith: out.settings.faith ?? true, goals: out.settings.goals ?? [] }
  const today = dateKey(new Date(now))
  // Reuse an existing NoFap-style quit habit rather than adding a second one
  const own = !out.habits.some((h) => h.link === 'transmutation') ? out.habits.find((h) => h.kind === 'quit' && !h.link && SR.test(h.name)) : undefined
  if (own) own.link = 'transmutation'
  if (out.transmutation.start !== null && !out.habits.some((h) => h.link === 'transmutation')) {
    const startKey = dateKey(new Date(out.transmutation.start))
    const id = `sr-${out.transmutation.start}`
    out.habits.push({ id, name: 'No PMO', kind: 'quit', days: [], createdAt: startKey, timeOfDay: 'anytime', link: 'transmutation' })
    for (let k = startKey; k <= today; k = addDays(k, 1)) out.checks[k] = [...(out.checks[k] ?? []), id]
  }
  // Drop the preview-era start time and its pick prompt flag
  const { needsPick: _legacy, ...t } = out.transmutation as State['transmutation'] & { needsPick?: boolean }
  out.transmutation = { ...t, start: null }
  for (const h of out.habits) if (h.link === 'stillness' && h.minutes === undefined) h.minutes = 30
  // Faith and Work left the app: unlink faith habits (their ticks stay), keep gratitude notes in the journal
  for (const h of out.habits) {
    if ((h.link as string) === 'faith') {
      delete h.link
      delete h.minutes
    }
  }
  out.journal = { ...out.journal }
  for (const [k, d] of Object.entries(out.faith?.days ?? {})) if (d.note && out.journal[k] === undefined) out.journal[k] = d.note
  if (!out.settings.journeyStart && out.settings.onboarded) out.settings.journeyStart = firstDay(out.habits, today)
  return out
}

const firstDay = (habits: { createdAt: string }[], today: string) => habits.reduce((m, h) => (h.createdAt < m ? h.createdAt : m), today)

/** Bring any saved state (V1 or V2) up to the current V2 shape. */
export function migrate(raw: unknown, now: number): State {
  const s = raw as { version?: number }
  if (s.version === 2) return normaliseV2(raw as State, now)
  const v1 = raw as {
    name?: string
    habits: V1Habit[]
    checks: Record<string, string[]>
    splitName: string
    days: State['days']
    exercises: State['exercises']
    sessions: State['sessions']
    active: (Omit<NonNullable<State['active']>, 'restEndsAt'>) | null
  }
  const today = dateKey(new Date(now))

  let stillnessLinked = false
  const habits: Habit[] = v1.habits.map(({ isGym, ...h }) => {
    const habit: Habit = { ...h, timeOfDay: timeOfDay(h.name) }
    if (isGym) habit.link = 'gym'
    else if (/meditat/i.test(h.name) && !stillnessLinked) {
      stillnessLinked = true
      habit.link = 'stillness'
      habit.minutes = 30
    }
    return habit
  })

  // SR stays a daily habit; its ticks now climb the Ascent
  const sr = habits.find((h) => h.kind === 'quit' && SR.test(h.name))
  const sections = defaultSections(today, now)
  if (sr) {
    sr.link = 'transmutation'
    sections.transmutation = { start: null, longestDays: srFromHabit(sr, v1.checks, today).longestDays, relapses: [] }
  }

  return {
    version: 2,
    settings: { name: v1.name ?? '', showEsoteric: false, onboarded: true, restSeconds: 120, whatsNew: true, faith: false, goals: [], journeyStart: firstDay(habits, today) },
    habits,
    checks: structuredClone(v1.checks),
    splitName: v1.splitName,
    days: v1.days,
    exercises: v1.exercises,
    sessions: v1.sessions,
    active: v1.active ? { ...v1.active, restEndsAt: null } : null,
    ...sections,
  }
}
