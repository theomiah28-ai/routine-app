import { ASCENT } from '../content/ascent'

/** Highest stage reached for a count of clean days ("Day N" on the Nth day). Foundation while still at 0. */
export function stageIndex(days: number): number {
  let i = 0
  ASCENT.forEach((s, idx) => {
    if (days >= s.day) i = idx
  })
  return i
}
