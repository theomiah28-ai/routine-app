import type { ReactNode } from 'react'
import { sectionProgress, ascentDays, meditationMinutes, faithDays, statuePoints, statueStage, type SectionProgress } from '../domain/progression'
import { eyeStage } from '../domain/stillness'
import { workLog } from '../domain/work'
import { avgMinutes, brainState, todayMinutes } from '../domain/screentime'
import { consistency } from '../domain/progress'
import { addDays, todayKey } from '../dates'
import { useStore } from '../store'
import { useNav, type Route } from '../nav'
import { Ascent } from '../symbols/Ascent'
import { Eye } from '../symbols/Eye'
import { Cross } from '../symbols/Cross'
import { Brain } from '../symbols/Brain'
import { Statue } from '../symbols/Statue'
import { Ring, Screen } from '../ui'
import { crossBrightness } from './Faith'

const ROUTE: Record<string, Route> = {
  transmutation: { name: 'transmutation' },
  stillness: { name: 'stillness' },
  faith: { name: 'faith' },
  gym: { name: 'gym' },
  work: { name: 'work' },
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
  const { push } = useNav()
  const today = todayKey()
  const progress = sectionProgress(state, today)
  const month = consistency(state, addDays(today, -29), today, 'all')
  const st = state.screenTime
  const brains = [
    { label: 'Today', mins: todayMinutes(st, today) },
    { label: '7 days', mins: avgMinutes(st, today, 7) },
    { label: '30 days', mins: avgMinutes(st, today, 30) },
  ]
  const deep = workLog(state.work, today).deepMinutes

  const symbols: Record<string, ReactNode> = {
    transmutation: (
      <div style={{ width: 64, height: 92, overflow: 'hidden' }}>
        <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: 320 }}><Ascent days={ascentDays(state, today)} compact /></div>
      </div>
    ),
    stillness: <Eye openness={eyeStage(meditationMinutes(state)).openness} width={70} />,
    faith: <Cross brightness={crossBrightness(faithDays(state, today))} height={60} />,
    gym: <Statue stage={statueStage(statuePoints(state)).index} size={58} />,
    work: (
      <Ring pct={state.work.targets.deepMinutes ? deep / state.work.targets.deepMinutes : 0} size={56} stroke={6}>
        <span style={{ fontSize: 11, fontWeight: 700 }}>{Math.round(deep / 6) / 10}h</span>
      </Ring>
    ),
  }

  return (
    <Screen>
      <div className="date" style={{ marginTop: 8 }}>Journey</div>
      <h1>Who you're becoming</h1>
      <p className="sub" style={{ marginTop: 0 }}>Every tick on Today grows these.</p>

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
          <Row key={p.section} p={p} symbol={symbols[p.section]} onClick={() => push(ROUTE[p.section])} />
        ))}
      </div>

      <button className="jr-row" style={{ display: 'block' }} onClick={() => push({ name: 'screentime' })}>
        <span className="label gold">Screen time · your brain</span>
        <div className="brains">
          {brains.map((b) => (
            <div key={b.label} style={{ opacity: b.mins === null ? 0.35 : 1 }}>
              <Brain state={brainState(b.mins ?? 0, st)} width={82} />
              <b>{b.label}</b>
              <small>{b.mins === null ? 'No entries yet' : `${Math.floor(b.mins / 60)}h ${b.mins % 60}m${b.label === 'Today' ? '' : ' / day'}`}</small>
            </div>
          ))}
        </div>
      </button>
    </Screen>
  )
}
