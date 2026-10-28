import { useEffect, useState } from 'react'
import { NavCtx, type Route } from './nav'
import { useStore } from './store'
import { Today } from './screens/Today'
import { HabitDetail } from './screens/HabitDetail'
import { HabitEditor } from './screens/HabitEditor'
import { Settings } from './screens/Settings'
import { Gym } from './screens/Gym'
import { DayEditor } from './screens/DayEditor'
import { Workout } from './screens/Workout'
import { ExerciseProgress } from './screens/ExerciseProgress'

type Tab = 'today' | 'gym'

function screenFor(r: Route) {
  switch (r.name) {
    case 'today': return <Today />
    case 'habit': return <HabitDetail id={r.id} />
    case 'habitEdit': return <HabitEditor id={r.id} />
    case 'settings': return <Settings />
    case 'gym': return <Gym />
    case 'dayEdit': return <DayEditor id={r.id} />
    case 'exercise': return <ExerciseProgress id={r.id} />
    case 'workout': return <Workout />
  }
}

export function App() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>(state.active ? 'gym' : 'today')
  const [stacks, setStacks] = useState<Record<Tab, Route[]>>({
    today: [{ name: 'today' }],
    gym: state.active ? [{ name: 'gym' }, { name: 'workout' }] : [{ name: 'gym' }],
  })
  const stack = stacks[tab]
  const route = stack[stack.length - 1]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route, tab])

  const nav = {
    push: (r: Route) => setStacks((s) => ({ ...s, [tab]: [...s[tab], r] })),
    pop: () => setStacks((s) => ({ ...s, [tab]: s[tab].length > 1 ? s[tab].slice(0, -1) : s[tab] })),
    reset: () => setStacks((s) => ({ ...s, [tab]: s[tab].slice(0, 1) })),
  }

  const selectTab = (t: Tab) => {
    if (t === tab) nav.reset()
    else setTab(t)
  }

  return (
    <NavCtx.Provider value={nav}>
      <div key={tab + stack.length}>{screenFor(route)}</div>
      {route.name !== 'workout' && (
        <nav className="tabbar">
          <button className={tab === 'today' ? 'on' : ''} onClick={() => selectTab('today')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8.5 12.5l2.5 2.5 5-6" />
            </svg>
            Today
          </button>
          <button className={tab === 'gym' ? 'on' : ''} onClick={() => selectTab('gym')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
            </svg>
            Gym
          </button>
        </nav>
      )}
    </NavCtx.Provider>
  )
}
