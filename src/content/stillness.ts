import type { BreathPattern } from '../domain/breath'

export type Intent = 'focus' | 'clarity' | 'energy' | 'calm' | 'sleep'
export const INTENTS: { id: Intent; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'clarity', label: 'Clarity' },
  { id: 'energy', label: 'Energy' },
  { id: 'calm', label: 'Calm' },
  { id: 'sleep', label: 'Sleep' },
]

export interface Breath {
  id: 'box' | 'power' | 'calm'
  name: string
  blurb: string
  intents: Intent[]
  pattern: BreathPattern
  /** Draw the light around a square */
  square?: boolean
}

const power = (): BreathPattern['phases'] => [
  ...Array.from({ length: 30 }, (_, i) => [
    { kind: 'in' as const, seconds: 0.8, label: `Breathe in · ${i + 1}` },
    { kind: 'out' as const, seconds: 0.8, label: `Let go · ${i + 1}` },
  ]).flat(),
  { kind: 'rest', seconds: 60, label: 'Exhale and hold' },
  { kind: 'in', seconds: 2, label: 'Deep breath in' },
  { kind: 'hold', seconds: 15, label: 'Hold' },
]

export const BREATHS: Breath[] = [
  {
    id: 'box',
    name: 'Box breathing',
    blurb: 'Steady focus. In 4 · Hold 4 · Out 4 · Hold 4',
    intents: ['focus', 'calm'],
    square: true,
    pattern: {
      rounds: 8,
      phases: [
        { kind: 'in', seconds: 4, label: 'Breathe in' },
        { kind: 'hold', seconds: 4, label: 'Hold' },
        { kind: 'out', seconds: 4, label: 'Breathe out' },
        { kind: 'rest', seconds: 4, label: 'Hold' },
      ],
    },
  },
  {
    id: 'power',
    name: 'Power breath',
    blurb: 'Wake the body. 30 fast breaths, then a long hold. 3 rounds',
    intents: ['energy'],
    pattern: { rounds: 3, phases: power() },
  },
  {
    id: 'calm',
    name: 'Calm breath',
    blurb: 'Settle the nervous system. In 4 · Hold 7 · Out 8',
    intents: ['calm', 'sleep'],
    pattern: {
      rounds: 6,
      phases: [
        { kind: 'in', seconds: 4, label: 'Breathe in' },
        { kind: 'hold', seconds: 7, label: 'Hold' },
        { kind: 'out', seconds: 8, label: 'Breathe out slowly' },
      ],
    },
  },
]

export interface Visualisation {
  id: string
  name: string
  blurb: string
  intents: Intent[]
  minutes: number
  lines: string[]
}

export const VISUALISATIONS: Visualisation[] = [
  {
    id: 'finished-goal',
    name: 'The finished goal',
    blurb: 'See it done, in detail',
    intents: ['focus', 'clarity'],
    minutes: 8,
    lines: [
      'Close your eyes. Let the breath slow down on its own.',
      'Bring one goal to mind. The one that matters most right now.',
      'Now see it already done. Not someday. Done.',
      'Where are you standing? What can you see around you?',
      'Notice the small details. The light. The sounds. Who is there.',
      'Feel what it feels like in your body to have finished it.',
      'Stay here. Let that feeling become familiar.',
      'Now look back from this place. What was the first step you took?',
      'Hold onto that step. It is today\'s work.',
      'When you are ready, open your eyes and go take it.',
    ],
  },
  {
    id: 'future-self',
    name: 'Your future self',
    blurb: 'Meet who you are becoming',
    intents: ['clarity'],
    minutes: 8,
    lines: [
      'Sit tall. Breathe in slowly, and let it go.',
      'Picture yourself one year from now. The version who kept going.',
      'Look at how they carry themselves. The posture. The eyes.',
      'What do they do first thing in the morning?',
      'What have they stopped doing?',
      'Ask them one question. Listen for the answer.',
      'Notice that they are not a stranger. They are you, further along.',
      'Take one of their habits back with you into today.',
      'Breathe in. Open your eyes as them.',
    ],
  },
  {
    id: 'day-ahead',
    name: 'The day ahead',
    blurb: 'Walk through today before it starts',
    intents: ['focus', 'energy'],
    minutes: 5,
    lines: [
      'Breathe in through the nose. Out through the mouth.',
      'See the first hour of your day going exactly to plan.',
      'See yourself sitting down to deep work. Phone away. Fully in.',
      'Picture the hardest task. Watch yourself start it without hesitation.',
      'See the moment you finish. The calm that follows.',
      'Picture the evening. You did what you said you would.',
      'Carry that picture with you. Open your eyes and begin.',
    ],
  },
]
