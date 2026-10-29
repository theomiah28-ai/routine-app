import { useEffect, useState, type ReactNode } from 'react'
import { FULLSCREEN, NavCtx, type Route, type Tab } from './nav'
import { useStore } from './store'
import { Screen } from './ui'
import { Today } from './screens/Today'
import { HabitDetail } from './screens/HabitDetail'
import { HabitEditor } from './screens/HabitEditor'
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
import { ScreenTime } from './screens/ScreenTime'
import { Journey } from './screens/Journey'
import { Progress } from './screens/Progress'
import { Learn } from './screens/Learn'
import { Article } from './screens/Article'
import { MilestoneModal } from './screens/MilestoneModal'
import { Flow } from './screens/Flow'
import { You } from './screens/You'
import { Onboarding } from './screens/Onboarding'
import { APP_NAME } from './config'
import { Sheet } from './ui'
import { celebrateOnly, detectMilestones } from './domain/milestones'

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
    case 'you': return <You />
    case 'transmutation': return <Transmutation />
    case 'stage': return <StageDetail index={r.index} />
    case 'urge': return <Urge />
    case 'stillness': return <Stillness />
    case 'sit': return <Sit />
    case 'breath': return <Breath id={r.id} />
    case 'visualise': return <Visualise id={r.id} />
    case 'screentime': return <ScreenTime />
    case 'journey': return <Journey />
    case 'progress': return <Progress />
    case 'learn': return <Learn />
    case 'article': return <Article id={r.id} />
    case 'morning': return <Flow kind="morning" />
    case 'evening': return <Flow kind="evening" />
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
  const { state, update } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [stacks, setStacks] = useState<Record<Tab, Route[]>>(() => ({
    today: state.active
      ? [ROOT.today, { name: 'gym' }, { name: 'workout' }]
      : state.stillness.activeSit
        ? [ROOT.today, { name: 'sit' }]
        : [ROOT.today],
    journey: [ROOT.journey],
    learn: [ROOT.learn],
    you: [ROOT.you],
  }))
  const stack = stacks[tab]
  const route = stack[stack.length - 1]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route, tab])

  // Record new milestones. On the first launch after migrating, earlier achievements go straight to the gallery.
  useEffect(() => {
    if (!detectMilestones(state, Date.now()).length) return
    // Re-detect against the latest state so a repeated run can't add the same milestone twice
    update((s) => {
      const found = detectMilestones(s, Date.now())
      const marked = s.settings.whatsNew ? found.map((m) => ({ ...m, seen: true })) : celebrateOnly(found)
      s.milestones = [...s.milestones, ...marked]
    })
  }, [state, update])

  const celebrate = FULLSCREEN.has(route.name) ? undefined : state.milestones.find((m) => !m.seen && m.section !== 'faith' && m.section !== 'work')

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

  if (!state.settings.onboarded) return <Onboarding />

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
      <Sheet open={!!state.settings.whatsNew} onClose={() => update((s) => void (s.settings.whatsNew = false))}>
        <div className="label gold">What's new</div>
        <h2 className="title" style={{ marginTop: 6 }}>Welcome to {APP_NAME}</h2>
        <p className="note" style={{ margin: '8px 0 12px' }}>Everything you logged is here. Keep ticking your habits on Today: each one now grows a section in Journey.</p>
        <ul className="steps">
          <li><b>No PMO</b> climbs the Ascent, seven stages to 365 days.</li>
          <li><b>Meditate</b> opens the Eye. Fully awake at 365 hours.</li>
          <li><b>Gym</b> carves your statue. Every PB carves deeper.</li>
          <li>Your <b>Screen Time</b> brain is in Journey too. <b>Learn</b> holds the teachings.</li>
        </ul>
        <button className="btn" onClick={() => update((s) => void (s.settings.whatsNew = false))}>Let's go</button>
      </Sheet>
      {!state.settings.whatsNew && celebrate && <MilestoneModal m={celebrate} onClose={() => update((s) => void (s.milestones.find((m) => m.id === celebrate.id)!.seen = true))} />}
    </NavCtx.Provider>
  )
}
