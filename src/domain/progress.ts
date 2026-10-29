import { addDays, dateKey, weekday } from '../dates'
import { dayItems } from './completion'
import { currentStreak } from './streaks'
import type { Section, State } from '../types'

export type Filter = Section | 'all'

/** Share of a day's items done, or null when nothing counted (future, or before tracking began). */
export function dayPct(s: State, key: string, filter: Filter): number | null {
  if (key > dateKey(new Date())) return null
  const items = dayItems(s, key).filter((i) => filter === 'all' || i.section === filter)
  if (!items.length) return null
  return items.filter((i) => i.done).length / items.length
}

export function monthDays(s: State, year: number, month: number, filter: Filter): { key: string; pct: number | null }[] {
  const days: { key: string; pct: number | null }[] = []
  for (let d = new Date(year, month, 1); d.getMonth() === month; d.setDate(d.getDate() + 1)) {
    const key = dateKey(d)
    days.push({ key, pct: dayPct(s, key, filter) })
  }
  return days
}

function range(s: State, from: string, to: string, filter: Filter): number[] {
  const out: number[] = []
  for (let k = from; k <= to; k = addDays(k, 1)) {
    const p = dayPct(s, k, filter)
    if (p !== null) out.push(p)
  }
  return out
}

export function consistency(s: State, from: string, to: string, filter: Filter): number {
  const r = range(s, from, to, filter)
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0
}

export const perfectDays = (s: State, from: string, to: string, filter: Filter) => range(s, from, to, filter).filter((p) => p === 1).length

const PLURAL = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

/** Up to two plain-language observations from the last 8 weeks. */
export function observations(s: State, today: string): string[] {
  const out: string[] = []
  const byDay: number[][] = [[], [], [], [], [], [], []]
  for (let i = 1; i <= 56; i++) {
    const k = addDays(today, -i)
    const p = dayPct(s, k, 'all')
    if (p !== null) byDay[weekday(k)].push(p)
  }
  const avgs = byDay.map((v) => (v.length >= 3 ? v.reduce((a, b) => a + b, 0) / v.length : null))
  const known = avgs.filter((a): a is number => a !== null)
  if (known.length >= 5) {
    const mean = known.reduce((a, b) => a + b, 0) / known.length
    const worst = avgs.reduce<number>((w, a, i) => (a !== null && (avgs[w] === null || a < avgs[w]!) ? i : w), 0)
    if (avgs[worst] !== null && mean - avgs[worst]! >= 0.15) out.push(`${PLURAL[worst]} are where your days slip.`)
  }
  const best = s.habits.map((h) => ({ h, n: currentStreak(h, s.checks, today) })).sort((a, b) => b.n - a.n)[0]
  if (best && best.n >= 3) out.push(`Your longest run going: ${best.h.name}, ${best.n} days.`)
  return out
}
