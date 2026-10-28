import { useState } from 'react'
import { BREATHS, INTENTS, VISUALISATIONS, type Intent } from '../content/stillness'
import { eyeStage, sitDoneOn, sitStreak } from '../domain/stillness'
import { meditationMinutes } from '../domain/progression'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Eye } from '../symbols/Eye'
import { Check, Screen } from '../ui'

export function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const r = Math.round(m % 60)
  return h ? `${h}h ${r}m` : `${r}m`
}

export function Stillness() {
  const { state } = useStore()
  const { push } = useNav()
  const [intent, setIntent] = useState<Intent>('focus')
  const s = state.stillness
  const mins = meditationMinutes(state)
  const eye = eyeStage(mins)
  const today = todayKey()
  const done = sitDoneOn(s, today)
  const streak = sitStreak(s, today)

  const breaths = BREATHS.filter((b) => b.intents.includes(intent))
  const visuals = VISUALISATIONS.filter((v) => v.intents.includes(intent))

  return (
    <Screen bg="gold">
      <div className="topbar"><Back label="Today" /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Stillness · mental mastery</div>

      <div style={{ margin: '22px 0 6px' }}>
        <Eye openness={eye.openness} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Stage {eye.index + 1} · {eye.name}</div>
        <div className="sub" style={{ marginTop: 3 }}>
          {formatMinutes(mins)} in silence · {streak}-day sit streak
        </div>
        {eye.nextAt !== null && <div className="sub" style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>The eye opens further at {formatMinutes(eye.nextAt)}</div>}
      </div>

      <div className="sit-card">
        <div className="row">
          <span className="label gold">The Morning Sit</span>
          {done ? <Check on /> : <span className="sub" style={{ fontSize: 11 }}>Today · not done</span>}
        </div>
        <div style={{ fontSize: 21, fontWeight: 700, marginTop: 6 }}>{s.sitMinutes} min of pure awareness</div>
        <p className="note" style={{ marginTop: 4 }}>No intention, no guidance. Watch each thought arrive and let it pass.</p>
        {done ? (
          <div className="sub" style={{ color: 'var(--gold)', marginTop: 10, fontWeight: 600 }}>Done today</div>
        ) : (
          <button className="btn small" style={{ marginTop: 12 }} onClick={() => push({ name: 'sit' })}>Begin the sit</button>
        )}
      </div>

      <div className="sec">Breathwork & visualisation</div>
      <div className="pills" style={{ marginTop: 6 }}>
        {INTENTS.map((i) => (
          <button key={i.id} className={'pill-btn' + (intent === i.id ? ' on' : '')} onClick={() => setIntent(i.id)}>{i.label}</button>
        ))}
      </div>
      <div className="tiles">
        {breaths.map((b) => (
          <button key={b.id} className="tile" onClick={() => push({ name: 'breath', id: b.id })}>
            <span className="label">Breathwork</span>
            <b style={{ fontSize: 16 }}>{b.name}</b>
            <small>{b.blurb}</small>
          </button>
        ))}
        {visuals.map((v) => (
          <button key={v.id} className="tile" onClick={() => push({ name: 'visualise', id: v.id })}>
            <span className="label">Visualise · {v.minutes} min</span>
            <b style={{ fontSize: 16 }}>{v.name}</b>
            <small>{v.blurb}</small>
          </button>
        ))}
      </div>
    </Screen>
  )
}
