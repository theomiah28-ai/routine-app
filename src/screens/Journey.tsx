import type { ReactNode } from 'react'
import { sectionProgress, ascentDays, meditationMinutes, statuePoints, statueStage, type SectionProgress } from '../domain/progression'
import { eyeStage } from '../domain/stillness'
import { consistency } from '../domain/progress'
import { addDays, todayKey } from '../dates'
import { useStore } from '../store'
import { useNav, type Route } from '../nav'
import { Ascent } from '../symbols/Ascent'
import { Eye } from '../symbols/Eye'
import { Statue } from '../symbols/Statue'
import { Lungs } from '../symbols/Lungs'
import { lungScore, lungState } from '../domain/health'
import { moonState, sleepScore } from '../domain/sleep'
import { Moon } from '../symbols/Moon'
import { Ring, Screen } from '../ui'

const ROUTE: Record<string, Route> = {
  transmutation: { name: 'transmutation' },
  stillness: { name: 'stillness' },
  gym: { name: 'gym' },
  health: { name: 'health' },
  sleep: { name: 'sleep' },
}

function Row({ p, symbol, onClick }: { p: SectionProgress; symbol: ReactNode; onClick: () => void }) {
  return (
    <button className="jr-row" onClick={onClick}>
      <div className="jr-sym">{symbol}</div>
      <div className="jr-body">
        <span className="label gold">{p.title}</span>
        <div className="row" style={{ alignItems: 'baseline', marginTop: 4 }}>
          <b>{p.value}</b>
          <span className="sub" style={{ fontSize: 12 }}>{p.stage}</span>
        </div>
        <div className="jr-bar"><i style={{ width: `${Math.max(2, Math.min(100, p.pct * 100))}%` }} /></div>
        <small>{p.next ? `Next: ${p.next}` : 'Complete'}</small>
      </div>
    </button>
  )
}

export function Journey() {
  const { state } = useStore()
  const { push, switchTab } = useNav()
  const today = todayKey()
  const progress = sectionProgress(state, today)
  const month = consistency(state, addDays(today, -29), today, 'all')

  const symbols: Record<string, ReactNode> = {
    transmutation: (
      <div style={{ width: 64, height: 92, overflow: 'hidden' }}>
        <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: 320 }}><Ascent days={ascentDays(state, today)} compact /></div>
      </div>
    ),
    stillness: <Eye openness={eyeStage(meditationMinutes(state)).openness} width={70} />,
    gym: <Statue stage={statueStage(statuePoints(state)).index} size={58} />,
    health: <Lungs state={lungState(lungScore(state, today) ?? 1)} width={70} />,
    sleep: <Moon state={moonState(sleepScore(state, today) ?? 1)} width={64} />,
  }

  return (
    <Screen>
      <div className="date" style={{ marginTop: 8 }}>Journey</div>
      <h1>Who you're becoming</h1>
      <p className="sub" style={{ marginTop: 0 }}>Every tick on Today grows these.</p>
      {!state.settings.journeyStart && (
        <button className="journey-cta" onClick={() => switchTab('today')}>
          <span className="label gold">Not started</span>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>Build your routine, then begin your journey</div>
          <div className="sub" style={{ marginTop: 2 }}>Tracking starts the moment you begin. Go to Today ›</div>
        </button>
      )}

      <button className="jr-tile wide" onClick={() => push({ name: 'progress' })}>
        <div>
          <span className="label">Consistency</span>
          <b>{Math.round(month * 100)}%</b>
          <small>last 30 days · tap for the calendar</small>
        </div>
        <Ring pct={month} size={64} stroke={6} />
      </button>

      <div style={{ marginTop: 8 }}>
        {progress.map((p) => (
          <Row key={p.section} p={p} symbol={symbols[p.section]} onClick={() => (p.section === 'gym' ? switchTab('gym') : push(ROUTE[p.section]))} />
        ))}
      </div>

    </Screen>
  )
}
