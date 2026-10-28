import { useEffect, useState } from 'react'
import { formatWeight, lastSets, summarise } from '../gym'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Check } from '../ui'
import type { ActiveSet, State } from '../types'

const blank = (): ActiveSet => ({ weight: '', reps: '', done: false })

export function startWorkout(s: State, dayId: string) {
  const day = s.days.find((d) => d.id === dayId)!
  s.active = {
    dayId,
    start: Date.now(),
    entries: day.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: Array.from({ length: e.sets }, blank) })),
    restEndsAt: null,
  }
}

function elapsed(ms: number) {
  const t = Math.floor(ms / 1000)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = String(t % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function Workout() {
  const { state, update } = useStore()
  const { pop, reset, push } = useNav()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const active = state.active
  if (!active) return <div className="screen full"><button className="link" onClick={reset}>‹ Gym</button></div>
  const day = state.days.find((d) => d.id === active.dayId)

  const setField = (ei: number, si: number, patch: Partial<ActiveSet>) =>
    update((s) => void Object.assign(s.active!.entries[ei].sets[si], patch))

  const tick = (ei: number, si: number, ghost: { weight: string; reps: string }) => {
    const set = active.entries[ei].sets[si]
    if (set.done) return setField(ei, si, { done: false })
    const weight = set.weight || ghost.weight
    const reps = set.reps || ghost.reps
    if (!reps) return
    setField(ei, si, { weight: weight || '0', reps, done: true })
  }

  const finish = () => {
    const entries = active.entries
      .map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter((x) => x.done).map((x) => ({ weight: parseFloat(x.weight) || 0, reps: parseInt(x.reps) || 0 })),
      }))
      .filter((e) => e.sets.length)
    if (!entries.length) {
      if (confirm('No sets ticked. Discard this workout?')) discard(true)
      return
    }
    update((s) => {
      s.sessions.push({ id: uid(), dayId: active.dayId, dayName: day?.name ?? 'Workout', start: active.start, end: Date.now(), entries })
      s.active = null
      const gym = s.habits.find((h) => h.link === 'gym')
      const key = todayKey()
      if (gym && !(s.checks[key] ?? []).includes(gym.id)) s.checks[key] = [...(s.checks[key] ?? []), gym.id]
    })
    reset()
  }

  const discard = (skipConfirm = false) => {
    if (!skipConfirm && !confirm('Discard this workout? Nothing will be saved.')) return
    update((s) => void (s.active = null))
    reset()
  }

  const doneSets = active.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0)

  return (
    <div className="screen full">
      <div className="topbar">
        <button className="link muted" onClick={pop}>‹ Gym</button>
        <span className="date" style={{ fontVariantNumeric: 'tabular-nums' }}>{elapsed(now - active.start)}</span>
      </div>
      <h1 style={{ marginTop: 14 }}>{day?.name ?? 'Workout'}</h1>
      <div className="sub">{doneSets} sets done</div>

      {active.entries.map((entry, ei) => {
        const prev = lastSets(state, entry.exerciseId)
        const name = state.exercises[entry.exerciseId]?.name
        const ghosts: { weight: string; reps: string }[] = []
        return (
          <div className="ex" key={ei}>
            <div className="ex-head">
              <div>
                <h3>{name}</h3>
                <div className="last">{prev.length ? `Last time: ${summarise(prev)}` : 'First time, set your baseline'}</div>
              </div>
              <button className="chev" onClick={() => push({ name: 'exercise', id: entry.exerciseId })} aria-label="Progress">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18l5-6 4 3 7-9" /></svg>
              </button>
            </div>
            {entry.sets.map((set, si) => {
              // Ghost values: same set last session, else the set above in this session
              const p = prev[si]
              const above = ghosts[si - 1]
              const ghost = p
                ? { weight: formatWeight(p.weight), reps: String(p.reps) }
                : { weight: entry.sets[si - 1]?.weight || above?.weight || '', reps: entry.sets[si - 1]?.reps || above?.reps || '' }
              ghosts[si] = ghost
              return (
                <div className={'set' + (set.done ? ' done' : '')} key={si}>
                  <span className="n">{si + 1}</span>
                  <input className="num" inputMode="decimal" placeholder={ghost.weight || '—'} value={set.weight} onChange={(e) => setField(ei, si, { weight: e.target.value.replace(',', '.') })} />
                  kg
                  <input className="num" style={{ width: 56 }} inputMode="numeric" placeholder={ghost.reps || '—'} value={set.reps} onChange={(e) => setField(ei, si, { reps: e.target.value.replace(/\D/g, '') })} />
                  reps
                  <Check on={set.done} onClick={() => tick(ei, si, ghost)} />
                </div>
              )
            })}
            <div className="set-actions">
              <button onClick={() => update((s) => {
                const sets = s.active!.entries[ei].sets
                const last = sets[sets.length - 1]
                sets.push({ weight: last?.weight ?? '', reps: last?.reps ?? '', done: false })
              })}>+ Add set</button>
              {entry.sets.length > 1 && <button onClick={() => update((s) => void s.active!.entries[ei].sets.pop())}>− Remove set</button>}
            </div>
          </div>
        )
      })}

      <button className="btn danger" onClick={() => discard()} style={{ marginTop: 24 }}>Discard workout</button>

      <div className="dock">
        <button className="btn" onClick={finish}>Finish workout</button>
      </div>
    </div>
  )
}
