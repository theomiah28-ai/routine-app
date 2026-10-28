import { useState } from 'react'
import { brainState, SAMPLE_APPS, todayMinutes } from '../domain/screentime'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back } from '../nav'
import { Brain } from '../symbols/Brain'
import { Screen, Sheet, Stepper } from '../ui'
import { hm } from './Work'

const COPY = {
  sharp: { chip: 'Sharp', line: 'Clear head. Keep it that way.' },
  foggy: { chip: 'Foggy', line: 'Focus is slipping. Put the phone down.' },
  rotting: { chip: 'Rotting', line: "This is costing you. Every extra minute is borrowed from your goals." },
}

export function ScreenTime() {
  const { state, update } = useStore()
  const [entry, setEntry] = useState(false)
  const [settings, setSettings] = useState(false)
  const today = todayKey()
  const st = state.screenTime
  const mins = todayMinutes(st, today)
  const b = brainState(mins, st)
  const manual = st.manual[today] !== undefined
  const over = mins - st.limit
  const toRot = st.rotting - mins

  return (
    <Screen bg="gold">
      <div className="topbar">
        <Back label="Today" />
        <button className="link" onClick={() => setSettings(true)}>Limits</button>
      </div>
      <div className="preview-banner">Preview · connects to real Screen Time in the iPhone app</div>

      <div className="label gold" style={{ marginTop: 16 }}>Screen time · dopamine</div>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <div className="big-num" style={{ fontSize: 46 }}>{hm(mins)}</div>
        <div style={{ fontSize: 12, textAlign: 'right', color: over > 0 ? 'var(--ember)' : 'var(--muted)' }}>
          {over > 0 ? <>{hm(over)} over<br />your {hm(st.limit)} limit</> : <>{hm(-over)} left<br />of {hm(st.limit)}</>}
        </div>
      </div>

      <div style={{ margin: '30px 0 10px' }}><Brain state={b} /></div>
      <div style={{ textAlign: 'center' }}>
        <span className={'brain-chip ' + b}>Brain state · {COPY[b].chip}</span>
        <p className="note" style={{ marginTop: 8 }}>
          {COPY[b].line}
          {b === 'foggy' && toRot > 0 && <> {hm(toRot)} more and it starts to rot.</>}
        </p>
      </div>

      <div className="sec">Today by app <span className="placeholder-tag">sample</span></div>
      {SAMPLE_APPS.map((a) => (
        <div key={a.name} className="app-row">
          <span>{a.name}</span>
          <span className="app-bar"><i style={{ width: `${Math.min(100, (a.minutes / 90) * 100)}%`, background: a.minutes >= 60 ? 'var(--ember)' : 'var(--gold)' }} /></span>
          <span className="sub" style={{ width: 54, textAlign: 'right', color: 'var(--text)' }}>{hm(a.minutes)}</span>
        </div>
      ))}

      <button className="btn ghost" style={{ marginTop: 20 }} onClick={() => setEntry(true)}>
        {manual ? `Today: ${hm(mins)} · Edit` : "Enter today's total from Screen Time"}
      </button>

      <Sheet open={entry} onClose={() => setEntry(false)}>
        <h2 className="title">Today's screen time</h2>
        <p className="note" style={{ margin: '6px 0 16px' }}>Settings → Screen Time on your iPhone shows today's total.</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Stepper value={st.manual[today] ?? mins} step={15} onChange={(v) => update((s) => void (s.screenTime.manual[today] = v))} />
        </div>
        <div className="sub" style={{ textAlign: 'center', marginTop: 8 }}>minutes</div>
        <button className="btn" style={{ marginTop: 16 }} onClick={() => setEntry(false)}>Done</button>
      </Sheet>

      <Sheet open={settings} onClose={() => setSettings(false)}>
        <h2 className="title">Limits</h2>
        {([['limit', 'Daily limit'], ['foggy', 'Brain goes foggy at'], ['rotting', 'Brain starts rotting at']] as const).map(([k, label]) => (
          <div key={k} className="input-row">
            <span style={{ fontSize: 15 }}>{label}<div className="sub" style={{ fontSize: 12 }}>{hm(st[k])}</div></span>
            <Stepper value={st[k]} step={15} onChange={(v) => update((s) => void (s.screenTime[k] = v))} />
          </div>
        ))}
        <button className="btn" style={{ marginTop: 16 }} onClick={() => setSettings(false)}>Done</button>
      </Sheet>
    </Screen>
  )
}
