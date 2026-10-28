import { addDays, dateKey, weekday } from '../dates'
import type { WorkInputs, WorkState } from '../types'

export const ZERO: WorkInputs = { videos: 0, products: 0, hoursWorked: 0, deepMinutes: 0 }
export const FIELDS = ['videos', 'products', 'hoursWorked', 'deepMinutes'] as const

export const workLog = (w: WorkState, key: string): WorkInputs => ({ ...ZERO, ...w.log[key] })

const scheduled = (w: WorkState, key: string) => w.days.length === 0 || w.days.includes(weekday(key))

/** Every input with a target meets it. Targets of 0 are ignored; no targets at all is never a hit. */
export function workHit(w: WorkState, key: string): boolean {
  const log = workLog(w, key)
  const active = FIELDS.filter((f) => w.targets[f] > 0)
  return active.length > 0 && active.every((f) => log[f] >= w.targets[f])
}

/** Consecutive scheduled days hit, ending today; today not hit yet doesn't break it. */
export function workStreak(w: WorkState, today: string): number {
  let key = today
  if (!workHit(w, key)) key = addDays(key, -1)
  let n = 0
  while (key >= w.createdAt) {
    if (scheduled(w, key)) {
      if (!workHit(w, key)) break
      n++
    }
    key = addDays(key, -1)
  }
  return n
}

export function totals(w: WorkState, from: string, to: string): WorkInputs {
  const sum = { ...ZERO }
  for (let k = from; k <= to; k = addDays(k, 1)) {
    const l = workLog(w, k)
    for (const f of FIELDS) sum[f] += l[f]
  }
  return sum
}

export function setInput(w: WorkState, key: string, field: keyof WorkInputs, value: number): WorkState {
  return { ...w, log: { ...w.log, [key]: { ...workLog(w, key), [field]: value } } }
}

export const startFocus = (w: WorkState, now: number): WorkState => ({ ...w, focusStart: now })

export function stopFocus(w: WorkState, now: number): WorkState {
  if (w.focusStart === null) return w
  const key = dateKey(new Date(w.focusStart))
  const mins = Math.max(0, Math.round((now - w.focusStart) / 60e3))
  const next = setInput(w, key, 'deepMinutes', workLog(w, key).deepMinutes + mins)
  return { ...next, focusStart: null }
}
