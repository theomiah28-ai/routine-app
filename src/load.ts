import { migrate } from './migrate'
import { seedState } from './seed'
import type { State } from './types'

const SECTIONS = ['settings', 'habits', 'checks', 'days', 'exercises', 'sessions', 'transmutation', 'stillness', 'faith', 'work', 'screenTime', 'milestones'] as const

/** Turn whatever is saved into a usable state, or say why it can't be — never throw. */
export function loadState(saved: unknown, now: number): { state: State } | { error: string } {
  if (saved === undefined || saved === null) return { state: seedState() }
  try {
    const state = migrate(saved, now)
    const missing = SECTIONS.filter((k) => state[k] === undefined || state[k] === null)
    if (missing.length || !Array.isArray(state.habits) || !Array.isArray(state.sessions)) {
      return { error: `Saved data is missing: ${missing.join(', ') || 'habits/sessions'}` }
    }
    return { state }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
