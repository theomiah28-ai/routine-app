import { useState, type ReactNode } from 'react'
import { sitDoneOn } from '../domain/stillness'
import { completion, dayItems } from '../domain/completion'
import { isChecked, isScheduled } from '../domain/streaks'
import { addDays, todayKey } from '../dates'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Check, Moon, Ring, Screen, Sun } from '../ui'
import type { Habit } from '../types'

interface Step {
  id: string
  skip?: boolean
  render: () => ReactNode
  next?: string
}

export function Flow({ kind }: { kind: 'morning' | 'evening' }) {
  const { state, update } = useStore()
  const { pop, push } = useNav()
  const today = todayKey()
  const [note, setNote] = useState(state.journal[today] ?? '')

  const toggle = (id: string) =>
    update((s) => {
      const list = s.checks[today] ?? []
      s.checks[today] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    })
  const habitRow = (h: Habit) => {
    const done = isChecked(state.checks, h.id, today)
    return (
      <div key={h.id} className={'item' + (done ? ' done' : '')}>
        <Check on={done} onClick={() => toggle(h.id)} />
        <span className="name">{h.name}</span>
      </div>
    )
  }
  const scheduled = (key: string, t: Habit['timeOfDay']) => state.habits.filter((h) => h.kind === 'build' && h.timeOfDay === t && isScheduled(h, key) && key >= h.createdAt)

  const c = completion(state, today)
  const left = dayItems(state, today).filter((i) => !i.done)

  const morning: Step[] = [
    {
      id: 'sit',
      skip: sitDoneOn(state.stillness, today),
      render: () => (
        <>
          <div className="label gold">Step one</div>
          <h1>The Morning Sit</h1>
          <p className="prose-p">{state.stillness.sitMinutes} minutes of pure awareness before anything else. No phone, no plan. Just watch.</p>
        </>
      ),
    },
    {
      id: 'habits',
      skip: scheduled(today, 'morning').length === 0,
      render: () => (
        <>
          <div className="label gold" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Sun />Morning routine</div>
          <h1>Tick them off</h1>
          <div style={{ marginTop: 10 }}>{scheduled(today, 'morning').map(habitRow)}</div>
        </>
      ),
    },
    {
      id: 'go',
      render: () => (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Ring pct={c.pct} size={150} stroke={10}><b style={{ fontSize: 30 }}>{Math.round(c.pct * 100)}%</b></Ring>
          <h1 style={{ marginTop: 26 }}>Go build.</h1>
          <p className="note">The rest of the day is yours to win.</p>
        </div>
      ),
    },
  ]

  const evening: Step[] = [
    {
      id: 'left',
      skip: left.length === 0,
      render: () => (
        <>
          <div className="label gold" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Moon />Before bed</div>
          <h1>Still open today</h1>
          <div style={{ marginTop: 10 }}>
            {left.map((i) => {
              const h = state.habits.find((x) => `habit:${x.id}` === i.id)
              return h ? habitRow(h) : null
            })}
          </div>
        </>
      ),
    },
    {
      id: 'gratitude',
      render: () => (
        <>
          <div className="label gold">Evening gratitude</div>
          <h1>What are you grateful for today?</h1>
          <textarea className="input" style={{ marginTop: 16 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Today I'm grateful for…" />
        </>
      ),
      next: 'Save',
    },
    {
      id: 'ring',
      render: () => (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <Ring pct={c.pct} size={170} stroke={11}><b style={{ fontSize: 34 }}>{Math.round(c.pct * 100)}%</b></Ring>
          <h1 style={{ marginTop: 24 }}>{c.pct >= 1 ? 'Perfect day.' : c.pct >= 0.7 ? 'Strong day.' : 'Tomorrow, again.'}</h1>
          <p className="note">{c.done} of {c.total} done today.</p>
        </div>
      ),
    },
    {
      id: 'tomorrow',
      render: () => {
        const t = scheduled(addDays(today, 1), 'morning')
        return (
          <>
            <div className="label gold">Tomorrow</div>
            <h1>First thing</h1>
            <div className="item"><Sun size={18} /><span className="name">Morning Sit · {state.stillness.sitMinutes} min</span></div>
            {t.map((h) => <div key={h.id} className="item"><span className="chk" /><span className="name">{h.name}</span></div>)}
          </>
        )
      },
    },
    {
      id: 'sleep',
      render: () => (
        <div style={{ textAlign: 'center', marginTop: 120 }}>
          <div style={{ color: 'var(--gold)', display: 'flex', justifyContent: 'center' }}><Moon size={56} /></div>
          <h1 style={{ marginTop: 22 }}>Phone down. Sleep.</h1>
          <p className="note">Rest is part of the work.</p>
        </div>
      ),
    },
  ]

  // Decide which steps apply when the flow opens, so ticking things off doesn't shift the steps under you
  const all = kind === 'morning' ? morning : evening
  const [skipped] = useState(() => new Set(all.filter((s) => s.skip).map((s) => s.id)))
  const steps = all.filter((s) => !skipped.has(s.id))
  const [i, setI] = useState(0)
  const step = steps[Math.min(i, steps.length - 1)]
  const last = i >= steps.length - 1

  const advance = () => {
    if (step.id === 'gratitude')
      update((s) => {
        if (note.trim()) s.journal[today] = note.trim()
        else delete s.journal[today]
      })
    if (last) pop()
    else setI(i + 1)
  }

  return (
    <Screen bg={kind === 'evening' ? 'night' : 'gold'} full>
      <div className="topbar">
        <button className="link muted" onClick={pop}>✕</button>
        <div className="flow-dots">{steps.map((_, n) => <i key={n} className={n <= i ? 'on' : ''} />)}</div>
        <button className="link muted" onClick={() => (last ? pop() : setI(i + 1))} style={{ visibility: last ? 'hidden' : 'visible' }}>Skip</button>
      </div>
      <div key={step.id} style={{ marginTop: 26, animation: 'in 0.3s var(--ease)' }}>{step.render()}</div>
      <div className="dock">
        {step.id === 'sit' ? (
          <button className="btn" onClick={() => push({ name: 'sit' })}>Begin the sit</button>
        ) : (
          <button className="btn" onClick={advance}>{last ? (kind === 'morning' ? 'Start the day' : 'Goodnight') : step.next ?? 'Next'}</button>
        )}
      </div>
    </Screen>
  )
}
