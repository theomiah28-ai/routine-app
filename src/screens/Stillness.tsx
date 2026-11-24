import { eyeStage, sitDoneOn, sitStreak } from '../domain/stillness'
import { meditationMinutes } from '../domain/progression'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Eye } from '../symbols/Eye'
import { Check, Screen } from '../ui'
import { DayStats } from './DayStats'

export function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const r = Math.round(m % 60)
  return h ? `${h}h ${r}m` : `${r}m`
}

export function Stillness() {
  const { state } = useStore()
  const { push } = useNav()
  const s = state.stillness
  const mins = meditationMinutes(state)
  const eye = eyeStage(mins)
  const today = todayKey()
  const done = sitDoneOn(s, today)
  const streak = sitStreak(s, today)
  const habit = state.habits.find((h) => h.link === 'stillness')

  return (
    <Screen bg="gold">
      <div className="topbar"><Back /></div>
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

      {habit && (
        <>
          <div className="sec">Meditation days · {habit.name}</div>
          <DayStats habit={habit} />
        </>
      )}

      <div className="sit-card">
        <div className="row">
          <span className="label gold">The Morning Sit</span>
          {done ? <Check on /> : <span className="sub" style={{ fontSize: 11 }}>Today · not done</span>}
        </div>
        <div style={{ fontSize: 21, fontWeight: 700, marginTop: 6 }}>{s.sitMinutes} min of pure awareness</div>
        <p className="note" style={{ marginTop: 4 }}>No intention, no guidance. Watch each thought arrive and let it pass.</p>
        {done ? (
          <div className="sub" style={{ color: 'var(--accent)', marginTop: 10, fontWeight: 600 }}>Done today</div>
        ) : (
          <button className="btn small" style={{ marginTop: 12 }} onClick={() => push({ name: 'sit' })}>Begin the sit</button>
        )}
      </div>

    </Screen>
  )
}
