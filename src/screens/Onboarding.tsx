import { useState } from 'react'
import { APP_NAME } from '../config'
import { SUGGESTIONS } from '../content/suggestions'
import { FIELDS } from '../domain/work'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { Check, Screen, Stepper } from '../ui'
import type { WorkInputs } from '../types'

const WORK_LABEL = { videos: 'Videos posted', products: 'Products tested', hoursWorked: 'Hours worked', deepMinutes: 'Deep work (min)' } as const

export function Onboarding() {
  const { state, update } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(state.settings.name)
  const [picked, setPicked] = useState(() => new Set(SUGGESTIONS.filter((s) => s.pick).map((s) => s.name)))
  const [why, setWhy] = useState<string | null>(null)
  const [targets, setTargets] = useState<WorkInputs>(state.work.targets)

  const finish = () =>
    update((s) => {
      const createdAt = todayKey()
      // Keep the gym-linked habit from the seed; everything else comes from what they picked
      const gym = s.habits.filter((h) => h.link === 'gym')
      const chosen = SUGGESTIONS.filter((x) => picked.has(x.name)).map((x) => ({
        id: uid(),
        name: x.name,
        kind: x.kind,
        timeOfDay: x.timeOfDay,
        days: [],
        createdAt,
        insightId: x.insightId,
      }))
      s.habits = [...chosen.filter((h) => h.kind === 'build'), ...gym, ...chosen.filter((h) => h.kind === 'quit')]
      s.settings.name = name.trim()
      s.settings.onboarded = true
      s.work.targets = targets
    })

  const toggle = (n: string) => setPicked((p) => {
    const next = new Set(p)
    if (next.has(n)) next.delete(n)
    else next.add(n)
    return next
  })

  return (
    <Screen bg="gold" full>
      <div className="flow-dots" style={{ justifyContent: 'center', marginTop: 6 }}>{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>

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
        <div style={{ marginTop: 28 }}>
          <div className="label gold">Build your routine</div>
          <h1>Pick your habits</h1>
          <p className="note">Start small. You can add, change or remove any of these later.</p>
          <div style={{ marginTop: 12 }}>
            {SUGGESTIONS.map((x) => (
              <div key={x.name}>
                <div className={'sug' + (picked.has(x.name) ? ' on' : '')} onClick={() => toggle(x.name)}>
                  <Check on={picked.has(x.name)} />
                  <div style={{ flex: 1 }}>
                    <b>{x.name}</b>
                    <small>{x.kind === 'quit' ? 'Quit' : x.timeOfDay === 'anytime' ? 'Anytime' : x.timeOfDay === 'morning' ? 'Morning' : 'Evening'}</small>
                  </div>
                  <button className="link muted" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); setWhy(why === x.name ? null : x.name) }}>Why?</button>
                </div>
                {why === x.name && <p className="note sug-why">{x.why}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 28 }}>
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
        {step < 2 ? (
          <button className="btn" disabled={step === 0 && !name.trim()} onClick={() => setStep(step + 1)}>
            {step === 1 ? `Continue · ${picked.size} added` : 'Continue'}
          </button>
        ) : (
          <button className="btn" onClick={finish}>Start</button>
        )}
      </div>
    </Screen>
  )
}
