import type { HabitKind, TimeOfDay } from '../types'

export interface Suggestion {
  name: string
  kind: HabitKind
  timeOfDay: TimeOfDay
  why: string
  insightId?: string
  /** Ticked by default in onboarding */
  pick?: boolean
}

export const SUGGESTIONS: Suggestion[] = [
  { name: 'Wake up by 6:30', kind: 'build', timeOfDay: 'morning', why: 'A fixed wake time anchors your body clock and gives you the quiet hours.', pick: true },
  { name: 'Morning sunlight, 10 min', kind: 'build', timeOfDay: 'morning', why: 'Light in your eyes early sets your sleep and energy rhythm for the day.' },
  { name: 'Cold shower', kind: 'build', timeOfDay: 'morning', why: 'A hard thing done first trains you to start hard things. Big lift in alertness.' },
  { name: 'No phone first hour', kind: 'build', timeOfDay: 'morning', why: 'Your first inputs shape the whole day. Start with your goals, not other people’s.', pick: true },
  { name: 'Make your bed', kind: 'build', timeOfDay: 'morning', why: 'A small win in the first minute. Proof you do what you say.' },
  { name: 'Write 3 goals', kind: 'build', timeOfDay: 'morning', why: 'Writing goals daily keeps them in front of the subconscious.', insightId: 'programming-the-subconscious' },
  { name: 'Read 20 min', kind: 'build', timeOfDay: 'anytime', why: 'Twenty minutes a day is a book or two a month.', pick: true },
  { name: 'Walk 8k steps', kind: 'build', timeOfDay: 'anytime', why: 'Movement clears the head and keeps the body honest.' },
  { name: 'Asleep by 23:00', kind: 'build', timeOfDay: 'evening', why: 'Tomorrow’s discipline is decided by tonight’s sleep.', pick: true },
  { name: 'No junk food', kind: 'quit', timeOfDay: 'anytime', why: 'Cheap food, like cheap dopamine, costs more than it gives.', insightId: 'energy-is-currency' },
  { name: 'No vaping', kind: 'quit', timeOfDay: 'anytime', why: 'Every craving you ride out weakens the habit loop.', insightId: 'rewiring-66-days' },
]
