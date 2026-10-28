import { useEffect, useRef, useState } from 'react'
import { bell, unlockAudio } from '../audio'
import { logPractice } from '../domain/stillness'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen } from '../ui'
import type { State } from '../types'

type WakeLock = { release: () => Promise<void> }

function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return
    let lock: WakeLock | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLock> } }
    const req = () => nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    req()
    const vis = () => document.visibilityState === 'visible' && req()
    document.addEventListener('visibilitychange', vis)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      void lock?.release().catch(() => {})
    }
  }, [on])
}

/** Ticks a habit linked to Stillness for today. */
export function tickStillnessHabit(s: State) {
  const h = s.habits.find((x) => x.link === 'stillness')
  const key = todayKey()
  if (h && !(s.checks[key] ?? []).includes(h.id)) s.checks[key] = [...(s.checks[key] ?? []), h.id]
}

export function Sit() {
  const { state, update } = useStore()
  const { pop } = useNav()
  const [minutes, setMinutes] = useState(state.stillness.sitMinutes)
  const [start, setStart] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [dim, setDim] = useState(false)
  const halfRung = useRef(false)
  const logged = useRef(false)
  const total = minutes * 60e3
  const left = start ? Math.max(0, total - (now - start)) : total
  const running = start !== null && !finished

  useWakeLock(running)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [running])

  // Dim the interface after 10s; a tap brings it back
  useEffect(() => {
    if (!running || dim) return
    const t = setTimeout(() => setDim(true), 10_000)
    return () => clearTimeout(t)
  }, [running, dim])

  const log = (completed: boolean) => {
    if (logged.current || !start) return
    logged.current = true
    const mins = Math.round(((completed ? total : Date.now() - start) / 60e3) * 10) / 10
    if (mins <= 0) return
    update((s) => {
      s.stillness = logPractice(s.stillness, { id: uid(), kind: 'sit', start, minutes: mins, completed })
      s.stillness.sitMinutes = minutes
      if (completed) tickStillnessHabit(s)
    })
  }

  useEffect(() => {
    if (!running) return
    if (!halfRung.current && left <= total / 2) {
      halfRung.current = true
      bell()
    }
    if (left <= 0) {
      bell()
      setFinished(true)
      log(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running])

  // Leaving mid-sit keeps the minutes but not the streak
  const latest = useRef(log)
  latest.current = log
  useEffect(() => () => latest.current(false), [])

  const begin = () => {
    unlockAudio()
    bell()
    setStart(Date.now())
    setNow(Date.now())
  }

  const mm = Math.floor(left / 60e3)
  const ss = String(Math.floor((left % 60e3) / 1000)).padStart(2, '0')
  const r = 120
  const c = 2 * Math.PI * r

  return (
    <Screen bg="night" full>
      <div onClick={() => setDim(false)} style={{ minHeight: '80dvh', transition: 'opacity 1.5s', opacity: dim ? 0.35 : 1 }}>
        <div className="topbar">
          <button className="link muted" onClick={pop}>✕</button>
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
            <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#5a4a28', marginTop: 4 }}>{finished ? 'COMPLETE' : start ? 'REMAINING' : 'MINUTES'}</div>
          </div>
        </div>

        {!start && (
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
      </div>

      {!start && <div className="dock"><button className="btn" onClick={begin}>Begin</button></div>}
      {finished && <div className="dock"><button className="btn" onClick={pop}>Done</button></div>}
    </Screen>
  )
}
