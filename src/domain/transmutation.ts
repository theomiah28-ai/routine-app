import { ASCENT } from '../content/ascent'
import type { TransmutationState } from '../types'

const DAY = 86400e3

export function elapsed(start: number | null, now: number): { ms: number; days: number; hours: number } {
  const ms = start === null ? 0 : Math.max(0, now - start)
  return { ms, days: Math.floor(ms / DAY), hours: Math.floor((ms % DAY) / 3600e3) }
}

/** Highest stage reached for a count of clean days ("Day N" on the Nth day). Foundation while still at 0. */
export function stageIndex(days: number): number {
  let i = 0
  ASCENT.forEach((s, idx) => {
    if (days >= s.day) i = idx
  })
  return i
}

export function longest(t: TransmutationState, now: number): number {
  return Math.max(t.longestDays, elapsed(t.start, now).days)
}

/** Full reset: no grace, no partial credit. */
export function relapse(t: TransmutationState, now: number): TransmutationState {
  return { ...t, start: now, longestDays: longest(t, now), relapses: [...t.relapses, now], needsPick: false }
}
