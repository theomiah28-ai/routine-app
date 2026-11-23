import type { MoonState } from '../domain/sleep'

// How much of the moon is lit, and how many stars come out around it
const LOOK: Record<MoonState, { lit: number; stars: number; glow: boolean }> = {
  full: { lit: 1, stars: 7, glow: true },
  waning: { lit: 0.72, stars: 4, glow: true },
  half: { lit: 0.48, stars: 2, glow: false },
  crescent: { lit: 0.2, stars: 0, glow: false },
}

const STARS = [[30, 40, 2.2], [182, 34, 1.8], [198, 120, 2.4], [22, 150, 1.6], [168, 186, 2], [54, 196, 1.8], [104, 14, 1.6]]

/** The Sleep symbol: a moon that stays full while you keep your wake-up and bedtime. */
export function Moon({ state, width = 200 }: { state: MoonState; width?: number }) {
  const l = LOOK[state]
  // The shadow disc slides off the moon as more of it is lit
  const shadowX = 110 - 140 * l.lit
  const id = `moon-${state}`
  return (
    <svg width={width} height={width} viewBox="0 0 220 220" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-f`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f7f9ff" />
          <stop offset="1" stopColor="#b9c7e2" />
        </radialGradient>
        <filter id={`${id}-g`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
        <clipPath id={`${id}-c`}><circle cx="110" cy="110" r="64" /></clipPath>
      </defs>
      {STARS.slice(0, l.stars).map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#dce8ff" className="moon-star" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      {l.glow && <circle cx="110" cy="110" r="64" fill="#8fb6ff" opacity={0.45 * l.lit} filter={`url(#${id}-g)`} className="moon-glow" />}
      <circle cx="110" cy="110" r="64" fill={`url(#${id}-f)`} />
      <g fill="#8d9dbd" opacity="0.4">
        <circle cx="88" cy="92" r="9" /><circle cx="128" cy="124" r="12" /><circle cx="104" cy="140" r="6" /><circle cx="134" cy="88" r="5" />
      </g>
      <circle cx={shadowX} cy="110" r="64" fill="#0e0f13" opacity="0.92" clipPath={`url(#${id}-c)`} style={{ transition: 'cx 0.9s' }} />
      <circle cx="110" cy="110" r="64" fill="none" stroke="#eef3ff" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  )
}
