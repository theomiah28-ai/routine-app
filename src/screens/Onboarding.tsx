import { useState } from 'react'
import { APP_NAME } from '../config'
import { GOALS, suggestFor, type Goal } from '../content/suggestions'
import { FIELDS } from '../domain/work'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Check, Screen, Stepper } from '../ui'
import type { Habit, WorkInputs } from '../types'

const WORK_LABEL = { videos: 'Videos posted', products: 'Products tested', hoursWorked: 'Hours worked', deepMinutes: 'Deep work (min)' } as const

export function Onboarding() {
  const { state, update } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(state.settings.name)
  const [goals, setGoals] = useState<Goal[]>([])
  const [faith, setFaith] = useState<boolean | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [why, setWhy] = useState<string | null>(null)
  const [targets, setTargets] = useState<WorkInputs>(state.work.targets)
  const suggestions = suggestFor(goals, faith !== false)
  const STEPS = 5

  const finish = () =>
    update((s) => {
      const createdAt = todayKey()
      const chosen: Habit[] = suggestions
        .filter((x) => picked.has(x.name))
        .map((x) => ({ id: uid(), name: x.name, kind: x.kind, timeOfDay: x.timeOfDay, days: x.days ?? [], createdAt, link: x.link, minutes: x.minutes, insightId: x.insightId }))
      const own: Habit[] = custom.map((n) => ({ id: uid(), name: n, kind: 'build', timeOfDay: 'anytime', days: [], createdAt }))
      s.habits = [...chosen.filter((h) => h.kind === 'build'), ...own, ...chosen.filter((h) => h.kind === 'quit')]
      s.settings.name = name.trim()
      s.settings.goals = goals
      s.settings.faith = faith !== false
      s.settings.onboarded = true
      s.work.targets = targets
    })

  const toggleGoal = (g: Goal) => setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))
  const toggle = (n: string) =>
    setPicked((p) => {
      const next = new Set(p)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  const addCustom = () => {
    const n = draft.trim()
    if (n && !custom.includes(n)) setCustom([...custom, n])
    setDraft('')
  }
  // Only count picks still on the list (changing goals can drop some)
  const count = suggestions.filter((x) => picked.has(x.name)).length + custom.length

  const canNext = [!!name.trim(), true, faith !== null, true, true][step]
  const label = step === 3 ? (count ? `Continue · ${count} added` : 'Skip for now') : step === STEPS - 1 ? 'Start' : 'Continue'

  return (
    <Screen bg="gold" full>
      <div className="flow-dots" style={{ justifyContent: 'center', marginTop: 6 }}>{Array.from({ length: STEPS }, (_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      {step > 0 && <button className="link muted" style={{ marginTop: 10 }} onClick={() => setStep(step - 1)}>‹ Back</button>}

      {step === 0 && (
        <div style={{ marginTop: 70 }}>
          <div className="label gold">Foundry</div>
          <h1 style={{ fontSize: 38 }}>Welcome to {APP_NAME.replace('Foundry ', '')}.</h1>
          <p className="prose-p">Discipline, tracked. Your routine, your training, your work and your mind in one place.</p>
          <div className="field" style={{ marginTop: 34 }}>
            <label>What should we call you?</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoFocus />
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ marginTop: 22 }}>
          <div className="label gold">Your goals</div>
          <h1>What do you want to achieve?</h1>
          <p className="note">Pick as many as you like. We'll suggest habits that get you there faster.</p>
          <div style={{ marginTop: 12 }}>
            {GOALS.filter((g) => g.id !== 'god' || faith !== false).map((g) => (
              <div key={g.id} className={'sug' + (goals.includes(g.id) ? ' on' : '')} onClick={() => toggleGoal(g.id)}>
                <Check on={goals.includes(g.id)} />
                <div style={{ flex: 1 }}><b>{g.label}</b><small>{g.blurb}</small></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 22 }}>
          <div className="label gold">Faith</div>
          <h1>Is faith part of your life?</h1>
          <p className="note">Faith is a section for walking with Christ: a daily verse, reading plans and prayer. You can turn it on or off any time in You.</p>
          <div style={{ marginTop: 14 }}>
            <div className={'sug' + (faith === true ? ' on' : '')} onClick={() => setFaith(true)}>
              <Check on={faith === true} />
              <div style={{ flex: 1 }}><b>Yes, I'm Christian</b><small>Or I want to grow closer to God</small></div>
            </div>
            <div className={'sug' + (faith === false ? ' on' : '')} onClick={() => { setFaith(false); setGoals((g) => g.filter((x) => x !== 'god')) }}>
              <Check on={faith === false} />
              <div style={{ flex: 1 }}><b>Not for me</b><small>Faith stays hidden</small></div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ marginTop: 22 }}>
          <div className="label gold">Build your routine</div>
          <h1>Add your habits</h1>
          <p className="note">{suggestions.length ? 'Suggested for your goals. Add the ones you want, or write your own.' : 'Write your own, or skip and add them later from Today.'}</p>
          <div style={{ marginTop: 12 }}>
            {suggestions.map((x) => (
              <div key={x.name}>
                <div className={'sug' + (picked.has(x.name) ? ' on' : '')} onClick={() => toggle(x.name)}>
                  <Check on={picked.has(x.name)} />
                  <div style={{ flex: 1 }}>
                    <b>{x.name}</b>
                    <small>{x.link ? `Grows ${x.link === 'gym' ? 'the statue' : x.link === 'stillness' ? 'the Eye' : x.link === 'faith' ? 'Faith' : 'the Ascent'} in Journey` : x.kind === 'quit' ? 'Quit' : x.timeOfDay === 'anytime' ? 'Anytime' : x.timeOfDay === 'morning' ? 'Morning' : 'Evening'}</small>
                  </div>
                  <button className="link muted" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); setWhy(why === x.name ? null : x.name) }}>Why?</button>
                </div>
                {why === x.name && <p className="note sug-why">{x.why}</p>}
              </div>
            ))}
            {custom.map((n) => (
              <div key={n} className="sug on" onClick={() => setCustom(custom.filter((c) => c !== n))}>
                <Check on />
                <div style={{ flex: 1 }}><b>{n}</b><small>Your own</small></div>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom()} placeholder="Add your own habit" />
            <button className="link gold" onClick={addCustom} style={{ opacity: draft.trim() ? 1 : 0.4 }}>Add</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ marginTop: 22 }}>
          <div className="label gold">Work</div>
          <h1>Your daily inputs</h1>
          <p className="note">The numbers that move your business. A day counts when you hit them all. Set any to 0 to ignore it.</p>
          <div style={{ marginTop: 14 }}>
            {FIELDS.map((f) => (
              <div key={f} className="input-row">
                <span style={{ fontSize: 15.5 }}>{WORK_LABEL[f]}</span>
                <Stepper value={targets[f]} step={f === 'hoursWorked' ? 0.5 : f === 'deepMinutes' ? 15 : 1} onChange={(v) => setTargets({ ...targets, [f]: v })} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dock">
        <button className="btn" disabled={!canNext} onClick={() => (step === STEPS - 1 ? finish() : setStep(step + 1))}>{label}</button>
      </div>
    </Screen>
  )
}
