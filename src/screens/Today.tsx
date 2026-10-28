import { useState } from 'react'
import { addDays, formatLong, todayKey } from '../dates'
import { currentStreak, isChecked, isScheduled } from '../streaks'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Check, SortableList } from '../components'
import type { Habit, HabitKind } from '../types'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Today() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [day, setDay] = useState<'today' | 'yesterday'>('today')
  const [editing, setEditing] = useState(false)
  const today = todayKey()
  const key = day === 'today' ? today : addDays(today, -1)

  const visible = editing ? state.habits : state.habits.filter((h) => isScheduled(h, key) && key >= h.createdAt)
  const doneCount = visible.filter((h) => isChecked(state.checks, h.id, key)).length
  const pct = visible.length ? (doneCount / visible.length) * 100 : 0

  const toggle = (id: string) =>
    update((s) => {
      const list = s.checks[key] ?? []
      s.checks[key] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })

  const reorder = (kind: HabitKind, items: Habit[]) =>
    update((s) => {
      const others = s.habits.filter((h) => h.kind !== kind)
      s.habits = kind === 'build' ? [...items, ...others] : [...others, ...items]
    })

  const row = (h: Habit) => {
    const done = !editing && isChecked(state.checks, h.id, key)
    const streak = currentStreak(h, state.checks, today)
    return (
      <div key={h.id} className={'item' + (done ? ' done' : '') + (h.kind === 'quit' ? ' quit' : '')}>
        {!editing && <Check on={done} onClick={() => toggle(h.id)} />}
        <button className="name" style={{ textAlign: 'left' }} onClick={() => push(editing ? { name: 'habitEdit', id: h.id } : { name: 'habit', id: h.id })}>
          {h.name}
        </button>
        {editing ? <span className="chev">›</span> : <span className={'streak' + (streak ? '' : ' zero')}>{streak}d</span>}
      </div>
    )
  }

  const section = (kind: HabitKind, title: string) => {
    const items = visible.filter((h) => h.kind === kind)
    if (!items.length && !editing) return null
    return (
      <>
        <div className="sec">{title}</div>
        {editing ? <SortableList items={items} onReorder={(i) => reorder(kind, i)} render={row} /> : items.map(row)}
      </>
    )
  }

  return (
    <div className="screen">
      <div className="topbar">
        <span className="date">{formatLong(key)}</span>
        <div className="row" style={{ gap: 16 }}>
          {!editing && (
            <button className="icon-btn" onClick={() => push({ name: 'settings' })} aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
                <circle cx="16" cy="7" r="2" />
                <circle cx="10" cy="17" r="2" />
              </svg>
            </button>
          )}
          <button className="link" onClick={() => setEditing(!editing)}>{editing ? 'Done' : 'Edit'}</button>
        </div>
      </div>
      <h1>{editing ? 'Edit routine' : `${greeting()}, ${state.name}`}</h1>

      {!editing && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            <span className="sub">{doneCount} of {visible.length} done</span>
            <div className="seg">
              <button className={day === 'yesterday' ? 'on' : ''} onClick={() => setDay('yesterday')}>Yesterday</button>
              <button className={day === 'today' ? 'on' : ''} onClick={() => setDay('today')}>Today</button>
            </div>
          </div>
          <div className="progress"><i style={{ width: `${pct}%` }} /></div>
        </>
      )}

      {section('build', 'Build')}
      {section('quit', 'Quit')}

      {!visible.length && !editing && <div className="empty">Nothing scheduled{day === 'today' ? ' today' : ''}.</div>}

      <button className="add-row" onClick={() => push({ name: 'habitEdit' })}>+ Add habit</button>
    </div>
  )
}
