import { ASCENT } from '../content/ascent'
import type { TransmutationState } from '../types'

const DAY = 86400e3

export function elapsed(start: number | null, now: number): { ms: number; days: number; hours: number } {
  const ms = start === null ? 0 : Math.max(0, now - start)
  return { ms, days: Math.floor(ms / DAY), hours: Math.floor((ms % DAY) / 3600e3) }
}

/** Highest stage reached. "Day N" is reached once N-1 full days have passed, so Day 1 is reached at the start. */
export function stageIndex(days: number): number {
  let i = 0
  ASCENT.forEach((s, idx) => {
    if (days >= s.day - 1) i = idx
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
