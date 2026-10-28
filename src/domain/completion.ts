import { isChecked, isScheduled } from './streaks'
import type { Section, State } from '../types'

export interface DayItem {
  id: string
  label: string
  section: Section
  done: boolean
}

/** What counts towards a day's ring: the habits scheduled on Today. */
export function dayItems(s: State, key: string): DayItem[] {
  const items: DayItem[] = []
  for (const h of s.habits) {
    if (key < h.createdAt || !isScheduled(h, key)) continue
    const section: Section = h.link ?? 'routine'
    items.push({ id: `habit:${h.id}`, label: h.name, section, done: isChecked(s.checks, h.id, key) })
  }
  return items
}

export function completion(s: State, key: string): { done: number; total: number; pct: number } {
  const items = dayItems(s, key)
  const done = items.filter((i) => i.done).length
  return { done, total: items.length, pct: items.length ? done / items.length : 0 }
}
