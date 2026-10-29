// The Ascent: seven stages of Transmutation. Copy marked [Theo to write] is placeholder.
// Mental mastery and mastery of the body; no energy-centre framing.

export interface AscentStage {
  day: number
  name: string
  subtitle: string
  teaching: string
  gains: string
  costs: string
  image?: string
  insightId?: string
}

export const ASCENT: AscentStage[] = [
  {
    day: 1,
    name: 'Foundation',
    subtitle: 'The decision',
    teaching: '[Theo to write] The first day is a decision, not a feeling. You are choosing to keep what is yours and point it at something worth building.',
    gains: 'A clear line drawn. Self-respect from keeping your word to yourself.',
    costs: 'Every restart costs this day again. The first step is the one you keep repeating.',
  },
  {
    day: 7,
    name: 'Creation',
    subtitle: 'Energy starts to build',
    teaching: '[Theo to write] Around the first week the urge peaks and the body starts to hold more. This is raw material. Give it a job.',
    gains: 'More drive in the morning. Restlessness you can turn into work.',
    costs: 'Releasing now resets the build-up and the habit of giving in gets stronger.',
  },
  {
    day: 14,
    name: 'Will',
    subtitle: 'Discipline becomes yours',
    teaching: '[Theo to write] Two weeks in, you have proven you can say no. That same muscle is the one you use to do the hard thing in your business.',
    gains: 'Stronger focus, less need for cheap dopamine, decisions made faster.',
    costs: 'Fog returns, motivation dips, and you trade a proven will for a moment.',
  },
  {
    day: 30,
    name: 'Magnetism',
    subtitle: 'People notice',
    teaching: '[Theo to write] A month changes how you carry yourself. Presence, eye contact, calm confidence. Others feel it before you name it.',
    gains: 'Presence, calm confidence, people drawn to you.',
    insightId: 'energy-is-currency',
    costs: 'Fog, low drive, starting from zero.',
  },
  {
    day: 60,
    name: 'Expression',
    subtitle: 'Energy into output',
    teaching: '[Theo to write] Two months: the energy is steady enough to pour into creative work. Videos, products, ideas — this is where transmutation becomes visible in results.',
    gains: 'Creative output, clear voice, sustained deep work.',
    costs: 'Two months of compounding traded for minutes.',
  },
  {
    day: 100,
    name: 'Vision',
    subtitle: 'Seeing clearly',
    teaching: '[Theo to write] One hundred days. The mind is quieter and sharper. You see what matters and what is noise.',
    gains: 'Clarity on direction, patience, long-term thinking.',
    costs: 'The clarity you built clouds over again.',
  },
  {
    day: 365,
    name: 'Mastery',
    subtitle: 'Master of mind and body',
    teaching: '[Theo to write] A year. This is no longer a streak; it is who you are.',
    gains: 'Identity-level discipline. The proof that you can master yourself.',
    costs: 'A year of identity, given away.',
  },
]
