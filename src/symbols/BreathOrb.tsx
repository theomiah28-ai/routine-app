import type { ReactNode } from 'react'

/** A glowing orb that grows and shrinks with the breath. `trace` (0..1) draws a light around a square for box breathing. */
export function BreathOrb({ scale, trace, children, size = 300 }: { scale: number; trace?: number; children?: ReactNode; size?: number }) {
  const c = size / 2
  const r = size * 0.3 * scale
  const sq = size * 0.74
  const o = (size - sq) / 2
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <radialGradient id="orb-fill" cx="50%" cy="42%" r="58%">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset="0.55" stopColor="#e8c46a" />
            <stop offset="1" stopColor="#8a6a22" />
          </radialGradient>
          <filter id="orb-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={size * 0.07} /></filter>
        </defs>
        {trace !== undefined && (
          <>
            <rect x={o} y={o} width={sq} height={sq} rx={size * 0.1} fill="none" stroke="#2a2519" strokeWidth="2" />
            <rect x={o} y={o} width={sq} height={sq} rx={size * 0.1} fill="none" stroke="#e8c46a" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray={`${trace} 1`} />
          </>
        )}
        <circle cx={c} cy={c} r={r * 1.18} fill="#e8c46a" opacity="0.4" filter="url(#orb-glow)" />
        <circle cx={c} cy={c} r={r} fill="url(#orb-fill)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1a1405', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  )
}
