import refs from './faith-refs.json'
import verses from './kjv-verses.json'

export type Theme = 'purpose' | 'prosperity' | 'discipline' | 'renew' | 'closer' | 'courage'

export const THEMES: Record<Theme, string> = {
  purpose: 'Purpose',
  prosperity: 'Prosperity',
  discipline: 'Discipline',
  renew: 'Renew your mind',
  closer: 'Closer to God',
  courage: 'Courage',
}

export interface Verse {
  ref: string
  theme: Theme
  /** Theo's "why this matters for builders" note */
  note?: string
}

export interface Plan {
  id: string
  name: string
  subtitle: string
  theme: Theme
  /** One chapter reference per day, e.g. 'Proverbs 6' */
  days: string[]
}

/** Theo's notes per verse reference. [Theo to write] */
const NOTES: Record<string, string> = {}

export const VERSES: Verse[] = (refs.verses as { ref: string; theme: Theme }[]).map((v) => ({ ...v, note: NOTES[v.ref] }))
export const PLANS: Plan[] = refs.plans as Plan[]

export const verseText = (ref: string): string => (verses as Record<string, string>)[ref] ?? ''

/** Chapter text, loaded on demand so the reading plans don't weigh down app start-up. */
export async function loadChapter(ref: string): Promise<string[]> {
  const { default: chapters } = await import('./kjv-chapters.json')
  return (chapters as Record<string, string[]>)[ref] ?? []
}
