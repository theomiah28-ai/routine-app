import { useState } from 'react'
import { exerciseHistory, formatWeight, nextDayId, sessionsThisWeek, topWeight } from '../gym'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { SortableList } from '../ui'
import { startWorkout } from './Workout'
import type { SplitDay } from '../types'

export function Gym() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [editing, setEditing] = useState(false)
  const nextId = nextDayId(state)
  const next = state.days.find((d) => d.id === nextId)

  const loggedIds = new Set(state.sessions.flatMap((s) => s.entries.map((e) => e.exerciseId)))
  const exercises = Object.values(state.exercises).filter((e) => loggedIds.has(e.id))

  const addDay = () => {
    const id = uid()
    update((s) => void s.days.push({ id, name: `Day ${s.days.length + 1}`, exercises: [] }))
    push({ name: 'dayEdit', id })
  }

  const start = (dayId: string) => {
    update((s) => startWorkout(s, dayId))
    push({ name: 'workout' })
  }

  const dayCard = (d: SplitDay) => (
    <button key={d.id} className={'card' + (!editing && d.id === nextId ? ' next' : '')} onClick={() => push({ name: 'dayEdit', id: d.id })}>
      <span className="grow">
        {d.name}
        <small>{d.exercises.map((e) => state.exercises[e.exerciseId]?.name).join(', ') || 'No exercises yet'}</small>
      </span>
      {!editing && d.id === nextId ? <span className="pill">Next up</span> : <span className="chev">›</span>}
    </button>
  )

  return (
    <div className="screen" style={{ paddingBottom: 'calc(var(--tabbar) + var(--safe-bottom) + 100px)' }}>
      <div className="topbar">
        <span className="date">Gym</span>
        <button className="link" onClick={() => setEditing(!editing)}>{editing ? 'Done' : 'Edit split'}</button>
      </div>
      {editing ? (
        <input className="input" style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }} value={state.splitName} onChange={(e) => update((s) => void (s.splitName = e.target.value))} />
      ) : (
        <h1>{state.splitName}</h1>
      )}

      {state.active && (
        <button className="banner" onClick={() => push({ name: 'workout' })}>
          <span>Workout in progress</span>
          <span>Resume ›</span>
        </button>
      )}

      <div className="stats" style={{ marginTop: 14 }}>
        <div className="stat"><b>{state.sessions.length}</b><span>sessions total</span></div>
        <div className="stat"><b className="acc">{sessionsThisWeek(state.sessions)}</b><span>this week</span></div>
      </div>

      <div className="sec" style={{ marginBottom: 10 }}>Your split</div>
      {editing ? (
        <SortableList items={state.days} onReorder={(days) => update((s) => void (s.days = days))} render={dayCard} />
      ) : (
        state.days.map(dayCard)
      )}
      <button className="add-row" onClick={addDay}>+ Add day</button>

      {exercises.length > 0 && !editing && (
        <>
          <div className="sec">Progress</div>
          {exercises.map((e) => {
            const h = exerciseHistory(state, e.id)
            const last = h.length ? topWeight(h[h.length - 1].sets) : null
            return (
              <button key={e.id} className="item" onClick={() => push({ name: 'exercise', id: e.id })}>
                <span className="name">{e.name}</span>
                <span className="sub">{last !== null ? `${formatWeight(last)}kg` : '—'}</span>
                <span className="chev">›</span>
              </button>
            )
          })}
        </>
      )}

      {!editing && (state.active || next) && (
        <div className="dock over-tabs">
          {state.active ? (
            <button className="btn" onClick={() => push({ name: 'workout' })}>Resume workout</button>
          ) : (
            <button className="btn" onClick={() => start(next!.id)}>Start {next!.name}</button>
          )}
        </div>
      )}
    </div>
  )
}
