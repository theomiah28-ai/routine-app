import { useEffect, useState } from 'react'
import { ASCENT } from '../content/ascent'
import { stageIndex } from '../domain/transmutation'
import { ascentDays, linked, relapseToday } from '../domain/progression'
import { isChecked } from '../domain/streaks'
import { dateKey, todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Ascent } from '../symbols/Ascent'
import { Check, GoldButton, Screen, Sheet } from '../ui'

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    const vis = () => document.visibilityState === 'visible' && setNow(Date.now())
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [intervalMs])
  return now
}

export function Transmutation() {
  const { state, update } = useStore()
  const { push, pop } = useNav()
  const now = useNow()
  const [confirm, setConfirm] = useState(false)
  const today = todayKey()
  const habit = linked(state, 'transmutation')
  const days = ascentDays(state, today)
  const stage = stageIndex(days)
  const next = ASCENT.find((s) => s.day > days)
  const toGo = next ? next.day - days : 0
  const yearAgo = now - 365 * 86400e3
  const tickedToday = !!habit && isChecked(state.checks, habit.id, today)
  const relapsedToday = state.transmutation.relapses.some((r) => dateKey(new Date(r)) === today)

  const linkHabit = (id: string | null) =>
    update((s) => {
      if (id) {
        const h = s.habits.find((x) => x.id === id)
        if (h) h.link = 'transmutation'
        return
      }
      s.habits.push({ id: uid(), name: 'No PMO', kind: 'quit', days: [], createdAt: today, timeOfDay: 'anytime', link: 'transmutation' })
    })

  const tickToday = () =>
    update((s) => {
      if (!habit) return
      const list = s.checks[today] ?? []
      s.checks[today] = list.includes(habit.id) ? list.filter((x) => x !== habit.id) : [...list, habit.id]
    })

  return (
    <Screen bg="gold" full>
      <div className="topbar"><Back /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Transmutation</div>
      <div className="big-num" style={{ marginTop: 6 }}>
        {days}
        <small>{days === 1 ? 'clean day' : 'clean days'}</small>
      </div>
      {next ? (
        <div className="sub" style={{ marginTop: 8 }}>
          Next: <b style={{ color: 'var(--gold)' }}>Day {next.day} · {next.name}</b>, {toGo} {toGo === 1 ? 'day' : 'days'} to go
        </div>
      ) : (
        <div className="sub" style={{ marginTop: 8, color: 'var(--gold)' }}>Mastery reached</div>
      )}

      {habit && !relapsedToday && (
        <button className={'card' + (tickedToday ? ' glow' : '')} style={{ marginTop: 16 }} onClick={tickToday}>
          <Check on={tickedToday} />
          <span className="grow">{tickedToday ? 'Clean today' : `Tick “${habit.name}” for today`}<small>Each clean day climbs the Ascent</small></span>
        </button>
      )}

      <div style={{ margin: '14px -6px 0' }}>
        <Ascent days={days} onStage={(i) => push({ name: 'stage', index: i })} />
      </div>

      <div className="stats" style={{ marginTop: 18 }}>
        <div className="stat"><b>{days ? ASCENT[stage].name : '—'}</b><span>current stage</span></div>
        <div className="stat"><b>{Math.max(state.transmutation.longestDays, days)}d</b><span>longest</span></div>
        <div className="stat"><b>{state.transmutation.relapses.filter((r) => r > yearAgo).length}</b><span>resets, 1 yr</span></div>
      </div>

      {habit && <button className="btn danger" style={{ marginTop: 18 }} onClick={() => setConfirm(true)}>I relapsed</button>}

      <GoldButton dock onClick={() => push({ name: 'urge' })}>Transmute an urge</GoldButton>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h2 className="title">Reset to day 0?</h2>
        <p className="note" style={{ margin: '8px 0 18px' }}>
          Your {days}-day streak ends and the Ascent starts again from Foundation. Your longest run is kept as a record.
        </p>
        <button
          className="btn"
          onClick={() => {
            update((s) => void Object.assign(s, relapseToday(s, Date.now())))
            setConfirm(false)
          }}
        >
          Reset and start again
        </button>
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => setConfirm(false)}>Cancel</button>
      </Sheet>

      <Sheet open={!habit} onClose={pop}>
        <h2 className="title">Start the Ascent</h2>
        <p className="note" style={{ margin: '8px 0 14px' }}>The Ascent grows from a daily NoFap habit on Today. Use one you already have, or add it now.</p>
        {state.habits.filter((h) => h.kind === 'quit').map((h) => (
          <button key={h.id} className="card" onClick={() => linkHabit(h.id)}>
            <span className="grow">{h.name}</span><span className="chev">›</span>
          </button>
        ))}
        <button className="btn" style={{ marginTop: 8 }} onClick={() => linkHabit(null)}>Add “No PMO” to Today</button>
      </Sheet>
    </Screen>
  )
}
