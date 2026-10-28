import { useEffect, useRef, useState } from 'react'
import { bell, unlockAudio } from '../audio'
import { finishSit, sitLeft } from '../domain/sit'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen } from '../ui'
import type { State } from '../types'

type WakeLock = { release: () => Promise<void> }

function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return
    let lock: WakeLock | null = null
    let alive = true
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } }
    const req = () =>
      nav.wakeLock
        ?.request('screen')
        .then((l) => {
          // Released if the request resolves after the sit has ended
          if (alive) lock = l
          else void l.release().catch(() => {})
        })
        .catch(() => {})
    req()
    const vis = () => document.visibilityState === 'visible' && req()
    document.addEventListener('visibilitychange', vis)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', vis)
      void lock?.release().catch(() => {})
    }
  }, [on])
}

/** Ticks the habit linked to Stillness on the given day. */
export function tickStillnessHabit(s: State, key: string) {
  const h = s.habits.find((x) => x.link === 'stillness')
  if (h && !(s.checks[key] ?? []).includes(h.id)) s.checks[key] = [...(s.checks[key] ?? []), h.id]
}

export function Sit() {
  const { state, update } = useStore()
  const { pop } = useNav()
  const active = state.stillness.activeSit ?? null
  const [minutes, setMinutes] = useState(active?.minutes ?? state.stillness.sitMinutes)
  const [now, setNow] = useState(Date.now())
  const [dim, setDim] = useState(false)
  const [done, setDone] = useState(false)
  const halfRung = useRef(false)
  const total = (active?.minutes ?? minutes) * 60e3
  const left = done ? 0 : active ? sitLeft(active, now) : total
  const running = !!active && left > 0
  // The sit ran out while the app was in the background: ask rather than assume
  const unsure = !!active && left <= 0 && active.hiddenAt !== undefined

  useWakeLock(running)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [running])

  // Remember when the app goes to the background, and forget it when they come back mid-sit
  useEffect(() => {
    if (!active) return
    const vis = () => {
      const t = Date.now()
      setNow(t)
      update((s) => {
        const a = s.stillness.activeSit
        if (!a) return
        if (document.visibilityState === 'hidden') a.hiddenAt = t
        else if (sitLeft(a, t) > 0) delete a.hiddenAt
      })
    }
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [!!active, update])

  // Reopened mid-sit (e.g. after iOS closed the app): they're back, so stop treating it as left
  useEffect(() => {
    if (running && active?.hiddenAt !== undefined) update((s) => void (s.stillness.activeSit && delete s.stillness.activeSit.hiddenAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running || dim) return
    const t = setTimeout(() => setDim(true), 10_000)
    return () => clearTimeout(t)
  }, [running, dim])

  const close = (completed: boolean) =>
    update((s) => {
      const r = finishSit(s.stillness, completed, Date.now())
      s.stillness = r.stillness
      if (completed) tickStillnessHabit(s, r.dayKey)
    })

  useEffect(() => {
    if (!active) return
    if (!halfRung.current && left <= total / 2 && left > 0) {
      halfRung.current = true
      bell()
    }
    // Finished while they were here: ring and complete
    if (left <= 0 && active.hiddenAt === undefined && !done) {
      bell()
      setDone(true)
      close(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, active])

  const begin = () => {
    unlockAudio()
    bell()
    const t = Date.now()
    halfRung.current = false
    update((s) => {
      s.stillness.sitMinutes = minutes
      s.stillness.activeSit = { start: t, minutes }
    })
    setNow(t)
  }

  // Leaving with ✕ mid-sit keeps the minutes but not the streak
  const exit = () => {
    if (running) close(false)
    pop()
  }

  const mm = Math.floor(left / 60e3)
  const ss = String(Math.floor((left % 60e3) / 1000)).padStart(2, '0')
  const r = 120
  const c = 2 * Math.PI * r
  const finished = done || unsure

  return (
    <Screen bg="night" full>
      <div onClick={() => setDim(false)} style={{ minHeight: '80dvh', transition: 'opacity 1.5s', opacity: dim && running ? 0.35 : 1 }}>
        <div className="topbar">
          <button className="link muted" onClick={exit}>✕</button>
          <span className="label" style={{ color: '#5a4a28' }}>The Morning Sit</span>
          <span style={{ width: 16 }} />
        </div>

        <div style={{ position: 'relative', width: 280, height: 280, margin: '70px auto 0' }}>
          <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r={r} fill="none" stroke="#17140d" strokeWidth="3" />
            <circle cx="140" cy="140" r={r} fill="none" stroke="#8a7240" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (left / total)} style={{ transition: 'stroke-dashoffset 0.3s linear' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 50, fontWeight: 250, color: '#d8cfb8', letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#5a4a28', marginTop: 4 }}>{finished ? 'COMPLETE' : active ? 'REMAINING' : 'MINUTES'}</div>
          </div>
        </div>

        {!active && !done && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div className="row" style={{ justifyContent: 'center', gap: 20 }}>
              <button className="icon-btn" style={{ fontSize: 28 }} onClick={() => setMinutes(Math.max(5, minutes - 5))}>−</button>
              <span style={{ color: '#8a8578', fontSize: 14 }}>{minutes} minutes</span>
              <button className="icon-btn" style={{ fontSize: 28 }} onClick={() => setMinutes(Math.min(120, minutes + 5))}>+</button>
            </div>
            <p className="note" style={{ color: '#4a4130', margin: '18px 30px 0' }}>Sit upright. Eyes closed. A bell at the start, halfway and the end. Nothing else.</p>
          </div>
        )}
        {running && <p className="note" style={{ textAlign: 'center', color: '#3a3324', marginTop: 50 }}>Just watch.</p>}
        {unsure && !done && <p className="note" style={{ textAlign: 'center', marginTop: 40 }}>Your sit time ran out while the app was closed.<br />Did you sit the whole time?</p>}
      </div>

      {!active && !done && <div className="dock"><button className="btn" onClick={begin}>Begin</button></div>}
      {done && <div className="dock"><button className="btn" onClick={pop}>Done</button></div>}
      {unsure && !done && (
        <div className="dock">
          <button className="btn" onClick={() => { close(true); setDone(true) }}>Yes, I sat the full {active!.minutes} min</button>
          <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => { close(false); pop() }}>No, I stopped early</button>
        </div>
      )}
    </Screen>
  )
}
