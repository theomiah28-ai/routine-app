import type { BrainState } from '../domain/screentime'

const CEREBRUM = 'M40 95 C20 90 14 60 30 45 C34 25 58 12 80 18 C92 6 118 4 132 14 C150 8 172 18 176 36 C192 44 196 68 186 82 C190 98 176 112 160 110 C150 122 128 124 116 116 C104 124 84 122 76 112 C62 118 44 110 40 95 Z'
const CEREBELLUM = 'M138 110 C138 130 166 138 182 126 C194 116 190 98 178 96 C168 108 152 112 138 110 Z'
const STEM = 'M124 116 C127 132 124 144 118 156 L134 156 C138 142 140 128 140 114 Z'
const FOLDS = ['M44 58 C54 50 62 62 72 54', 'M66 30 C74 42 86 36 90 46', 'M108 16 C112 26 104 32 110 40', 'M140 24 C134 38 150 42 144 56', 'M164 46 C172 56 162 64 174 72', 'M52 96 C64 90 72 100 82 96', 'M150 92 C160 88 166 96 176 90', 'M36 74 C44 70 48 80 56 76']
const CB_LINES = ['M146 118 C156 124 172 122 184 114', 'M150 126 C160 130 172 128 182 122']

const PALETTE: Record<BrainState, { fill: string; stroke: string; fold: string; glow: string | null }> = {
  sharp: { fill: '#f2c75c', stroke: '#fff0c4', fold: '#c99a35', glow: '#ffd36b' },
  foggy: { fill: '#a8925a', stroke: '#c2ae78', fold: '#7d6b3e', glow: '#a08a50' },
  rotting: { fill: '#76734a', stroke: '#8a8758', fold: '#55532f', glow: null },
}

function Face({ state }: { state: BrainState }) {
  if (state === 'sharp')
    return (
      <g>
        <g className="brain-blink">
          <ellipse cx="94" cy="66" rx="7" ry="9" fill="#2a1d08" />
          <ellipse cx="128" cy="66" rx="7" ry="9" fill="#2a1d08" />
        </g>
        <circle cx="96.5" cy="62.5" r="2.6" fill="#fff" />
        <circle cx="130.5" cy="62.5" r="2.6" fill="#fff" />
        <path d="M98 84 Q111 98 124 84" stroke="#2a1d08" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="80" cy="82" rx="7" ry="4" fill="#ff9a6a" opacity=".55" />
        <ellipse cx="142" cy="82" rx="7" ry="4" fill="#ff9a6a" opacity=".55" />
        <g fill="#fff6d8">
          <path className="twinkle" d="M190 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path className="twinkle t2" d="M22 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path className="twinkle t3" d="M196 120 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        </g>
      </g>
    )
  if (state === 'foggy')
    return (
      <g>
        <path d="M86 68 Q94 64 102 68" stroke="#2e2412" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M120 68 Q128 64 136 68" stroke="#2e2412" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M88 64 L101 64" stroke="#7d6b3e" strokeWidth="3" strokeLinecap="round" />
        <path d="M121 64 L134 64" stroke="#7d6b3e" strokeWidth="3" strokeLinecap="round" />
        <path d="M98 88 Q104 84 110 88 Q116 92 122 88" stroke="#2e2412" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <circle cx="152" cy="64" r="6" fill="#7d6b3e" opacity=".55" />
        <circle cx="60" cy="100" r="4" fill="#7d6b3e" opacity=".55" />
        <g fill="#d8d2c4" opacity=".45">
          <g className="fog"><ellipse cx="40" cy="40" rx="26" ry="9" /><ellipse cx="62" cy="34" rx="18" ry="8" /></g>
          <g className="fog f2"><ellipse cx="172" cy="104" rx="26" ry="9" /><ellipse cx="190" cy="98" rx="14" ry="7" /></g>
        </g>
        <text className="zz" x="150" y="38" fill="#c2ae78" fontSize="16" fontFamily="-apple-system,sans-serif" fontWeight="700">z</text>
        <text className="zz z2" x="162" y="26" fill="#c2ae78" fontSize="11" fontFamily="-apple-system,sans-serif" fontWeight="700">z</text>
      </g>
    )
  return (
    <g>
      <g stroke="#22210f" strokeWidth="3.4" strokeLinecap="round">
        <path d="M87 60 L101 72" /><path d="M101 60 L87 72" /><path d="M121 60 L135 72" /><path d="M135 60 L121 72" />
      </g>
      <path d="M98 94 Q111 82 124 94" stroke="#22210f" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <g className="drool">
        <path d="M120 92 Q122 104 119 110 Q117 114 121 116" stroke="#8fa04a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="121" cy="118" r="3.6" fill="#8fa04a" />
      </g>
      <g stroke="#22210f" strokeWidth="2.6" fill="none" strokeLinecap="round">
        <path d="M58 22 L66 38 L60 48 L70 62" /><path d="M166 40 L156 52 L164 60" /><path d="M48 92 L56 100 L52 108" />
      </g>
      <g fill="#4f5a26"><circle cx="150" cy="70" r="9" /><circle cx="72" cy="38" r="6" /><circle cx="160" cy="96" r="5" /><circle cx="40" cy="70" r="5" /></g>
      <g fill="#3a4219"><circle cx="153" cy="67" r="3" /><circle cx="70" cy="40" r="2" /></g>
      {[0, 1, 2].map((i) => (
        <g key={i} className={`fly fly${i}`}>
          <circle r="2.4" fill="#22210f" />
          <path d="M-3 -1 q-3 -5 2 -5 M3 -1 q3 -5 -2 -5" stroke="#8a8758" strokeWidth="0.9" fill="none" />
        </g>
      ))}
    </g>
  )
}

function Layer({ state, show }: { state: BrainState; show: boolean }) {
  const p = PALETTE[state]
  const id = `brain-${state}`
  return (
    <g style={{ opacity: show ? 1 : 0, transition: 'opacity 0.9s' }}>
      <defs>
        <filter id={`${id}-g`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
        <radialGradient id={`${id}-h`} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {p.glow && <path d={CEREBRUM} fill={p.glow} filter={`url(#${id}-g)`} opacity={state === 'sharp' ? 0.7 : 0.35} className={state === 'sharp' ? 'brain-glow' : undefined} />}
      <path d={STEM} fill={p.fold} stroke={p.stroke} strokeWidth="2" />
      <path d={CEREBELLUM} fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      {CB_LINES.map((l) => <path key={l} d={l} stroke={p.fold} strokeWidth="2.2" fill="none" strokeLinecap="round" />)}
      <path d={CEREBRUM} fill={p.fill} stroke={p.stroke} strokeWidth="2.5" />
      <path d={CEREBRUM} fill={`url(#${id}-h)`} />
      {FOLDS.map((l) => <path key={l} d={l} stroke={p.fold} strokeWidth="2.6" fill="none" strokeLinecap="round" />)}
      <Face state={state} />
    </g>
  )
}

/** The brain character. All three states are drawn and cross-fade, so changes feel like decay, not a swap. */
export function Brain({ state, width = 210 }: { state: BrainState; width?: number }) {
  return (
    <svg width={width} viewBox="0 0 210 170" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }} className="brain">
      {(['sharp', 'foggy', 'rotting'] as const).map((s) => <Layer key={s} state={s} show={s === state} />)}
    </svg>
  )
}
