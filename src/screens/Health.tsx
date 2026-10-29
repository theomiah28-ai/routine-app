import { LUNG_NAMES, cleanOn, healthHabits, healthStreak, lungScore, lungState } from '../domain/health'
import { isChecked } from '../domain/streaks'
import { addDays, todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Lungs } from '../symbols/Lungs'
import { Check, Screen } from '../ui'

const LINE = {
  healthy: 'Breathing easy. Your lungs are healing every clean day.',
  strained: 'A few slips are showing. Stay clean and they clear.',
  damaged: 'The damage is building. Every clean day starts to reverse it.',
  blackened: 'Your lungs are paying for it. Start a clean run today.',
}

export function Health() {
  const { state, update } = useStore()
  const { push } = useNav()
  const today = todayKey()
  const habits = healthHabits(state)
  const score = lungScore(state, today)
  const st = lungState(score ?? 1)
  const streak = healthStreak(state, today)
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))

  const toggle = (id: string) =>
    update((s) => {
      const list = s.checks[today] ?? []
      s.checks[today] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })

  const addHabit = (name: string) =>
    update((s) => void s.habits.push({ id: uid(), name, kind: 'quit', days: [], createdAt: today, timeOfDay: 'anytime', link: 'health' }))

  return (
    <Screen bg="gold">
      <div className="topbar"><Back /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Health · your lungs</div>
      <div className="big-num" style={{ marginTop: 6 }}>
        {streak}
        <small>{streak === 1 ? 'clean day' : 'clean days'}</small>
      </div>

      <div style={{ margin: '24px 0 8px' }}><Lungs state={st} width={230} /></div>
      <div style={{ textAlign: 'center' }}>
        <span className={'brain-chip ' + (st === 'healthy' ? 'sharp' : st === 'blackened' ? 'rotting' : 'foggy')}>Lungs · {LUNG_NAMES[st]}</span>
        <p className="note" style={{ marginTop: 8 }}>{habits.length ? LINE[st] : 'Link a quit habit to Health and every clean day shows here.'}</p>
      </div>

      {habits.length > 0 ? (
        <>
          <div className="sec">Today</div>
          {habits.map((h) => {
            const done = isChecked(state.checks, h.id, today)
            return (
              <div key={h.id} className={'item quit' + (done ? ' done' : '')}>
                <Check on={done} onClick={() => toggle(h.id)} />
                <span className="name">{h.name}</span>
              </div>
            )
          })}

          <div className="sec">Last 14 days</div>
          <div className="day-dots">
            {days.map((k) => {
              const c = cleanOn(state, k)
              return <i key={k} className={(c ? 'clean' : c === false && k < today ? 'miss' : '') + (k === today ? ' today' : '')} />
            })}
          </div>
          <p className="note" style={{ marginTop: 10 }}>Recent days count most. A clean day heals; a missed one shows straight away.</p>
        </>
      ) : (
        <>
          <div className="sec">Start healing</div>
          {['No vaping', 'No weed', 'No smoking'].map((n) => (
            <button key={n} className="card" onClick={() => addHabit(n)}>
              <span className="grow">{n}<small>Adds to Today, linked to Health</small></span>
              <span className="pill">ADD</span>
            </button>
          ))}
          <button className="add-row" onClick={() => push({ name: 'habitEdit' })}>+ Your own quit habit</button>
        </>
      )}
    </Screen>
  )
}
