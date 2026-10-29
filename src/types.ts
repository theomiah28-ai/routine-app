export type HabitKind = 'build' | 'quit'
export type TimeOfDay = 'morning' | 'anytime' | 'evening'
export type HabitLink = 'transmutation' | 'stillness' | 'gym' | 'health'
export type Section = 'routine' | 'gym' | 'transmutation' | 'stillness' | 'health' | 'faith' | 'work' | 'screentime'

export interface Habit {
  id: string
  name: string
  kind: HabitKind
  /** Weekdays it's scheduled (0 = Sun … 6 = Sat). Empty = every day. */
  days: number[]
  /** YYYY-MM-DD — streaks never look further back than this. */
  createdAt: string
  timeOfDay: TimeOfDay
  /** Feeds that section's progression; auto-ticked when a workout, sit or reading is finished. */
  link?: HabitLink
  /** Minutes a tick counts for (meditation, scripture) */
  minutes?: number
  insightId?: string
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
  restEndsAt: number | null
}

export interface TransmutationState {
  /** Legacy (V2 preview): ms epoch an SR streak began. Normalised to null; the Ascent now comes from the linked habit */
  start: number | null
  longestDays: number
  relapses: number[]
}

export type PracticeKind = 'sit' | 'box' | 'power' | 'calm' | 'visualise'

export interface PracticeLog {
  id: string
  kind: PracticeKind
  start: number
  minutes: number
  completed: boolean
}

export interface ActiveSit {
  start: number
  minutes: number
  /** When the app last went to the background mid-sit */
  hiddenAt?: number
}

export interface StillnessState {
  sitMinutes: number
  logs: PracticeLog[]
  /** A Morning Sit in progress, so it survives the app being closed */
  activeSit?: ActiveSit | null
}

export interface FaithDay {
  prayer?: boolean
  reading?: boolean
  gratitude?: boolean
  note?: string
}

export interface FaithState {
  createdAt: string
  days: Record<string, FaithDay>
  planId: string | null
  /** planId → days completed */
  planProgress: Record<string, number>
}

export interface WorkInputs {
  videos: number
  products: number
  hoursWorked: number
  deepMinutes: number
}

export interface WorkState {
  createdAt: string
  targets: WorkInputs
  /** Scheduled weekdays; empty = every day */
  days: number[]
  log: Record<string, WorkInputs>
  focusStart: number | null
}

export interface ScreenTimeState {
  limit: number
  foggy: number
  rotting: number
  /** dateKey → minutes entered by hand */
  manual: Record<string, number>
}

export interface Milestone {
  id: string
  section: Section
  title: string
  value: string
  at: number
  seen: boolean
}

export interface Settings {
  name: string
  showEsoteric: boolean
  onboarded: boolean
  restSeconds: number
  /** Show the one-time "What's new in V2" sheet */
  whatsNew?: boolean
  /** Christian Faith section on */
  faith: boolean
  /** Goals picked in onboarding */
  goals: string[]
  /** Day "Begin your journey" was pressed; tracking counts from here. Unset while building the routine */
  journeyStart?: string
}

export interface State {
  version: 2
  settings: Settings
  habits: Habit[]
  /** dateKey → ids of habits ticked that day */
  checks: Record<string, string[]>
  splitName: string
  days: SplitDay[]
  exercises: Record<string, Exercise>
  sessions: Session[]
  active: ActiveWorkout | null
  transmutation: TransmutationState
  stillness: StillnessState
  faith: FaithState
  work: WorkState
  screenTime: ScreenTimeState
  milestones: Milestone[]
  /** dateKey → evening gratitude note */
  journal: Record<string, string>
}
