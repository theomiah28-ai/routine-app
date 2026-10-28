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
