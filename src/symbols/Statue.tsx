import { useState } from 'react'

const TORSO = 'M60 30 C60 18 80 12 90 12 C100 12 120 18 120 30 L122 44 C140 46 156 52 162 66 C168 82 166 104 160 122 C156 134 150 140 146 150 L140 196 L40 196 L34 150 C30 140 24 134 20 122 C14 104 12 82 18 66 C24 52 40 46 58 44 Z'
const DETAIL = [
  'M90 56 L90 140', // centre line
  'M58 70 C70 80 82 82 90 80 C98 82 110 80 122 70', // chest
  'M70 100 L110 100 M72 118 L108 118 M74 136 L106 136', // abs
  'M30 82 C34 100 36 112 40 124 M150 82 C146 100 144 112 140 124', // arms
  'M48 58 C44 70 44 80 48 92 M132 58 C136 70 136 80 132 92', // shoulders
]

/** Placeholder statue: a figure emerging from stone, more carved at each stage. Real images replace it when present. */
function Carving({ stage, size }: { stage: number; size: number }) {
  const t = stage / 7
  const blockTop = 196 - 160 * (1 - t) // stone left around the figure
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 180 210" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a857a" />
          <stop offset="1" stopColor="#4a463e" />
        </linearGradient>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t > 0.8 ? '#fff6dc' : '#d8d2c4'} />
          <stop offset="1" stopColor={t > 0.8 ? '#c9a043' : '#8a857a'} />
        </linearGradient>
        <filter id="statue-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="10" /></filter>
        <clipPath id="above-block"><rect x="0" y="0" width="180" height={blockTop} /></clipPath>
      </defs>
      {t > 0.6 && <path d={TORSO} fill="#e8c46a" opacity={(t - 0.6) * 0.9} filter="url(#statue-glow)" />}
      <path d={TORSO} fill="url(#marble)" clipPath="url(#above-block)" />
      <g stroke="#2b2720" strokeWidth="2" fill="none" strokeLinecap="round" clipPath="url(#above-block)" opacity={0.25 + 0.6 * t}>
        {DETAIL.slice(0, Math.max(0, stage - 2)).map((d) => <path key={d} d={d} />)}
      </g>
      <rect x="10" y={blockTop} width="160" height={200 - blockTop} rx="4" fill="url(#stone)" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${20 + i * 26} ${blockTop + 6} l10 12 l-6 10`} stroke="#3a362c" strokeWidth="1.5" fill="none" opacity={blockTop < 190 ? 0.8 : 0} />
      ))}
      <rect x="0" y="198" width="180" height="8" rx="2" fill="#2b2720" />
    </svg>
  )
}

export function Statue({ stage, size = 150 }: { stage: number; size?: number }) {
  // Remember which stage's image failed, so a later stage still tries its own image
  const [failed, setFailed] = useState<number | null>(null)
  const img = failed !== stage
  const setImg = (_: boolean) => setFailed(stage)
  if (img)
    return (
      <img
        src={`${import.meta.env.BASE_URL}statue/stage-${stage}.png`}
        alt=""
        width={size}
        style={{ display: 'block', margin: '0 auto', borderRadius: 14 }}
        onError={() => setImg(false)}
      />
    )
  return <Carving stage={stage} size={size} />
}
