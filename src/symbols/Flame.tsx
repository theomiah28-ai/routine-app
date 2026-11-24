import { useId } from 'react'

const OUTER = 'M50 6C58 30 84 44 84 78a34 34 0 0 1-68 0c0-21 12-32 19-46 4 13 10 18 15 21 2-16-3-31 0-47z'
const INNER = 'M50 56c6 12 15 18 15 31a15 15 0 0 1-30 0c0-10 8-17 15-31z'

/** The Fuel flame: grows and brightens from a cold outline (level 0) to a full blue flame (level 1). */
export function Flame({ level, size = 56 }: { level: number; size?: number }) {
  const l = Math.max(0, Math.min(1, level))
  const id = 'flame' + useId().replace(/:/g, '')
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2f6fe4" />
          <stop offset="0.6" stopColor="#4d8dff" />
          <stop offset="1" stopColor="#b8d0ff" />
        </linearGradient>
      </defs>
      <path d={OUTER} fill="none" stroke="#2a2a30" strokeWidth="3" />
      <g style={{ transformOrigin: '50px 112px', transform: `scale(${0.4 + 0.6 * l})`, transition: 'transform 0.6s' }}>
        <path d={OUTER} fill={`url(#${id})`} opacity={0.3 + 0.7 * l} style={l >= 1 ? { filter: 'drop-shadow(0 0 6px rgba(77,141,255,0.6))' } : undefined} />
        <path d={INNER} fill="#e8f0ff" opacity={0.15 + 0.75 * l} />
      </g>
    </svg>
  )
}
