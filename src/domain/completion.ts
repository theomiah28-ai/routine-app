import { addDays, parseKey, weekday } from '../dates'
import { isChecked, isScheduled } from './streaks'
import { faithDone, type FaithItem } from './faith'
import { sitDoneOn } from './stillness'
import { workHit } from './work'
import type { Section, State } from '../types'

export interface DayItem {
  id: string
  label: string
  section: Section
  done: boolean
}

/** The day the V2 sections started counting (set together at seed/migration). */
export const sectionsSince = (s: State) => s.work.createdAt

function transmutationDone(s: State, key: string): boolean | null {
  const t = s.transmutation
  if (t.start === null) return null
  const dayStart = parseKey(key).getTime()
  const dayEnd = parseKey(addDays(key, 1)).getTime()
  if (t.relapses.some((r) => r >= dayStart && r < dayEnd)) return false
  return t.start < dayEnd || t.relapses.some((r) => r >= dayEnd)
}

const FAITH: { item: FaithItem; label: string }[] = [
  { item: 'prayer', label: 'Morning prayer' },
  { item: 'reading', label: "Today's reading" },
  { item: 'gratitude', label: 'Evening gratitude' },
]

/** Everything that counts towards a day's completion ring. */
export function dayItems(s: State, key: string): DayItem[] {
  const items: DayItem[] = []
  for (const h of s.habits) {
    // The Morning Sit item stands in for habits linked to Stillness
    if (h.link === 'stillness' || key < h.createdAt || !isScheduled(h, key)) continue
    items.push({ id: `habit:${h.id}`, label: h.name, section: h.link === 'gym' ? 'gym' : 'routine', done: isChecked(s.checks, h.id, key) })
  }
  if (key < sectionsSince(s)) return items

  items.push({ id: 'stillness:sit', label: 'Morning Sit', section: 'stillness', done: sitDoneOn(s.stillness, key) })
  if (key >= s.faith.createdAt) {
    for (const f of FAITH) items.push({ id: `faith:${f.item}`, label: f.label, section: 'faith', done: faithDone(s.faith, key, f.item) })
  }
  if (key >= s.work.createdAt && (s.work.days.length === 0 || s.work.days.includes(weekday(key)))) {
    items.push({ id: 'work:targets', label: 'Hit work targets', section: 'work', done: workHit(s.work, key) })
  }
  const t = transmutationDone(s, key)
  if (t !== null) items.push({ id: 'transmutation', label: 'Stay clean', section: 'transmutation', done: t })
  return items
}

export function completion(s: State, key: string): { done: number; total: number; pct: number } {
  const items = dayItems(s, key)
  const done = items.filter((i) => i.done).length
  return { done, total: items.length, pct: items.length ? done / items.length : 0 }
}
