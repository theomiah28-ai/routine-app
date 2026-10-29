import { useEffect, useRef, useState } from 'react'
import { VISUALISATIONS } from '../content/stillness'
import { logPractice } from '../domain/stillness'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen } from '../ui'

const LINE_SECONDS = 9

export function Visualise({ id }: { id: string }) {
  const v = VISUALISATIONS.find((x) => x.id === id)!
  const { update } = useStore()
  const { pop } = useNav()
  const [i, setI] = useState(0)
  const start = useRef(Date.now())
  const last = i === v.lines.length - 1

  useEffect(() => {
    if (last) return
    const t = setTimeout(() => setI((n) => n + 1), LINE_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [i, last])

  const finish = () => {
    const minutes = Math.max(1, Math.round((Date.now() - start.current) / 60e3))
    update((s) => void (s.stillness = logPractice(s.stillness, { id: uid(), kind: 'visualise', start: start.current, minutes, completed: true })))
    pop()
  }

  return (
    <Screen bg="night" full>
      <div className="topbar">
        <button className="link muted" onClick={pop}>✕</button>
        <span className="label" style={{ color: '#5a4a28' }}>{v.name}</span>
        <span style={{ width: 16 }} />
      </div>
      <div style={{ minHeight: '62dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
        <p key={i} className="vis-line">{v.lines[i]}</p>
      </div>
      <div className="flow-dots" style={{ justifyContent: 'center' }}>
        {v.lines.map((_, n) => <i key={n} className={n <= i ? 'on' : ''} style={{ width: 10 }} />)}
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 34, marginTop: 22 }}>
        <button className="link muted" disabled={i === 0} onClick={() => setI(i - 1)} style={{ opacity: i === 0 ? 0.3 : 1 }}>‹ Back</button>
        {!last && <button className="link muted" onClick={() => setI(i + 1)}>Next ›</button>}
      </div>
      {last && <div className="dock"><button className="btn" onClick={finish}>Finish</button></div>}
    </Screen>
  )
}
