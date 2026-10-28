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

/** Bring any saved state (V1 or V2) up to the current V2 shape. */
export function migrate(raw: unknown, now: number): State {
  const s = raw as { version?: number }
  if (s.version === 2) return raw as State
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

  const habits: Habit[] = v1.habits.map(({ isGym, ...h }) => {
    const habit: Habit = { ...h, timeOfDay: timeOfDay(h.name) }
    if (isGym) habit.link = 'gym'
    else if (/meditat/i.test(h.name)) habit.link = 'stillness'
    return habit
  })

  const sr = habits.find((h) => h.kind === 'quit' && SR.test(h.name))
  const sections = defaultSections(today, now)
  if (sr) {
    sections.transmutation = { ...srFromHabit(sr, v1.checks, today), relapses: [] }
  } else {
    sections.transmutation = { start: null, longestDays: 0, relapses: [], needsPick: true }
  }

  const checks: State['checks'] = {}
  for (const [k, ids] of Object.entries(v1.checks)) {
    const kept = sr ? ids.filter((id) => id !== sr.id) : ids
    if (kept.length) checks[k] = kept
  }

  return {
    version: 2,
    settings: { name: v1.name ?? '', showEsoteric: false, onboarded: true, restSeconds: 120, whatsNew: true },
    habits: sr ? habits.filter((h) => h.id !== sr.id) : habits,
    checks,
    splitName: v1.splitName,
    days: v1.days,
    exercises: v1.exercises,
    sessions: v1.sessions,
    active: v1.active ? { ...v1.active, restEndsAt: null } : null,
    ...sections,
  }
}
