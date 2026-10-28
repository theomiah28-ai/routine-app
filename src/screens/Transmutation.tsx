import { useEffect, useState } from 'react'
import { ASCENT } from '../content/ascent'
import { elapsed, longest, relapse, stageIndex } from '../domain/transmutation'
import { srFromHabit } from '../migrate'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Ascent } from '../symbols/Ascent'
import { GoldButton, Screen, Sheet } from '../ui'

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
  const { push } = useNav()
  const now = useNow()
  const [confirm, setConfirm] = useState(false)
  const t = state.transmutation
  const e = elapsed(t.start, now)
  const stage = stageIndex(e.days)
  const next = ASCENT[stage + 1]
  const toGo = next ? next.day - 1 - e.days : 0
  const yearAgo = now - 365 * 86400e3

  const pickHabit = (habitId: string | null) =>
    update((s) => {
      if (!habitId) {
        s.transmutation = { start: Date.now(), longestDays: 0, relapses: [] }
        return
      }
      // Rebuild the run from that habit's ticks (same rules as migration), then retire it from Routine
      const h = s.habits.find((x) => x.id === habitId)
      if (!h) return
      s.transmutation = { ...srFromHabit(h, s.checks, todayKey()), relapses: [] }
      s.habits = s.habits.filter((h) => h.id !== habitId)
      for (const k in s.checks) s.checks[k] = s.checks[k].filter((x) => x !== habitId)
    })

  return (
    <Screen bg="gold" full>
      <div className="topbar"><Back label="Today" /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Transmutation</div>
      <div className="big-num" style={{ marginTop: 6 }}>
        {e.days}
        <small>{e.days === 1 ? 'day' : 'days'} · {e.hours} hrs</small>
      </div>
      {next ? (
        <div className="sub" style={{ marginTop: 8 }}>
          Next: <b style={{ color: 'var(--gold)' }}>Day {next.day} · {next.name}</b>, {toGo} {toGo === 1 ? 'day' : 'days'} to go
        </div>
      ) : (
        <div className="sub" style={{ marginTop: 8, color: 'var(--gold)' }}>Mastery reached</div>
      )}

      <div style={{ margin: '18px -6px 0' }}>
        <Ascent days={e.days} onStage={(i) => push({ name: 'stage', index: i })} />
      </div>

      <div className="stats" style={{ marginTop: 18 }}>
        <div className="stat"><b>{ASCENT[stage].name}</b><span>current stage</span></div>
        <div className="stat"><b>{longest(t, now)}d</b><span>longest</span></div>
        <div className="stat"><b>{t.relapses.filter((r) => r > yearAgo).length}</b><span>resets, 1 yr</span></div>
      </div>

      <button className="btn danger" style={{ marginTop: 18 }} onClick={() => setConfirm(true)}>I relapsed</button>

      <GoldButton dock onClick={() => push({ name: 'urge' })}>Transmute an urge</GoldButton>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <h2 className="title">Reset to day 0?</h2>
        <p className="note" style={{ margin: '8px 0 18px' }}>
          Your {e.days}-day streak ends and the Ascent starts again from Foundation. Your longest run is kept as a record.
        </p>
        <button
          className="btn"
          onClick={() => {
            update((s) => void (s.transmutation = relapse(s.transmutation, Date.now())))
            setConfirm(false)
          }}
        >
          Reset and start again
        </button>
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => setConfirm(false)}>Cancel</button>
      </Sheet>

      <Sheet open={!!t.needsPick} onClose={() => pickHabit(null)}>
        <h2 className="title">Which habit was your SR tracker?</h2>
        <p className="note" style={{ margin: '8px 0 14px' }}>Your streak moves into the Ascent and the habit leaves your routine.</p>
        {state.habits.filter((h) => h.kind === 'quit').map((h) => (
          <button key={h.id} className="card" onClick={() => pickHabit(h.id)}>
            <span className="grow">{h.name}</span><span className="chev">›</span>
          </button>
        ))}
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => pickHabit(null)}>None, start today</button>
      </Sheet>
    </Screen>
  )
}
