import { addDays } from '../dates'
import type { ScreenTimeState } from '../types'

export type BrainState = 'sharp' | 'foggy' | 'rotting'

/** Sample data until the native iPhone app can read real Screen Time. */
export const SAMPLE_APPS = [
  { name: 'TikTok', minutes: 84 },
  { name: 'Instagram', minutes: 52 },
  { name: 'YouTube', minutes: 31 },
  { name: 'Snapchat', minutes: 25 },
]
export const SAMPLE_TOTAL = SAMPLE_APPS.reduce((n, a) => n + a.minutes, 0)

export function brainState(minutes: number, st: ScreenTimeState): BrainState {
  if (minutes >= st.rotting) return 'rotting'
  if (minutes >= st.foggy) return 'foggy'
  return 'sharp'
}

export const todayMinutes = (st: ScreenTimeState, key: string) => st.manual[key] ?? SAMPLE_TOTAL

/** Average daily minutes over the last `days` days, using only days with an entry; null when nothing was entered. */
export function avgMinutes(st: ScreenTimeState, today: string, days: number): number | null {
  const vals: number[] = []
  for (let i = 0; i < days; i++) {
    const k = addDays(today, -i)
    if (st.manual[k] !== undefined) vals.push(st.manual[k])
  }
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
}
