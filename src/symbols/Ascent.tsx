import { useLayoutEffect, useRef, useState } from 'react'
import { ASCENT } from '../content/ascent'
import { stageIndex } from '../domain/transmutation'

const W = 300
const TOP = 22
const BOTTOM = 430
const X = 50
const AMP = 38
const SEG = (BOTTOM - TOP) / (ASCENT.length - 1)
const nodeY = (i: number) => BOTTOM - i * SEG

/** S-curves between stage nodes, alternating sides like a rising serpent. */
const PATH = ASCENT.slice(1).reduce((d, _, i) => {
  const y0 = nodeY(i)
  const y1 = nodeY(i + 1)
  const dir = i % 2 ? -1 : 1
  return `${d} C${X + AMP * dir} ${y0 - SEG / 3} ${X - AMP * dir} ${y1 + SEG / 3} ${X} ${y1}`
}, `M${X} ${BOTTOM}`)

/** 0..1 along the whole path for a number of elapsed days. */
export function ascentProgress(days: number): number {
  const i = stageIndex(days)
  if (i === ASCENT.length - 1) return 1
  const a = ASCENT[i].day - 1
  const b = ASCENT[i + 1].day - 1
  return (i + Math.min(1, (days - a) / (b - a))) / (ASCENT.length - 1)
}

export function Ascent({ days, onStage, compact }: { days: number; onStage?: (i: number) => void; compact?: boolean }) {
  const path = useRef<SVGPathElement>(null)
  const [here, setHere] = useState({ x: X, y: BOTTOM })
  const f = ascentProgress(days)
  const reached = stageIndex(days)

  useLayoutEffect(() => {
    const p = path.current
    if (!p) return
    const pt = p.getPointAtLength(p.getTotalLength() * f)
    setHere({ x: pt.x, y: pt.y })
  }, [f])

  return (
    <svg viewBox={`0 0 ${W} ${BOTTOM + 20}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="asc-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="asc-here" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="9" /></filter>
        <linearGradient id="asc-line" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c9a043" />
          <stop offset="1" stopColor="#fff0c4" />
        </linearGradient>
      </defs>
      <path ref={path} d={PATH} fill="none" stroke="#221e15" strokeWidth="3" strokeLinecap="round" />
      <path d={PATH} fill="none" stroke="#e8c46a" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={`${f} 1`} filter="url(#asc-glow)" opacity="0.8" className="asc-draw" />
      <path d={PATH} fill="none" stroke="url(#asc-line)" strokeWidth="2.4" strokeLinecap="round" pathLength={1} strokeDasharray={`${f} 1`} className="asc-draw" />

      {ASCENT.map((s, i) => {
        const y = nodeY(i)
        const on = i <= reached
        return (
          <g key={s.day} onClick={() => onStage?.(i)} style={{ cursor: onStage ? 'pointer' : undefined }}>
            <rect x={X - 20} y={y - 18} width={W - X + 10} height={36} fill="transparent" />
            {on ? (
              <>
                <circle cx={X} cy={y} r={6} fill="#ffe7a3" filter="url(#asc-glow)" opacity="0.7" />
                <circle cx={X} cy={y} r={4.5} fill="#ffe7a3" />
              </>
            ) : (
              <circle cx={X} cy={y} r={4.5} fill="#0b0b0c" stroke="#4a4130" strokeWidth={1.5} />
            )}
            {!compact && (
              <text x={X + 30} y={y + 4.5} fontFamily="-apple-system, Inter, sans-serif" fontSize="12.5" fill={on ? '#8a8578' : '#4a473f'} letterSpacing="0.08em" fontWeight="600">
                DAY {s.day}
                <tspan dx="9" fontSize="15" letterSpacing="0" fill={on ? '#f2f2f2' : '#55524a'} fontWeight={on ? 600 : 500}>
                  {s.name}
                </tspan>
                {!on && <tspan dx="7" fontSize="11" fill="#4a473f">🔒︎</tspan>}
              </text>
            )}
          </g>
        )
      })}

      <circle cx={here.x} cy={here.y} r={16} fill="#ffd36b" filter="url(#asc-here)" className="asc-pulse" />
      <circle cx={here.x} cy={here.y} r={5.5} fill="#fff" />
    </svg>
  )
}
