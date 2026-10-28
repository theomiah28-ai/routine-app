export type HabitKind = 'build' | 'quit'

export interface Habit {
  id: string
  name: string
  kind: HabitKind
  /** Weekdays it's scheduled (0 = Sun … 6 = Sat). Empty = every day. */
  days: number[]
  /** Auto-ticked when a workout is finished. */
  isGym?: boolean
  /** YYYY-MM-DD — streaks never look further back than this. */
  createdAt: string
}

export interface Exercise {
  id: string
  name: string
}

export interface DayExercise {
  exerciseId: string
  sets: number
}

export interface SplitDay {
  id: string
  name: string
  exercises: DayExercise[]
}

export interface SetLog {
  weight: number
  reps: number
}

export interface SessionEntry {
  exerciseId: string
  sets: SetLog[]
}

export interface Session {
  id: string
  dayId: string
  dayName: string
  start: number
  end: number
  entries: SessionEntry[]
}

export interface ActiveSet {
  weight: string
  reps: string
  done: boolean
}

export interface ActiveWorkout {
  dayId: string
  start: number
  entries: { exerciseId: string; sets: ActiveSet[] }[]
}

export interface State {
  version: 1
  name: string
  habits: Habit[]
  /** dateKey → ids of habits ticked that day */
  checks: Record<string, string[]>
  splitName: string
  days: SplitDay[]
  exercises: Record<string, Exercise>
  sessions: Session[]
  active: ActiveWorkout | null
}
