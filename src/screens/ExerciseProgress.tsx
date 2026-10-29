import { useState } from 'react'
import { exerciseHistory, formatWeight, summarise, topWeight } from '../domain/gym'
import { useStore } from '../store'
import { Back } from '../nav'

const RANGES = { '1M': 31, '3M': 92, '1Y': 366, All: Infinity } as const
type Range = keyof typeof RANGES

function Chart({ points }: { points: { t: number; w: number }[] }) {
  const W = 320, H = 170, PAD = 14
  if (!points.length) return <div className="empty">No sessions in this range yet.</div>
  const ws = points.map((p) => p.w)
  const min = Math.min(...ws), max = Math.max(...ws)
  const t0 = points[0].t, t1 = points[points.length - 1].t
  const x = (t: number) => (t1 === t0 ? W / 2 : PAD + ((t - t0) / (t1 - t0)) * (W - PAD * 2))
  const y = (w: number) => (max === min ? H / 2 : H - PAD - ((w - min) / (max - min)) * (H - PAD * 2 - 22))
  const line = points.map((p) => `${x(p.t)},${y(p.w)}`).join(' ')
  const last = points[points.length - 1]
  const area = `${x(t0)},${H} ${line} ${x(t1)},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', marginTop: 8 }}>
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8c46a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#e8c46a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={H - 1} x2={W} y2={H - 1} stroke="#1f1f22" />
      {points.length > 1 && <polygon points={area} fill="url(#fill)" />}
      <polyline fill="none" stroke="#e8c46a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={line} />
      <circle cx={x(last.t)} cy={y(last.w)} r="4.5" fill="#e8c46a" />
      <text x={Math.min(x(last.t), W - 60)} y={y(last.w) - 12} fill="#f2f2f2" fontSize="13" fontWeight="700" textAnchor={points.length > 1 ? 'middle' : 'start'}>
        {formatWeight(last.w)}kg
      </text>
      {max !== min && <text x="2" y={y(min) - 6} fill="#55555a" fontSize="11">{formatWeight(min)}kg</text>}
    </svg>
  )
}

export function ExerciseProgress({ id }: { id: string }) {
  const { state } = useStore()
  const [range, setRange] = useState<Range>('3M')
  const ex = state.exercises[id]
  const history = exerciseHistory(state, id)
  const cutoff = Date.now() - RANGES[range] * 86400000
  const inRange = history.filter((h) => h.session.end >= cutoff)
  const points = inRange.map((h) => ({ t: h.session.end, w: topWeight(h.sets) }))
  const gain = points.length > 1 ? points[points.length - 1].w - points[0].w : 0
  const best = history.length ? Math.max(...history.map((h) => topWeight(h.sets))) : 0

  return (
    <div className="screen">
      <div className="topbar"><Back /></div>
      <div className="date" style={{ marginTop: 18 }}>Exercise</div>
      <h1>{ex?.name}</h1>

      <div className="seg" style={{ margin: '12px 0 4px' }}>
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <button key={r} className={r === range ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>
      <Chart points={points} />

      <div className="stats" style={{ marginTop: 16 }}>
        <div className="stat">
          <b className={gain > 0 ? 'acc' : ''}>{gain > 0 ? '+' : ''}{formatWeight(gain)}</b>
          <span>kg {range === 'All' ? 'all time' : `in ${range}`}</span>
        </div>
        <div className="stat"><b>{formatWeight(best)}</b><span>best (kg)</span></div>
        <div className="stat"><b>{history.length}</b><span>sessions</span></div>
      </div>

      <div className="sec">History</div>
      {history.length ? (
        [...history].reverse().map((h) => (
          <div className="history-row" key={h.session.id}>
            <span>{new Date(h.session.end).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span>{summarise(h.sets)}</span>
          </div>
        ))
      ) : (
        <div className="empty">Log this exercise in a workout to start tracking.</div>
      )}
    </div>
  )
}
