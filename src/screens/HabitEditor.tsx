import { useState } from 'react'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Toggle } from '../ui'
import type { HabitKind } from '../types'

// Mon-first display, stored as JS weekday numbers
const WEEK = [
  { d: 1, l: 'M' }, { d: 2, l: 'T' }, { d: 3, l: 'W' }, { d: 4, l: 'T' }, { d: 5, l: 'F' }, { d: 6, l: 'S' }, { d: 0, l: 'S' },
]

export function HabitEditor({ id }: { id?: string }) {
  const { state, update } = useStore()
  const { pop, reset } = useNav()
  const existing = state.habits.find((h) => h.id === id)
  const [name, setName] = useState(existing?.name ?? '')
  const [kind, setKind] = useState<HabitKind>(existing?.kind ?? 'build')
  const [days, setDays] = useState<number[]>(existing?.days.length ? existing.days : [0, 1, 2, 3, 4, 5, 6])
  const [isGym, setIsGym] = useState(existing?.link === 'gym')

  const save = () => {
    if (!name.trim()) return
    const fields = { name: name.trim(), kind, days: days.length === 7 ? [] : days, link: isGym ? ('gym' as const) : existing?.link === 'gym' ? undefined : existing?.link }
    update((s) => {
      if (isGym) s.habits.forEach((h) => h.link === 'gym' && (h.link = undefined))
      const h = s.habits.find((h) => h.id === id)
      if (h) Object.assign(h, fields)
      else s.habits.push({ id: uid(), createdAt: todayKey(), timeOfDay: 'anytime', ...fields })
    })
    pop()
  }

  const remove = () => {
    if (!confirm(`Delete "${existing!.name}" and its history?`)) return
    update((s) => {
      s.habits = s.habits.filter((h) => h.id !== id)
      for (const k in s.checks) s.checks[k] = s.checks[k].filter((x) => x !== id)
    })
    reset()
  }

  const toggleDay = (d: number) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))

  return (
    <div className="screen full">
      <div className="topbar">
        <Back label="Cancel" />
        <button className="link" onClick={save} style={{ opacity: name.trim() && days.length ? 1 : 0.4 }}>Save</button>
      </div>
      <h1 style={{ marginBottom: 22 }}>{existing ? 'Edit habit' : 'New habit'}</h1>

      <div className="field">
        <label>Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Read 20 min" autoFocus={!existing} />
      </div>

      <div className="field">
        <label>Type</label>
        <div className="seg">
          <button className={kind === 'build' ? 'on' : ''} onClick={() => setKind('build')}>Build a habit</button>
          <button className={kind === 'quit' ? 'on' : ''} onClick={() => setKind('quit')}>Quit a habit</button>
        </div>
        {kind === 'quit' && <p className="note" style={{ marginTop: 10 }}>Tick it each day you stayed clean.</p>}
      </div>

      <div className="field">
        <label>Days</label>
        <div className="days">
          {WEEK.map(({ d, l }) => (
            <button key={d} className={days.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{l}</button>
          ))}
        </div>
        <p className="note" style={{ marginTop: 10 }}>Streaks only count the days you pick, so rest days never break them.</p>
      </div>

      <div className="field row" style={{ background: 'var(--surface)', borderRadius: 12, padding: '12px 14px' }}>
        <span style={{ fontSize: 15 }}>Tick automatically when I finish a workout</span>
        <Toggle on={isGym} onChange={setIsGym} />
      </div>

      {existing && <button className="btn danger" onClick={remove} style={{ marginTop: 20 }}>Delete habit</button>}
    </div>
  )
}
