/** A cross of light that burns brighter with the faith streak. */
export function Cross({ brightness, height = 150 }: { brightness: number; height?: number }) {
  const b = Math.max(0, Math.min(1, brightness))
  return (
    <svg width="100%" height={height} viewBox="0 0 270 150" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id="cross-halo" cx="50%" cy="52%" r="50%">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.25" stopColor="#ffe2a0" stopOpacity="0.8" />
          <stop offset="1" stopColor="#e8c46a" stopOpacity="0" />
        </radialGradient>
        <filter id="cross-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={3 + 5 * b} /></filter>
      </defs>
      <circle cx="135" cy="72" r={50 + 30 * b} fill="url(#cross-halo)" style={{ opacity: 0.2 + 0.5 * b, transition: 'all 1s' }} className="cross-breathe" />
      <path d="M135 22 L135 126 M108 50 L162 50" stroke="#fff3d0" strokeWidth={6 + 4 * b} strokeLinecap="round" filter="url(#cross-glow)" style={{ opacity: 0.35 + 0.65 * b }} />
      <path d="M135 22 L135 126 M108 50 L162 50" stroke="#fffaf0" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0.55 + 0.45 * b }} />
    </svg>
  )
}
