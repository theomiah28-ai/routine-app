import { useState } from 'react'
import { consistency, monthDays, observations, perfectDays, type Filter } from '../domain/progress'
import { dateKey, todayKey } from '../dates'
import { useStore } from '../store'
import { Back } from '../nav'
import { Screen } from '../ui'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'routine', label: 'Routine' },
  { id: 'gym', label: 'Gym' },
  { id: 'stillness', label: 'Stillness' },
  { id: 'transmutation', label: 'SR' },
]

/** Faint → gold by completion. */
function shade(p: number | null) {
  if (p === null) return { background: 'transparent', color: '#3a362c', boxShadow: 'inset 0 0 0 1px #1d1a14' }
  if (p === 0) return { background: '#1d1a14', color: '#55524a' }
  const a = 0.18 + 0.82 * p
  return { background: `rgba(232, 196, 106, ${a})`, color: p > 0.55 ? '#1a1405' : '#d8d2c4' }
}

export function Progress() {
  const { state } = useStore()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [filter, setFilter] = useState<Filter>('all')
  const today = todayKey()
  const days = monthDays(state, ym.y, ym.m, filter)
  const first = dateKey(new Date(ym.y, ym.m, 1))
  const last = days[days.length - 1].key
  const lead = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7
  const end = last < today ? last : today
  const shift = (d: number) => setYm(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }))
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth()

  return (
    <Screen>
      <div className="topbar"><Back label="Journey" /></div>
      <div className="row" style={{ marginTop: 14 }}>
        <h1 style={{ margin: 0 }}>{new Date(ym.y, ym.m, 1).toLocaleDateString('en-GB', { month: 'long', year: isCurrent ? undefined : 'numeric' })}</h1>
        <div className="row" style={{ gap: 4 }}>
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
          <button className="icon-btn" onClick={() => shift(1)} disabled={isCurrent} style={{ opacity: isCurrent ? 0.3 : 1 }} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="pills" style={{ marginTop: 14 }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={'pill-btn' + (filter === f.id ? ' on' : '')} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="cal-head">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="cal">
        {Array.from({ length: lead }, (_, i) => <i key={'x' + i} />)}
        {days.map((d) => (
          <i key={d.key} style={shade(d.pct)} className={d.key === today ? 'today' : ''}>{Number(d.key.slice(8))}</i>
        ))}
      </div>

      <div className="stats" style={{ marginTop: 18 }}>
        <div className="stat"><b className="acc">{Math.round(consistency(state, first, end, filter) * 100)}%</b><span>consistency</span></div>
        <div className="stat"><b>{perfectDays(state, first, end, filter)}</b><span>perfect days</span></div>
      </div>

      {isCurrent &&
        observations(state, today).map((o) => (
          <div key={o} className="card" style={{ marginTop: 8, fontSize: 14, color: 'var(--soft)' }}>{o}</div>
        ))}
    </Screen>
  )
}
