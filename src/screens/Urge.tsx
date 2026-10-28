import { useEffect, useRef, useState } from 'react'
import { ASCENT } from '../content/ascent'
import { breathAt, orbScale, type BreathPattern } from '../domain/breath'
import { elapsed, stageIndex } from '../domain/transmutation'
import { useStore } from '../store'
import { useNav } from '../nav'
import { BreathOrb } from '../symbols/BreathOrb'
import { Screen } from '../ui'

const BOX_60: BreathPattern = {
  rounds: 4,
  phases: [
    { kind: 'in', seconds: 4, label: 'Breathe in' },
    { kind: 'hold', seconds: 4, label: 'Hold' },
    { kind: 'out', seconds: 4, label: 'Breathe out' },
    { kind: 'rest', seconds: 4, label: 'Hold' },
  ],
}

export function useBreathClock(running: boolean) {
  const [ms, setMs] = useState(0)
  const start = useRef<number | null>(null)
  useEffect(() => {
    if (!running) return
    start.current = performance.now() - ms
    let raf = 0
    const tick = () => {
      setMs(performance.now() - start.current!)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])
  return ms
}

export function Urge() {
  const { state } = useStore()
  const { pop, reset, push } = useNav()
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const ms = useBreathClock(step === 0)
  const b = breathAt(BOX_60, ms)
  const days = elapsed(state.transmutation.start, Date.now()).days
  const stage = ASCENT[stageIndex(days)]
  const next = ASCENT[stageIndex(days) + 1]

  useEffect(() => {
    if (step === 0 && b.done) setStep(1)
  }, [b.done, step])

  const go = (r: Parameters<typeof push>[0]) => {
    reset()
    push(r)
  }

  return (
    <Screen bg={step === 0 ? 'night' : 'gold'} full>
      <div className="topbar">
        <button className="link muted" onClick={pop}>✕</button>
        <div className="flow-dots">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
        <span style={{ width: 16 }} />
      </div>

      {step === 0 && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div className="label gold">Breathe first</div>
          <h2 className="title" style={{ marginTop: 8 }}>Let the wave pass</h2>
          <div style={{ marginTop: 34 }}>
            <BreathOrb scale={orbScale(BOX_60.phases[b.phase].kind, b.progress)}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{BOX_60.phases[b.phase].label}</div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{b.remaining}</div>
            </BreathOrb>
          </div>
          <div className="sub" style={{ marginTop: 26 }}>Round {b.round} of {BOX_60.rounds}</div>
          <button className="link muted" style={{ marginTop: 24 }} onClick={() => setStep(1)}>Skip</button>
        </div>
      )}

      {step === 1 && (
        <div style={{ marginTop: 40 }}>
          <div className="label gold">What's at stake</div>
          <h1 style={{ marginTop: 10 }}>{days} days. Stage {stageIndex(days) + 1}: {stage.name}.</h1>
          <p className="prose-p">This energy is yours. Spend it on something you'll be proud of tomorrow.</p>
          {next && (
            <div className="gain-cost" style={{ gridTemplateColumns: '1fr' }}>
              <div><b className="acc">Day {next.day} · {next.name} brings</b>{next.gains}</div>
              <div><b className="quit-c">Giving in costs</b>{stage.costs}</div>
            </div>
          )}
          <div className="dock"><button className="btn" onClick={() => setStep(2)}>Channel it</button></div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 40 }}>
          <div className="label gold">Transmute it</div>
          <h1 style={{ marginTop: 10 }}>Put it into something</h1>
          <div style={{ marginTop: 22 }}>
            <button className="card" onClick={() => go({ name: 'work', startFocus: true })}><span className="grow">Start deep work<small>A focus session on your business</small></span><span className="chev">›</span></button>
            <button className="card" onClick={() => go({ name: 'gym' })}><span className="grow">Train<small>Start your next workout</small></span><span className="chev">›</span></button>
            <button className="card" onClick={() => go({ name: 'sit' })}><span className="grow">Sit in stillness<small>Watch the urge without acting on it</small></span><span className="chev">›</span></button>
          </div>
          <button className="btn ghost" style={{ marginTop: 14 }} onClick={pop}>I'm good now</button>
        </div>
      )}
    </Screen>
  )
}
