import type { LungState } from '../domain/health'

const RIGHT = 'M100 64 C70 50 34 70 26 112 C20 146 30 178 56 186 C76 192 96 182 100 160 Z'
const LEFT = 'M120 64 C150 50 186 70 194 112 C200 146 190 178 164 186 C146 192 126 184 122 166 C132 158 134 146 124 140 Z'
const BRONCHI = 'M110 60 L110 78 M110 78 C100 86 86 94 74 112 M110 78 C120 86 134 94 146 112 M86 96 C78 104 64 110 52 124 M134 96 C142 104 156 110 168 124 M74 112 C70 126 66 140 60 154 M146 112 C150 126 154 140 160 154'
const SPOTS = [[58, 120, 7], [160, 132, 8], [76, 160, 6], [150, 166, 6], [44, 146, 5], [176, 110, 5], [88, 132, 5], [136, 150, 5], [66, 96, 4], [154, 90, 4], [52, 172, 5], [170, 176, 4]]

const LOOK: Record<LungState, { fill: string; hi: string; stroke: string; glow: string | null; spots: number; breathe: string }> = {
  healthy: { fill: '#ef9f8f', hi: '#ffd6ca', stroke: '#ffd9cf', glow: '#ffb39e', spots: 0, breathe: '3.6s' },
  strained: { fill: '#c58c7c', hi: '#e6b8a8', stroke: '#d8a898', glow: '#c98a7a', spots: 3, breathe: '4.6s' },
  damaged: { fill: '#8c7266', hi: '#a88e80', stroke: '#9c8478', glow: null, spots: 7, breathe: '5.6s' },
  blackened: { fill: '#463c37', hi: '#5c504a', stroke: '#5a4e48', glow: null, spots: 12, breathe: '7s' },
}

function Layer({ state, show }: { state: LungState; show: boolean }) {
  const l = LOOK[state]
  const id = `lung-${state}`
  return (
    <g style={{ opacity: show ? 1 : 0, transition: 'opacity 0.9s' }}>
      <defs>
        <radialGradient id={`${id}-f`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor={l.hi} />
          <stop offset="1" stopColor={l.fill} />
        </radialGradient>
        <filter id={`${id}-g`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      <g className="lungs-breathe" style={{ animationDuration: l.breathe }}>
        {l.glow && <path d={`${RIGHT} ${LEFT}`} fill={l.glow} filter={`url(#${id}-g)`} opacity="0.55" />}
        <path d={RIGHT} fill={`url(#${id}-f)`} stroke={l.stroke} strokeWidth="2" />
        <path d={LEFT} fill={`url(#${id}-f)`} stroke={l.stroke} strokeWidth="2" />
        <path d={BRONCHI} stroke={l.stroke} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        {SPOTS.slice(0, l.spots).map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={state === 'strained' ? '#7d6a60' : '#1c1714'} opacity={state === 'strained' ? 0.55 : 0.85} />
        ))}
        {state === 'blackened' && (
          <g stroke="#1c1714" strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M40 128 L52 138 L46 150" /><path d="M178 140 L166 150 L172 162" /><path d="M96 176 L88 168" />
          </g>
        )}
      </g>
      {(state === 'damaged' || state === 'blackened') && (
        <g fill="#8a8578" opacity={state === 'blackened' ? 0.5 : 0.3}>
          <ellipse className="smoke" cx="110" cy="10" rx="9" ry="5" />
          <ellipse className="smoke s2" cx="118" cy="4" rx="7" ry="4" />
        </g>
      )}
    </g>
  )
}

/** Lungs that breathe easy when you're clean and darken with every missed day. */
export function Lungs({ state, width = 200 }: { state: LungState; width?: number }) {
  return (
    <svg width={width} viewBox="0 0 220 200" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      <rect x="104" y="4" width="12" height="60" rx="6" fill="#6a5e56" />
      <g stroke="#4a403a" strokeWidth="1.5">
        {[14, 24, 34, 44, 54].map((y) => <line key={y} x1="105" x2="115" y1={y} y2={y} />)}
      </g>
      {(['healthy', 'strained', 'damaged', 'blackened'] as const).map((s) => <Layer key={s} state={s} show={s === state} />)}
    </svg>
  )
}
