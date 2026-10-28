export type BreathKind = 'in' | 'hold' | 'out' | 'rest'

export interface BreathPattern {
  rounds: number
  phases: { kind: BreathKind; seconds: number; label?: string }[]
}

export const totalSeconds = (p: BreathPattern) => p.rounds * p.phases.reduce((n, ph) => n + ph.seconds, 0)

/** Where a breathing session is after `ms`. `remaining` is whole seconds left in the phase (for the count). */
export function breathAt(p: BreathPattern, ms: number): { round: number; phase: number; progress: number; remaining: number; done: boolean } {
  const roundLen = p.phases.reduce((n, ph) => n + ph.seconds, 0) * 1000
  if (ms >= roundLen * p.rounds) {
    return { round: p.rounds, phase: p.phases.length - 1, progress: 1, remaining: 0, done: true }
  }
  const round = Math.floor(ms / roundLen)
  let t = ms - round * roundLen
  let phase = 0
  while (t >= p.phases[phase].seconds * 1000) {
    t -= p.phases[phase].seconds * 1000
    phase++
  }
  const len = p.phases[phase].seconds * 1000
  return { round: round + 1, phase, progress: t / len, remaining: Math.ceil((len - t) / 1000), done: false }
}

/** Orb size for a phase position: grows on the inhale, holds, shrinks on the exhale. */
export function orbScale(kind: BreathKind, progress: number): number {
  const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2
  if (kind === 'in') return 0.55 + 0.45 * ease(progress)
  if (kind === 'out') return 1 - 0.45 * ease(progress)
  if (kind === 'hold') return 1
  return 0.55
}
