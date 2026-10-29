import { useState } from 'react'
import { APP_NAME } from '../config'
import { GOALS, type Goal } from '../content/suggestions'
import { useStore } from '../store'
import { Check, Screen } from '../ui'

/** Name and goals only. The routine itself is built on Today, then "Begin your journey" starts tracking. */
export function Onboarding() {
  const { state, update } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(state.settings.name)
  const [goals, setGoals] = useState<Goal[]>([])

  const finish = () =>
    update((s) => {
      s.settings.name = name.trim()
      s.settings.goals = goals
      s.settings.onboarded = true
    })

  const toggleGoal = (g: Goal) => setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))

  return (
    <Screen bg="gold" full>
      <div className="flow-dots" style={{ justifyContent: 'center', marginTop: 6 }}>{[0, 1].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      {step > 0 && <button className="link muted" style={{ marginTop: 10 }} onClick={() => setStep(step - 1)}>‹ Back</button>}

      {step === 0 && (
        <div style={{ marginTop: 70 }}>
          <div className="label gold">Foundry</div>
          <h1 style={{ fontSize: 38 }}>Welcome to {APP_NAME.replace('Foundry ', '')}.</h1>
          <p className="prose-p">Master your energy, your mind and your body. Every habit you keep grows something you can see.</p>
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
          <p className="note">Pick as many as you like. You'll get habit ideas for them when you build your routine.</p>
          <div style={{ marginTop: 12 }}>
            {GOALS.map((g) => (
              <div key={g.id} className={'sug' + (goals.includes(g.id) ? ' on' : '')} onClick={() => toggleGoal(g.id)}>
                <Check on={goals.includes(g.id)} />
                <div style={{ flex: 1 }}><b>{g.label}</b><small>{g.blurb}</small></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dock">
        <button className="btn" disabled={step === 0 && !name.trim()} onClick={() => (step === 1 ? finish() : setStep(1))}>
          {step === 1 ? 'Build my routine' : 'Continue'}
        </button>
      </div>
    </Screen>
  )
}
