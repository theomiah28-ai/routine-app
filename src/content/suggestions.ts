import type { HabitKind, HabitLink, TimeOfDay } from '../types'

export type Goal = 'physique' | 'money' | 'focus' | 'energy' | 'god' | 'sleep' | 'quit'

export const GOALS: { id: Goal; label: string; blurb: string }[] = [
  { id: 'physique', label: 'Build a better physique', blurb: 'Train, eat and recover like it matters' },
  { id: 'money', label: 'Make more money', blurb: 'More output on the things that pay' },
  { id: 'focus', label: 'Get more focus', blurb: 'A quieter, sharper mind' },
  { id: 'energy', label: 'Have more energy', blurb: 'Wake up ready' },
  { id: 'god', label: 'Connect with God', blurb: 'Faith as a daily practice' },
  { id: 'sleep', label: 'Sleep better', blurb: 'Win tomorrow tonight' },
  { id: 'quit', label: 'Quit bad habits', blurb: 'Take your energy back' },
]

export interface Suggestion {
  name: string
  kind: HabitKind
  timeOfDay: TimeOfDay
  why: string
  goals: Goal[]
  link?: HabitLink
  minutes?: number
  days?: number[]
  insightId?: string
}

export const SUGGESTIONS: Suggestion[] = [
  { name: 'Gym', kind: 'build', timeOfDay: 'anytime', goals: ['physique', 'energy'], link: 'gym', days: [1, 2, 4, 5], why: 'Four sessions a week, progressive overload. Every workout carves the statue in Journey.' },
  { name: 'Hit protein target', kind: 'build', timeOfDay: 'anytime', goals: ['physique'], why: 'Muscle is built in the kitchen as much as the gym.' },
  { name: 'Walk 8k steps', kind: 'build', timeOfDay: 'anytime', goals: ['physique', 'energy'], why: 'Movement clears the head and keeps the body honest.' },
  { name: 'Deep work block', kind: 'build', timeOfDay: 'morning', goals: ['money', 'focus'], why: 'Your best hours on the work that pays. Log the minutes in Work.' },
  { name: 'Post a video', kind: 'build', timeOfDay: 'anytime', goals: ['money'], why: 'Output compounds. One a day beats a perfect one a month.' },
  { name: 'Test a product', kind: 'build', timeOfDay: 'anytime', goals: ['money'], why: 'Winners come from volume. Keep the pipeline moving.' },
  { name: 'Meditate 30 min', kind: 'build', timeOfDay: 'morning', goals: ['focus', 'energy'], link: 'stillness', minutes: 30, insightId: 'the-silent-sit', why: 'Pure awareness, no intention. Every minute opens the Eye in Journey.' },
  { name: 'No phone first hour', kind: 'build', timeOfDay: 'morning', goals: ['focus', 'money'], why: 'Your first inputs shape the whole day. Start with your goals, not other people’s.' },
  { name: 'Write 3 goals', kind: 'build', timeOfDay: 'morning', goals: ['focus', 'money'], insightId: 'programming-the-subconscious', why: 'Writing goals daily keeps them in front of the subconscious.' },
  { name: 'Morning sunlight, 10 min', kind: 'build', timeOfDay: 'morning', goals: ['energy', 'sleep'], why: 'Light in your eyes early sets your sleep and energy rhythm for the day.' },
  { name: 'Cold shower', kind: 'build', timeOfDay: 'morning', goals: ['energy'], why: 'A hard thing done first trains you to start hard things.' },
  { name: 'Wake up by 6:30', kind: 'build', timeOfDay: 'morning', goals: ['energy', 'sleep', 'money'], why: 'A fixed wake time anchors your body clock and gives you the quiet hours.' },
  { name: 'Pray', kind: 'build', timeOfDay: 'morning', goals: ['god'], link: 'faith', minutes: 10, why: 'Start the day talking to God. Every day brightens the cross in Journey.' },
  { name: 'Read the Bible 20 min', kind: 'build', timeOfDay: 'anytime', goals: ['god'], why: 'Scripture daily. The reading plans in Faith give you direction.' },
  { name: 'Evening gratitude', kind: 'build', timeOfDay: 'evening', goals: ['god', 'sleep'], why: 'End the day by naming what was good.' },
  { name: 'Asleep by 23:00', kind: 'build', timeOfDay: 'evening', goals: ['sleep', 'energy'], why: 'Tomorrow’s discipline is decided by tonight’s sleep.' },
  { name: 'No screens after 22:00', kind: 'build', timeOfDay: 'evening', goals: ['sleep', 'focus'], why: 'Let your brain wind down before bed.' },
  { name: 'No PMO', kind: 'quit', timeOfDay: 'anytime', goals: ['quit', 'focus', 'energy'], link: 'transmutation', insightId: 'energy-is-currency', why: 'Keep your energy and transmute it. Every clean day climbs the Ascent in Journey.' },
  { name: 'No vaping', kind: 'quit', timeOfDay: 'anytime', goals: ['quit', 'energy'], insightId: 'rewiring-66-days', why: 'Every craving you ride out weakens the habit loop.' },
  { name: 'No junk food', kind: 'quit', timeOfDay: 'anytime', goals: ['quit', 'physique'], why: 'Cheap food, like cheap dopamine, costs more than it gives.' },
]

/** Suggestions for the picked goals, most relevant first; faith habits only when Faith is on. */
export function suggestFor(goals: Goal[], faith: boolean): Suggestion[] {
  return SUGGESTIONS.filter((s) => (faith || (!s.goals.includes('god') && s.link !== 'faith')) && s.goals.some((g) => goals.includes(g)))
    .map((s) => ({ s, n: s.goals.filter((g) => goals.includes(g)).length }))
    .sort((a, b) => b.n - a.n)
    .map((x) => x.s)
}
