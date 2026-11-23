import { addDays, todayKey, weekStart } from '../dates'
import { isChecked, isScheduled } from '../domain/streaks'
import { DayStats } from './DayStats'
import { useStore } from '../store'
import { Back, useNav } from '../nav'

export function HabitDetail({ id }: { id: string }) {
  const { state } = useStore()
  const { push } = useNav()
  const habit = state.habits.find((h) => h.id === id)
  if (!habit) return <div className="screen"><Back /></div>

  const today = todayKey()
  const quit = habit.kind === 'quit'
  const start = addDays(weekStart(today), -12 * 7)
  const cells = Array.from({ length: 91 }, (_, i) => {
    const key = addDays(start, i)
    if (key > today) return 'none'
    if (key < habit.createdAt || !isScheduled(habit, key)) return 'off'
    if (isChecked(state.checks, habit.id, key)) return 'done' + (key === today ? ' today' : '')
    return key === today ? 'today' : 'miss'
  })
  const scheduled = cells.filter((c) => c !== 'none' && c !== 'off' && c !== 'today').length
  const done = cells.filter((c) => c.startsWith('done')).length

  return (
    <div className="screen">
      <div className="topbar">
        <Back label="Today" />
        <button className="link" onClick={() => push({ name: 'habitEdit', id })}>Edit</button>
      </div>
      <div className="date" style={{ marginTop: 18 }}>{quit ? 'Quit' : 'Build'}</div>
      <h1>{habit.name}</h1>

      <DayStats habit={habit} word={quit ? 'clean day' : 'day'} />

      <div className="sec">Last 13 weeks · {scheduled ? Math.round((done / scheduled) * 100) : 0}% done</div>
      <div className={'grid' + (quit ? ' quit' : '')}>
        {cells.map((c, i) => <i key={i} className={c} />)}
      </div>
      <div className="legend">
        <span style={{ ['--c' as string]: quit ? 'var(--ember)' : 'var(--gold)' }}>Done</span>
        <span style={{ ['--c' as string]: '#26262a' }}>Missed</span>
        <span style={{ ['--c' as string]: '#18181b' }}>Not scheduled</span>
      </div>
    </div>
  )
}
