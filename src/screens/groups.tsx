import type { ReactNode } from 'react'
import { Moon, Sun } from '../ui'
import type { Habit } from '../types'

/** The routine's groups, shared by Today and Build your routine. */
export type Group = { key: string; title: string; add: string; preset: { timeOfDay: Habit['timeOfDay']; kind: Habit['kind'] }; icon?: ReactNode; match: (h: Habit) => boolean }

export const GROUPS: Group[] = [
  { key: 'morning', title: 'Morning', add: 'Add morning habit', preset: { timeOfDay: 'morning', kind: 'build' }, icon: <Sun />, match: (h) => h.kind === 'build' && h.timeOfDay === 'morning' },
  { key: 'anytime', title: 'Anytime', add: 'Add anytime habit', preset: { timeOfDay: 'anytime', kind: 'build' }, match: (h) => h.kind === 'build' && h.timeOfDay === 'anytime' },
  { key: 'evening', title: 'Evening', add: 'Add evening habit', preset: { timeOfDay: 'evening', kind: 'build' }, icon: <Moon />, match: (h) => h.kind === 'build' && h.timeOfDay === 'evening' },
  { key: 'quit', title: 'Quit', add: 'Add habit to quit', preset: { timeOfDay: 'anytime', kind: 'quit' }, match: (h) => h.kind === 'quit' },
]
