import { formatWeight, sessionVolume, sessionsThisWeek, strengthGains, weeklySessions } from '../domain/gym'
import { statuePoints, statueStage } from '../domain/progression'
import { dateKey, formatLong, todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Statue } from '../symbols/Statue'
import { Screen } from '../ui'
import type { SetLog } from '../types'

const setText = (s: SetLog) => `${formatWeight(s.weight)}kg × ${s.reps}`
const tonnes = (kg: number) => (kg >= 1000 ? `${Math.round(kg / 100) / 10}t` : `${Math.round(kg)}kg`)

/** Journey's Gym: the transformation, read-only. Training itself happens on the Gym tab. */
export function GymProgress() {
  const { state } = useStore()
  const { push } = useNav()
  const today = todayKey()
  const points = statuePoints(state)
  const statue = statueStage(points)
  const sessions = state.sessions
  const pbs = points - sessions.length
  const weeks = weeklySessions(sessions, today, 8)
  const peak = Math.max(1, ...weeks.map((w) => w.count))
  const gains = strengthGains(state)
  const recent = [...sessions].sort((a, b) => b.end - a.end).slice(0, 6)
  const volume = sessions.reduce((t, s) => t + sessionVolume(s), 0)

  return (
    <Screen bg="gold">
      <div className="topbar"><Back /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Gym · your transformation</div>
      <div className="big-num" style={{ marginTop: 6 }}>
        {sessions.length}
        <small>{sessions.length === 1 ? 'session' : 'sessions'}</small>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 6px' }}>
        <Statue stage={statue.index} size={200} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>The statue · {statue.name}</div>
        <div className="jr-bar" style={{ maxWidth: 240, margin: '10px auto 6px' }}><i style={{ width: `${Math.max(2, statue.pct * 100)}%` }} /></div>
        <div className="sub" style={{ fontSize: 12 }}>{statue.next ? `Next: ${statue.next.name}. Every workout carves, every PB carves deeper.` : 'Masterpiece.'}</div>
      </div>

      <div className="stats" style={{ marginTop: 20 }}>
        <div className="stat"><b className="acc">{sessionsThisWeek(sessions)}</b><span>this week</span></div>
        <div className="stat"><b>{pbs}</b><span>PBs</span></div>
        <div className="stat"><b>{tonnes(volume)}</b><span>lifted</span></div>
      </div>

      <div className="sec">Last 8 weeks</div>
      <div className="week-bars">
        {weeks.map((w, i) => (
          <div key={w.week} className={'week-bar' + (i === weeks.length - 1 ? ' now' : '')}>
            <span>{w.count || ''}</span>
            <i style={{ height: `${(w.count / peak) * 100}%` }} />
          </div>
        ))}
      </div>
      <p className="note" style={{ marginTop: 8 }}>Sessions each week. The last bar is this week.</p>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <b>Your transformation starts with one workout</b>
          <p className="note">Train from the Gym tab. Every finished workout and every PB shows up here.</p>
        </div>
      ) : (
        <>
          <div className="sec">Strength</div>
          {gains.map((g) => {
            const up = g.last.weight > g.first.weight || (g.last.weight === g.first.weight && g.last.reps > g.first.reps)
            const kg = g.last.weight - g.first.weight
            return (
              <button key={g.id} className="item" onClick={() => push({ name: 'exercise', id: g.id })}>
                <span className="name">
                  {g.name}
                  <small className="sub" style={{ display: 'block', fontSize: 12 }}>
                    {g.sessions === 1 ? `First: ${setText(g.first)}` : `${setText(g.first)} → ${setText(g.last)}`}
                  </small>
                </span>
                <span className={'trend ' + (up ? 'up' : g.sessions === 1 ? 'new' : 'flat')}>
                  {g.sessions === 1 ? 'New' : kg > 0 ? `+${formatWeight(kg)}kg` : up ? `+${g.last.reps - g.first.reps} reps` : 'Even'}
                </span>
                <span className="chev">›</span>
              </button>
            )
          })}

          <div className="sec">Recent sessions</div>
          {recent.map((s) => (
            <div key={s.id} className="history-row">
              <span>
                {s.dayName}
                <span className="sub"> · {formatLong(dateKey(new Date(s.end)))}</span>
              </span>
              <span className="sub">{s.entries.reduce((t, e) => t + e.sets.length, 0)} sets · {tonnes(sessionVolume(s))}</span>
            </div>
          ))}
        </>
      )}
    </Screen>
  )
}
