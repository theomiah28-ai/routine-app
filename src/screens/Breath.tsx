import { useEffect, useRef, useState } from 'react'
import { BREATHS } from '../content/stillness'
import { breathAt, orbScale, totalSeconds } from '../domain/breath'
import { logPractice } from '../domain/stillness'
import { tone, unlockAudio } from '../audio'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { BreathOrb } from '../symbols/BreathOrb'
import { Screen } from '../ui'
import { useBreathClock } from './Urge'

export function Breath({ id }: { id: 'box' | 'power' | 'calm' }) {
  const b = BREATHS.find((x) => x.id === id)!
  const { update } = useStore()
  const { pop } = useNav()
  const [running, setRunning] = useState(false)
  const ms = useBreathClock(running)
  const at = breathAt(b.pattern, ms)
  const phase = b.pattern.phases[at.phase]
  const lastPhase = useRef(-1)
  const started = useRef<number | null>(null)

  useEffect(() => {
    if (!running || at.done) return
    const idx = (at.round - 1) * b.pattern.phases.length + at.phase
    if (idx !== lastPhase.current) {
      lastPhase.current = idx
      // Power breathing changes too fast for a tone on every breath
      if (phase.seconds >= 2) tone(phase.kind === 'in' ? 'in' : phase.kind === 'out' ? 'out' : 'hold')
    }
  }, [at.round, at.phase, at.done, running, phase, b.pattern.phases.length])

  useEffect(() => {
    if (!at.done || !started.current) return
    const start = started.current
    started.current = null
    update((s) => void (s.stillness = logPractice(s.stillness, { id: uid(), kind: id, start, minutes: Math.round(totalSeconds(b.pattern) / 6) / 10, completed: true })))
  }, [at.done, b.pattern, id, update])

  const trace = b.square ? (at.phase + at.progress) / 4 : undefined

  return (
    <Screen bg="gold" full>
      <div className="topbar">
        <button className="link muted" onClick={pop}>✕</button>
        <span className="label gold">{b.name} · {at.round} / {b.pattern.rounds}</span>
        <span style={{ width: 16 }} />
      </div>

      <div style={{ marginTop: 60 }}>
        <BreathOrb scale={running ? orbScale(phase.kind, at.progress) : 0.7} trace={running ? trace : b.square ? 0 : undefined}>
          {running && !at.done ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, maxWidth: 120 }}>{phase.label}</div>
              {phase.seconds >= 2 && <div style={{ fontSize: 30, fontWeight: 800 }}>{at.remaining}</div>}
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700 }}>{at.done ? 'Complete' : 'Ready'}</div>
          )}
        </BreathOrb>
      </div>
      <p className="note" style={{ textAlign: 'center', marginTop: 40 }}>{b.blurb}</p>

      <div className="dock">
        {!running ? (
          <button
            className="btn"
            onClick={() => {
              unlockAudio()
              started.current = Date.now()
              setRunning(true)
            }}
          >
            Begin
          </button>
        ) : at.done ? (
          <button className="btn" onClick={pop}>Done</button>
        ) : null}
      </div>
    </Screen>
  )
}
