import { useState } from 'react'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Moon, Screen, Stepper, Sun } from '../ui'
import type { Habit, HabitKind, TimeOfDay } from '../types'

const LINKS: { id: Habit['link']; label: string; hint: string }[] = [
  { id: undefined, label: 'None', hint: 'Just a habit' },
  { id: 'transmutation', label: 'Transmutation', hint: 'NoFap: climbs the Ascent' },
  { id: 'stillness', label: 'Stillness', hint: 'Meditation: opens the Eye' },
  { id: 'faith', label: 'Faith', hint: 'Prayer or scripture' },
  { id: 'gym', label: 'Gym', hint: 'Ticked when you finish a workout' },
]

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
  const [minutes, setMinutes] = useState(existing?.minutes ?? (existing?.link === 'faith' ? 20 : 30))

  const save = () => {
    if (!name.trim() || !days.length) return
    const fields = { name: name.trim(), kind, days: days.length === 7 ? [] : days, timeOfDay, link, minutes: link === 'stillness' || link === 'faith' ? minutes : undefined }
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

      <div className="field">
        <label>Grows a section in Journey</label>
        <div className="link-grid">
          {LINKS.filter((l) => l.id !== 'faith' || state.settings.faith).map((l) => (
            <button key={l.id ?? 'none'} className={'link-opt' + (link === l.id ? ' on' : '')} onClick={() => setLink(l.id)}>
              <b>{l.label}</b>
              <small>{l.hint}</small>
            </button>
          ))}
        </div>
      </div>

      {(link === 'stillness' || link === 'faith') && (
        <div className="field row" style={{ background: 'var(--surface)', borderRadius: 12, padding: '10px 14px' }}>
          <span style={{ fontSize: 15 }}>Minutes each time<div className="sub" style={{ fontSize: 12 }}>{link === 'stillness' ? 'More minutes open the Eye faster' : 'Time with God each day'}</div></span>
          <Stepper value={minutes} step={5} min={5} onChange={setMinutes} />
        </div>
      )}

      {existing && <button className="btn danger" onClick={remove} style={{ marginTop: 20 }}>Delete habit</button>}
    </Screen>
  )
}
