import { useState } from 'react'
import { MOON_NAMES, moonState, onTimeOn, sleepHabits, sleepLike, sleepName, sleepRole, sleepScore, sleepStreak, timeIn } from '../domain/sleep'
import { isChecked } from '../domain/streaks'
import { addDays, todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back } from '../nav'
import { Moon } from '../symbols/Moon'
import { Check, Screen } from '../ui'
import type { Habit } from '../types'

const LINE = {
  full: 'Rested. Up on time, asleep on time. Keep the moon full.',
  waning: 'A few late nights are showing. Hit both times and it fills back up.',
  half: 'Your sleep is slipping. Every on-time night brings the light back.',
  crescent: 'Running on empty. Pick tonight’s bedtime and keep it.',
}

const ROLES = [
  { role: 'wake' as const, label: 'Wake-up time', timeOfDay: 'morning' as const, preset: '06:30' },
  { role: 'bed' as const, label: 'Bedtime', timeOfDay: 'evening' as const, preset: '23:00' },
]

export function Sleep() {
  const { state, update } = useStore()
  const today = todayKey()
  const habits = sleepHabits(state)
  const score = sleepScore(state, today)
  const st = moonState(score ?? 1)
  const streak = sleepStreak(state, today)
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const adopt = sleepLike(state)
  const [times, setTimes] = useState<Record<string, string>>({ wake: '06:30', bed: '23:00' })

  const toggle = (id: string) =>
    update((s) => {
      const list = s.checks[today] ?? []
      s.checks[today] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })

  const add = (role: 'wake' | 'bed', timeOfDay: Habit['timeOfDay'], time: string) =>
    update((s) => void s.habits.push({ id: uid(), name: sleepName(role, time), kind: 'build', days: [], createdAt: today, timeOfDay, link: 'sleep', time }))

  // Link them together so a night is judged on both from the start
  const linkAll = () =>
    update((s) => {
      for (const h of s.habits) {
        if (!adopt.some((a) => a.id === h.id)) continue
        h.link = 'sleep'
        h.time = timeIn(h.name)
      }
    })

  // Changing the time renames habits that follow the "Wake up by …" / "Asleep by …" pattern
  const setTime = (id: string, time: string) =>
    update((s) => {
      const h = s.habits.find((x) => x.id === id)
      if (!h || !time) return
      h.time = time
      if (/^(Wake up|Asleep) by /.test(h.name)) h.name = sleepName(sleepRole(h), time)
    })

  // Offer a new habit only for a role that has neither a sleep habit nor one waiting to be linked
  const missing = ROLES.filter((r) => ![...habits, ...adopt].some((h) => sleepRole(h) === r.role))

  return (
    <Screen bg="night">
      <div className="topbar"><Back /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Sleep · your moon</div>
      <div className="big-num" style={{ marginTop: 6 }}>
        {streak}
        <small>{streak === 1 ? 'night on time' : 'nights on time'}</small>
      </div>

      <div style={{ margin: '24px 0 8px' }}><Moon state={st} width={210} /></div>
      <div style={{ textAlign: 'center' }}>
        {habits.length > 0 && <span className={'brain-chip ' + (st === 'full' ? 'sharp' : st === 'crescent' ? 'rotting' : 'foggy')}>Moon · {MOON_NAMES[st]}</span>}
        <p className="note" style={{ marginTop: 8 }}>{habits.length ? LINE[st] : 'Set your wake-up and bedtime. Hit both and the moon stays full.'}</p>
      </div>

      {habits.length > 0 && (
        <>
          <div className="sec">Today</div>
          {habits.map((h) => {
            const done = isChecked(state.checks, h.id, today)
            return (
              <div key={h.id} className={'item' + (done ? ' done' : '')}>
                <Check on={done} onClick={() => toggle(h.id)} />
                <span className="name">{h.name}</span>
                <input className="time-in" type="time" value={h.time ?? timeIn(h.name) ?? ''} onChange={(e) => setTime(h.id, e.target.value)} aria-label={`Time for ${h.name}`} />
              </div>
            )
          })}

          <div className="sec">Last 14 days</div>
          <div className="day-dots sleep">
            {days.map((k) => {
              const c = onTimeOn(state, k)
              return <i key={k} className={(c ? 'clean' : c === false && k < today ? 'miss' : '') + (k === today ? ' today' : '')} />
            })}
          </div>
          <p className="note" style={{ marginTop: 10 }}>A night counts when you tick both. Recent nights count most.</p>
        </>
      )}

      {adopt.length > 0 && (
        <>
          <div className="sec">Already in your routine</div>
          {adopt.map((h) => (
            <div key={h.id} className="item"><span className="name">{h.name}</span></div>
          ))}
          <button className="btn" style={{ marginTop: 14 }} onClick={linkAll}>Link to Sleep</button>
          <p className="note" style={{ marginTop: 8 }}>Their ticks so far count straight away.</p>
        </>
      )}

      {missing.length > 0 && (
        <>
          <div className="sec">Set your times</div>
          {missing.map((r) => (
            <div key={r.role} className="item">
              <span className="name">{r.label}</span>
              <input className="time-in" type="time" value={times[r.role]} onChange={(e) => setTimes({ ...times, [r.role]: e.target.value })} aria-label={r.label} />
              <button className="link gold" style={{ marginLeft: 10 }} disabled={!times[r.role]} onClick={() => add(r.role, r.timeOfDay, times[r.role])}>Add</button>
            </div>
          ))}
          <p className="note" style={{ marginTop: 10 }}>They go onto Today. Tick each one when you hit it.</p>
        </>
      )}
    </Screen>
  )
}
