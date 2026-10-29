import { useState } from 'react'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { SortableList } from '../ui'
import { startWorkout } from './Workout'
import type { SplitDay } from '../types'

export function DayEditor({ id }: { id: string }) {
  const { state, update } = useStore()
  const { push, pop } = useNav()
  const [newName, setNewName] = useState('')
  const day = state.days.find((d) => d.id === id)
  if (!day) return <div className="screen"><Back label="Gym" /></div>

  const edit = (fn: (d: SplitDay) => void) => update((s) => fn(s.days.find((d) => d.id === id)!))

  const addExercise = () => {
    const name = newName.trim()
    if (!name) return
    update((s) => {
      let ex = Object.values(s.exercises).find((e) => e.name.toLowerCase() === name.toLowerCase())
      if (!ex) {
        ex = { id: uid(), name }
        s.exercises[ex.id] = ex
      }
      s.days.find((d) => d.id === id)!.exercises.push({ exerciseId: ex.id, sets: 3 })
    })
    setNewName('')
  }

  const removeDay = () => {
    if (!confirm(`Delete "${day.name}"? Your logged sessions are kept.`)) return
    update((s) => void (s.days = s.days.filter((d) => d.id !== id)))
    pop()
  }

  const start = () => {
    if (state.active && !confirm('You already have a workout in progress. Discard it and start this one?')) return
    update((s) => startWorkout(s, id))
    pop()
    push({ name: 'workout' })
  }

  const rows = day.exercises.map((e, i) => ({ ...e, id: `${e.exerciseId}-${i}`, i }))
  const known = Object.values(state.exercises).map((e) => e.name)

  return (
    <div className="screen full">
      <div className="topbar"><Back label="Gym" /></div>
      <input
        className="input"
        style={{ fontSize: 26, fontWeight: 700, margin: '14px 0 4px', background: 'transparent', padding: '6px 0' }}
        value={day.name}
        onChange={(e) => edit((d) => void (d.name = e.target.value))}
      />

      <div className="sec">Exercises</div>
      <SortableList
        items={rows}
        onReorder={(items) => edit((d) => void (d.exercises = items.map(({ exerciseId, sets }) => ({ exerciseId, sets }))))}
        render={(r) => (
          <div className="item" style={{ padding: '10px 0' }}>
            <span className="name">{state.exercises[r.exerciseId]?.name}</span>
            <div className="seg">
              <button onClick={() => edit((d) => void (d.exercises[r.i].sets = Math.max(1, r.sets - 1)))}>−</button>
              <button className="on" style={{ minWidth: 54 }}>{r.sets} sets</button>
              <button onClick={() => edit((d) => void (d.exercises[r.i].sets = Math.min(10, r.sets + 1)))}>+</button>
            </div>
            <button className="del" onClick={() => edit((d) => void d.exercises.splice(r.i, 1))} aria-label="Remove">×</button>
          </div>
        )}
      />
      {!rows.length && <div className="empty">No exercises yet. Add one below.</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <input
          className="input"
          list="known-exercises"
          placeholder="Add exercise"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExercise()}
        />
        <button className="link" onClick={addExercise} style={{ padding: '0 4px', opacity: newName.trim() ? 1 : 0.4 }}>Add</button>
      </div>
      <datalist id="known-exercises">{known.map((n) => <option key={n} value={n} />)}</datalist>

      <button className="btn danger" onClick={removeDay} style={{ marginTop: 28 }}>Delete day</button>

      {rows.length > 0 && (
        <div className="dock">
          <button className="btn" onClick={start}>Start {day.name}</button>
        </div>
      )}
    </div>
  )
}
