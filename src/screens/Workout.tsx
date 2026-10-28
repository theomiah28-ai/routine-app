import { useEffect, useRef, useState } from 'react'
import { formatWeight, isPersonalBest, lastSets, summarise } from '../domain/gym'
import { bell, unlockAudio } from '../audio'
import { Screen, Toast } from '../ui'
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

  const [toast, setToast] = useState<string | null>(null)
  const rang = useRef<number | null>(null)
  const restLeft = state.active?.restEndsAt ? Math.max(0, Math.ceil((state.active.restEndsAt - now) / 1000)) : 0

  useEffect(() => {
    const ends = state.active?.restEndsAt
    if (ends && restLeft === 0 && rang.current !== ends) {
      rang.current = ends
      bell()
    }
  }, [restLeft, state.active?.restEndsAt])

  const active = state.active
  if (!active) return <Screen full><button className="link" onClick={pop}>‹ Gym</button></Screen>
  const day = state.days.find((d) => d.id === active.dayId)

  const setField = (ei: number, si: number, patch: Partial<ActiveSet>) =>
    update((s) => void Object.assign(s.active!.entries[ei].sets[si], patch))

  const tick = (ei: number, si: number, ghost: { weight: string; reps: string }) => {
    const set = active.entries[ei].sets[si]
    if (set.done) return setField(ei, si, { done: false })
    const weight = set.weight || ghost.weight
    const reps = set.reps || ghost.reps
    if (!reps) return
    unlockAudio()
    const exerciseId = active.entries[ei].exerciseId
    const w = parseFloat(weight) || 0
    const pb = isPersonalBest(state, exerciseId, w)
    const pbId = `pb:${active.start}:${exerciseId}`
    update((s) => {
      Object.assign(s.active!.entries[ei].sets[si], { weight: weight || '0', reps, done: true })
      s.active!.restEndsAt = Date.now() + s.settings.restSeconds * 1000
      if (pb && !s.milestones.some((m) => m.id === pbId && m.value === `${formatWeight(w)}kg`)) {
        const name = s.exercises[exerciseId]?.name ?? 'Lift'
        s.milestones = [...s.milestones.filter((m) => m.id !== pbId), { id: pbId, section: 'gym', title: `New PB · ${name}`, value: `${formatWeight(w)}kg`, at: Date.now(), seen: false }]
      }
    })
    if (pb) setToast(`New PB · ${state.exercises[exerciseId]?.name} ${formatWeight(w)}kg`)
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
    pop()
  }

  const discard = (skipConfirm = false) => {
    if (!skipConfirm && !confirm('Discard this workout? Nothing will be saved.')) return
    update((s) => {
      // PBs from a discarded workout don't count
      s.milestones = s.milestones.filter((m) => !m.id.startsWith(`pb:${active.start}:`))
      s.active = null
    })
    pop()
  }

  const doneSets = active.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0)

  return (
    <Screen full>
      {toast && <Toast text={toast} onDone={() => setToast(null)} />}
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
        {restLeft > 0 && (
          <div className="rest-bar">
            <div className="rest-fill" style={{ width: `${(restLeft / state.settings.restSeconds) * 100}%` }} />
            <span>Rest <b>{Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, '0')}</b></span>
            <span className="rest-actions">
              <button onClick={() => update((s) => void (s.active!.restEndsAt = (s.active!.restEndsAt ?? Date.now()) + 30_000))}>+30s</button>
              <button onClick={() => update((s) => void (s.active!.restEndsAt = null))}>Skip</button>
            </span>
          </div>
        )}
        <button className="btn" onClick={finish}>Finish workout</button>
      </div>
    </Screen>
  )
}
