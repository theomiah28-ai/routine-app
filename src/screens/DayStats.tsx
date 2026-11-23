import { habitDays } from '../domain/progression'
import { parseKey, todayKey } from '../dates'
import { useStore } from '../store'
import type { Habit } from '../types'

const short = (key: string) => parseKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

/** How long you've gone: current run, best run, all-time days and when this run began. */
export function DayStats({ habit, word = 'day', noCurrent }: { habit: Habit; word?: string; noCurrent?: boolean }) {
  const { state } = useStore()
  const d = habitDays(state, habit, todayKey())
  return (
    <>
      <div className="stats" style={{ marginTop: 14 }}>
        {!noCurrent && <div className="stat"><b className="acc">{d.current}</b><span>{word}s in a row</span></div>}
        <div className="stat"><b>{d.best}</b><span>best run</span></div>
        <div className="stat"><b>{d.total}</b><span>{word}s in total</span></div>
      </div>
      <div className="sub" style={{ fontSize: 12.5, marginTop: 8 }}>
        {d.since ? `Going since ${short(d.since)}. Started tracking ${short(habit.createdAt)}.` : `Started tracking ${short(habit.createdAt)}.`}
      </div>
    </>
  )
}

/** One line per habit, for sections that hold several (Health). */
export function DayRow({ habit, word = 'day' }: { habit: Habit; word?: string }) {
  const { state } = useStore()
  const d = habitDays(state, habit, todayKey())
  return (
    <div className="day-row">
      <div>
        <b>{habit.name}</b>
        <small>{d.since ? `Since ${short(d.since)} · best ${d.best} · ${d.total} in total` : `Best ${d.best} · ${d.total} in total`}</small>
      </div>
      <span className="day-count">{d.current}<small>{d.current === 1 ? word : `${word}s`}</small></span>
    </div>
  )
}
