import { useEffect, useState, type ReactNode } from 'react'
import { FULLSCREEN, NavCtx, type Route, type Tab } from './nav'
import { useStore } from './store'
import { Screen } from './ui'
import { Today } from './screens/Today'
import { HabitDetail } from './screens/HabitDetail'
import { HabitEditor } from './screens/HabitEditor'
import { Settings } from './screens/Settings'
import { Gym } from './screens/Gym'
import { DayEditor } from './screens/DayEditor'
import { Workout } from './screens/Workout'
import { ExerciseProgress } from './screens/ExerciseProgress'
import { Transmutation } from './screens/Transmutation'
import { StageDetail } from './screens/StageDetail'
import { Urge } from './screens/Urge'
import { Stillness } from './screens/Stillness'
import { Sit } from './screens/Sit'
import { Breath } from './screens/Breath'
import { Visualise } from './screens/Visualise'
import { Faith } from './screens/Faith'
import { Plans } from './screens/Plans'
import { Reader } from './screens/Reader'
import { Work } from './screens/Work'

function Soon({ title }: { title: string }) {
  return (
    <Screen>
      <div className="label" style={{ marginTop: 8 }}>{title}</div>
      <h1>Coming in this build</h1>
    </Screen>
  )
}

function screenFor(r: Route): ReactNode {
  switch (r.name) {
    case 'today': return <Today />
    case 'habit': return <HabitDetail id={r.id} />
    case 'habitEdit': return <HabitEditor id={r.id} />
    case 'gym': return <Gym />
    case 'dayEdit': return <DayEditor id={r.id} />
    case 'exercise': return <ExerciseProgress id={r.id} />
    case 'workout': return <Workout />
    case 'you': return <Settings />
    case 'transmutation': return <Transmutation />
    case 'stage': return <StageDetail index={r.index} />
    case 'urge': return <Urge />
    case 'stillness': return <Stillness />
    case 'sit': return <Sit />
    case 'breath': return <Breath id={r.id} />
    case 'visualise': return <Visualise id={r.id} />
    case 'faith': return <Faith />
    case 'plans': return <Plans />
    case 'work': return <Work startFocus={r.startFocus} />
    case 'reader': return <Reader chapter={r.ref} planDay={r.planDay} />
    default: return <Soon title={r.name} />
  }
}

const ROOT: Record<Tab, Route> = {
  today: { name: 'today' },
  journey: { name: 'journey' },
  learn: { name: 'learn' },
  you: { name: 'you' },
}

const ICONS: Record<Tab, ReactNode> = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.8-5.2" />
    </svg>
  ),
  journey: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21c3-2.5-1-5 2-8s4-1.5 6-4.5S13 3 17 3" />
      <circle cx="6" cy="21" r="0.6" fill="currentColor" />
      <circle cx="17" cy="3" r="1.6" />
    </svg>
  ),
  learn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z" />
      <path d="M12 6.5v13" />
    </svg>
  ),
  you: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" />
    </svg>
  ),
}

const LABELS: Record<Tab, string> = { today: 'Today', journey: 'Journey', learn: 'Learn', you: 'You' }

export function App() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [stacks, setStacks] = useState<Record<Tab, Route[]>>(() => ({
    today: state.active ? [ROOT.today, { name: 'gym' }, { name: 'workout' }] : [ROOT.today],
    journey: [ROOT.journey],
    learn: [ROOT.learn],
    you: [ROOT.you],
  }))
  const stack = stacks[tab]
  const route = stack[stack.length - 1]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route, tab])

  const nav = {
    push: (r: Route) => setStacks((s) => ({ ...s, [tab]: [...s[tab], r] })),
    pop: () => setStacks((s) => ({ ...s, [tab]: s[tab].length > 1 ? s[tab].slice(0, -1) : s[tab] })),
    reset: () => setStacks((s) => ({ ...s, [tab]: s[tab].slice(0, 1) })),
    switchTab: (t: Tab) => setTab(t),
  }

  const selectTab = (t: Tab) => {
    if (t === tab) nav.reset()
    else setTab(t)
  }

  return (
    <NavCtx.Provider value={nav}>
      <div key={tab + stack.length} className={FULLSCREEN.has(route.name) ? '' : 'has-tabs'}>{screenFor(route)}</div>
      {!FULLSCREEN.has(route.name) && (
        <nav className="tabbar">
          {(Object.keys(LABELS) as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => selectTab(t)}>
              {ICONS[t]}
              {LABELS[t]}
            </button>
          ))}
        </nav>
      )}
    </NavCtx.Provider>
  )
}
