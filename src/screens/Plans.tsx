import { useState } from 'react'
import { PLANS, THEMES, type Theme } from '../content/faith'
import { useStore } from '../store'
import { Back } from '../nav'
import { Screen } from '../ui'

const ART: Record<Theme, string> = {
  purpose: 'radial-gradient(60% 60% at 60% 30%, #c98a3a, #2e1d0b)',
  prosperity: 'radial-gradient(60% 60% at 40% 40%, #e8c46a, #5a4418)',
  discipline: 'radial-gradient(60% 60% at 50% 60%, #b8953f, #1f1a10)',
  renew: 'radial-gradient(60% 60% at 50% 40%, #fff0c4, #6b5424)',
  closer: 'radial-gradient(60% 60% at 50% 20%, #fff6dc, #3a2f17)',
  courage: 'radial-gradient(60% 60% at 30% 50%, #e8c46a, #241b0b)',
}

export function Plans() {
  const { state, update } = useStore()
  const [theme, setTheme] = useState<Theme | 'all'>('all')
  const shown = PLANS.filter((p) => theme === 'all' || p.theme === theme)
  const themes = [...new Set(PLANS.map((p) => p.theme))]

  return (
    <Screen>
      <div className="topbar"><Back label="Faith" /></div>
      <h1 style={{ marginTop: 14 }}>Reading plans</h1>
      <div className="sub">Scripture for people building something</div>
      <div className="pills" style={{ marginTop: 14 }}>
        <button className={'pill-btn' + (theme === 'all' ? ' on' : '')} onClick={() => setTheme('all')}>All</button>
        {themes.map((t) => (
          <button key={t} className={'pill-btn' + (theme === t ? ' on' : '')} onClick={() => setTheme(t)}>{THEMES[t]}</button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        {shown.map((p) => {
          const done = state.faith.planProgress[p.id] ?? 0
          const active = state.faith.planId === p.id
          return (
            <button key={p.id} className={'plan' + (active ? ' on' : '')} onClick={() => update((s) => void (s.faith.planId = p.id))}>
              <div className="art" style={{ background: ART[p.theme] }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{p.name}</b>
                <small>{p.subtitle} · {p.days.length} days{done ? ` · Day ${Math.min(done + 1, p.days.length)}` : ''}</small>
                {done > 0 && <div className="bar"><i style={{ width: `${(done / p.days.length) * 100}%` }} /></div>}
              </div>
              {active && <span className="pill">ACTIVE</span>}
            </button>
          )
        })}
      </div>
    </Screen>
  )
}
