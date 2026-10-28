import { useState } from 'react'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Moon, Screen, Sun } from '../ui'
import type { Habit, HabitKind, TimeOfDay } from '../types'

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
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(existing?.timeOfDay ?? 'anytime')
  const [link, setLink] = useState<Habit['link']>(existing?.link)

  const save = () => {
    if (!name.trim() || !days.length) return
    const fields = { name: name.trim(), kind, days: days.length === 7 ? [] : days, timeOfDay, link: kind === 'build' ? link : undefined }
    update((s) => {
      // Only one habit can be linked to each section
      if (fields.link) s.habits.forEach((h) => h.link === fields.link && h.id !== id && (h.link = undefined))
      const h = s.habits.find((h) => h.id === id)
      if (h) Object.assign(h, fields)
      else s.habits.push({ id: uid(), createdAt: todayKey(), ...fields })
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
    <Screen full>
      <div className="topbar">
        <Back label="Cancel" />
        <button className="link gold" onClick={save} style={{ opacity: name.trim() && days.length ? 1 : 0.4 }}>Save</button>
      </div>
      <h1 style={{ margin: '14px 0 22px' }}>{existing ? 'Edit habit' : 'New habit'}</h1>

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

      {kind === 'build' && (
        <div className="field">
          <label>Time of day</label>
          <div className="seg">
            <button className={timeOfDay === 'morning' ? 'on' : ''} onClick={() => setTimeOfDay('morning')}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Sun size={13} />Morning</span>
            </button>
            <button className={timeOfDay === 'anytime' ? 'on' : ''} onClick={() => setTimeOfDay('anytime')}>Anytime</button>
            <button className={timeOfDay === 'evening' ? 'on' : ''} onClick={() => setTimeOfDay('evening')}>
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Moon size={13} />Evening</span>
            </button>
          </div>
        </div>
      )}

      <div className="field">
        <label>Days</label>
        <div className="days">
          {WEEK.map(({ d, l }) => (
            <button key={d} className={days.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{l}</button>
          ))}
        </div>
        <p className="note" style={{ marginTop: 10 }}>Streaks only count the days you pick, so rest days never break them.</p>
      </div>

      {kind === 'build' && (
        <div className="field">
          <label>Tick automatically when I finish</label>
          <div className="seg">
            <button className={!link ? 'on' : ''} onClick={() => setLink(undefined)}>Nothing</button>
            <button className={link === 'gym' ? 'on' : ''} onClick={() => setLink('gym')}>A workout</button>
            <button className={link === 'stillness' ? 'on' : ''} onClick={() => setLink('stillness')}>A sit</button>
          </div>
        </div>
      )}

      {existing && <button className="btn danger" onClick={remove} style={{ marginTop: 20 }}>Delete habit</button>}
    </Screen>
  )
}
