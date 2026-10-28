import { useState, type ReactNode } from 'react'
import { addDays, dateKey, formatLong } from '../dates'
import { useNow } from './Transmutation'
import { isChecked, isScheduled } from '../domain/streaks'
import { habitStreak } from '../domain/progression'
import { completion } from '../domain/completion'
import { useStore } from '../store'
import { useNav, type Route } from '../nav'
import { Check, Moon, Ring, Screen, SortableList, Sun } from '../ui'
import type { Habit } from '../types'

type Group = { key: string; title: string; icon?: ReactNode; match: (h: Habit) => boolean }

const GROUPS: Group[] = [
  { key: 'morning', title: 'Morning', icon: <Sun />, match: (h) => h.kind === 'build' && h.timeOfDay === 'morning' },
  { key: 'anytime', title: 'Anytime', match: (h) => h.kind === 'build' && h.timeOfDay === 'anytime' },
  { key: 'evening', title: 'Evening', icon: <Moon />, match: (h) => h.kind === 'build' && h.timeOfDay === 'evening' },
  { key: 'quit', title: 'Quit', match: (h) => h.kind === 'quit' },
]

function greeting(h: number) {
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Today() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [day, setDay] = useState<'today' | 'yesterday'>('today')
  const [editing, setEditing] = useState(false)
  // Re-reads the clock every minute and when the app comes back, so midnight rolls over
  const now = useNow(60_000)
  const today = dateKey(new Date(now))
  const key = day === 'today' ? today : addDays(today, -1)
  const hour = new Date(now).getHours()
  const c = completion(state, key)
  const relapsed = state.transmutation.relapses.some((r) => dateKey(new Date(r)) === today)

  const visible = editing ? state.habits : state.habits.filter((h) => isScheduled(h, key) && key >= h.createdAt)

  const toggle = (id: string) =>
    update((s) => {
      const list = s.checks[key] ?? []
      s.checks[key] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })

  // `items` may be only the habits shown today; hidden ones keep their slots
  const reorder = (g: Group, items: Habit[]) =>
    update((s) => {
      const shown = new Set(items.map((h) => h.id))
      let i = 0
      s.habits = s.habits.map((h) => {
        if (!g.match(h) || !shown.has(h.id)) return h
        const id = items[i++].id
        return s.habits.find((x) => x.id === id)!
      })
    })

  const row = (h: Habit) => {
    const done = !editing && isChecked(state.checks, h.id, key)
    const streak = habitStreak(state, h, today)
    // A logged relapse closes today for the SR habit
    const reset = h.link === 'transmutation' && key === today && relapsed
    return (
      <div key={h.id} className={'item' + (done ? ' done' : '') + (h.kind === 'quit' ? ' quit' : '')}>
        {!editing && (reset ? <span className="chk" style={{ opacity: 0.35 }} /> : <Check on={done} onClick={() => toggle(h.id)} />)}
        <button className="name" onClick={() => push(editing ? { name: 'habitEdit', id: h.id } : { name: 'habit', id: h.id })}>
          {h.name}
        </button>
        {editing ? <span className="chev">›</span> : reset ? <span className="streak zero">reset</span> : <span className={'streak' + (streak ? '' : ' zero')}>{streak}d</span>}
      </div>
    )
  }

  const flow: { label: string; route: Route } | null =
    day !== 'today' || editing ? null : hour < 12 ? { label: 'Start morning', route: { name: 'morning' } } : hour >= 18 ? { label: 'Wind down', route: { name: 'evening' } } : null

  return (
    <Screen>
      <div className="topbar">
        <span className="date">{formatLong(key)}</span>
        <button className="link" onClick={() => setEditing(!editing)}>{editing ? 'Done' : 'Edit'}</button>
      </div>

      {editing ? (
        <h1>Edit routine</h1>
      ) : (
        <>
          <h1 style={{ marginBottom: 16 }}>
            {greeting(hour)}
            {state.settings.name ? `, ${state.settings.name}` : ''}
          </h1>
          <div className="row" style={{ alignItems: 'center', gap: 18 }}>
            <Ring pct={c.pct} size={92} stroke={8}>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(c.pct * 100)}%</div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 650 }}>{c.done === c.total && c.total ? 'Day complete' : `${c.done} of ${c.total} done`}</div>
              <div className="sub" style={{ marginTop: 2 }}>{day === 'today' ? 'Every tick fills the ring' : 'Fixing yesterday'}</div>
              <div className="seg" style={{ marginTop: 10 }}>
                <button className={day === 'yesterday' ? 'on' : ''} onClick={() => setDay('yesterday')}>Yesterday</button>
                <button className={day === 'today' ? 'on' : ''} onClick={() => setDay('today')}>Today</button>
              </div>
            </div>
          </div>
          {flow && (
            <button className="btn" style={{ marginTop: 18 }} onClick={() => push(flow.route)}>
              {flow.label}
            </button>
          )}
        </>
      )}

      {GROUPS.map((g) => {
        const items = visible.filter(g.match)
        if (!items.length) return null
        return (
          <div key={g.key}>
            <div className="sec">{g.icon}{g.title}</div>
            <SortableList items={items} onReorder={(i) => reorder(g, i)} render={row} handle={editing} />
          </div>
        )
      })}

      {!state.habits.length && !editing ? (
        <div className="empty-state">
          <b>Your routine starts here</b>
          <p className="note">Add the habits you want to build or quit. Link one to Transmutation, Stillness, Faith or Gym and every tick grows that section in Journey.</p>
        </div>
      ) : (
        !visible.length && !editing && <div className="empty">No habits scheduled{day === 'today' ? ' today' : ''}.</div>
      )}
      <button className="add-row" onClick={() => push({ name: 'habitEdit' })}>+ Add habit</button>
      {visible.length > 1 && <p className="hint">{editing ? 'Drag ⋮⋮ to reorder' : 'Press and hold a habit, then drag to reorder'}</p>}

    </Screen>
  )
}
