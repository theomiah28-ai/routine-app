/** The Opening Eye: lids part and light radiates as total silent minutes grow. */
export function Eye({ openness, width = 240 }: { openness: number; width?: number }) {
  const o = Math.max(0, Math.min(1, openness))
  const top = 100 - 76 * o
  const bot = 100 + 70 * o
  const lid = `M25 100 Q135 ${top} 245 100 Q135 ${bot} 25 100 Z`
  const rays = Array.from({ length: 28 }, (_, k) => {
    const a = (Math.PI * 2 * k) / 28
    const long = k % 2 === 0
    const r1 = 66
    const r2 = r1 + (long ? 34 : 18) * (0.35 + 0.65 * o)
    return { x1: 135 + r1 * Math.cos(a), y1: 100 + r1 * Math.sin(a) * 0.78, x2: 135 + r2 * Math.cos(a), y2: 100 + r2 * Math.sin(a) * 0.78 }
  })
  return (
    <svg width={width} viewBox="0 0 270 200" style={{ display: 'block', overflow: 'visible', margin: '0 auto' }} className="eye">
      <defs>
        <filter id="eye-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
        <radialGradient id="eye-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff8e6" />
          <stop offset="0.35" stopColor="#ffd36b" />
          <stop offset="0.8" stopColor="#a87a28" />
          <stop offset="1" stopColor="#5a4418" />
        </radialGradient>
        <clipPath id="eye-clip"><path d={lid} /></clipPath>
      </defs>
      <g style={{ opacity: 0.12 + 0.6 * o, transition: 'opacity 1s' }} className="eye-rays">
        {rays.map((r, i) => (
          <line key={i} {...r} stroke="#e8c46a" strokeWidth="2" strokeLinecap="round" />
        ))}
      </g>
      <circle cx="135" cy="100" r="54" fill="#e8c46a" filter="url(#eye-glow)" style={{ opacity: 0.12 + 0.45 * o }} />
      <path d="M25 100 Q135 24 245 100 Q135 170 25 100 Z" fill="#100e09" stroke="#3a3324" strokeWidth="1.4" />
      <g clipPath="url(#eye-clip)">
        <rect x="20" y="20" width="230" height="160" fill="#1a160d" />
        <circle cx="135" cy="100" r="38" fill="url(#eye-iris)" />
        <circle cx="135" cy="100" r="12" fill="#120d04" />
        <circle cx="146" cy="89" r="5" fill="#fff" />
      </g>
      <path d={`M25 100 Q135 ${top} 245 100`} fill="none" stroke="#e8c46a" strokeWidth="2.6" strokeLinecap="round" style={{ transition: 'd 1.2s' }} />
      <path d={`M25 100 Q135 ${bot} 245 100`} fill="none" stroke="#8a7240" strokeWidth="1.6" />
    </svg>
  )
}
