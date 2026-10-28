import { useEffect, useState } from 'react'
import { FIELDS, setInput, startFocus, stopFocus, totals, workHit, workLog, workStreak } from '../domain/work'
import { addDays, parseKey, todayKey, weekStart } from '../dates'
import { useStore } from '../store'
import { Back } from '../nav'
import { Ring, Screen, Sheet, Stepper } from '../ui'
import { useNow } from './Transmutation'
import type { WorkInputs } from '../types'

const META: Record<keyof WorkInputs, { label: string; short: string; step: number; unit: string }> = {
  videos: { label: 'Videos posted', short: 'Videos', step: 1, unit: '' },
  products: { label: 'Products tested', short: 'Products', step: 1, unit: '' },
  hoursWorked: { label: 'Hours worked', short: 'Hours', step: 0.5, unit: 'h' },
  deepMinutes: { label: 'Deep work', short: 'Deep work', step: 15, unit: 'm' },
}

const WEEK = [{ d: 1, l: 'M' }, { d: 2, l: 'T' }, { d: 3, l: 'W' }, { d: 4, l: 'T' }, { d: 5, l: 'F' }, { d: 6, l: 'S' }, { d: 0, l: 'S' }]

export const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`)

function Bars({ values, target, labels }: { values: number[]; target: number; labels: string[] }) {
  const max = Math.max(target, ...values, 1)
  const W = 320
  const H = 120
  const bw = W / values.length
  const ty = H - (target / max) * (H - 10)
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} width="100%" style={{ display: 'block', marginTop: 10 }}>
      {target > 0 && <line x1="0" x2={W} y1={ty} y2={ty} stroke="#3a3324" strokeDasharray="3 4" />}
      {values.map((v, i) => {
        const h = (v / max) * (H - 10)
        const hit = target > 0 && v >= target
        return (
          <g key={i}>
            <rect x={i * bw + bw * 0.18} y={H - h} width={bw * 0.64} height={Math.max(h, v > 0 ? 2 : 0)} rx={Math.min(5, bw * 0.2)} fill={hit ? '#e8c46a' : '#4a4436'} />
            {labels[i] && <text x={i * bw + bw / 2} y={H + 14} textAnchor="middle" fontSize="10" fill="#55524a" fontFamily="-apple-system, Inter, sans-serif">{labels[i]}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export function Work({ startFocus: autoStart }: { startFocus?: boolean }) {
  const { state, update } = useStore()
  const now = useNow(1000)
  const [targets, setTargets] = useState(false)
  const [range, setRange] = useState<'week' | 'month'>('week')
  const [field, setField] = useState<keyof WorkInputs>('deepMinutes')
  const w = state.work
  const today = todayKey()
  const log = workLog(w, today)
  const focusing = w.focusStart !== null
  const liveDeep = log.deepMinutes + (focusing && w.focusStart! >= parseKey(today).getTime() ? (now - w.focusStart!) / 60e3 : 0)
  const streak = workStreak(w, today)

  useEffect(() => {
    if (autoStart && state.work.focusStart === null) update((s) => void (s.work = startFocus(s.work, Date.now())))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const monday = weekStart(today)
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const span = range === 'week' ? week : Array.from({ length: 30 }, (_, i) => addDays(today, i - 29))
  const values = span.map((k) => workLog(w, k)[field])
  const sum = totals(w, span[0], span[span.length - 1])

  const elapsedFocus = focusing ? Math.floor((now - w.focusStart!) / 1000) : 0
  const clock = `${Math.floor(elapsedFocus / 60)}:${String(elapsedFocus % 60).padStart(2, '0')}`

  return (
    <Screen bg="gold" full>
      <div className="topbar">
        <Back label="Today" />
        <button className="link" onClick={() => setTargets(true)}>Targets</button>
      </div>
      <div className="label gold" style={{ marginTop: 16 }}>Work</div>
      <h1>{workHit(w, today) ? 'Targets hit' : 'Today’s inputs'}</h1>
      <div className="sub">{streak}-day streak hitting every target</div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 6px' }}>
        <Ring pct={w.targets.deepMinutes ? liveDeep / w.targets.deepMinutes : 0} size={200} stroke={11}>
          <div style={{ fontSize: focusing ? 38 : 32, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{focusing ? clock : hm(liveDeep)}</div>
          <div className="sub" style={{ fontSize: 12 }}>{focusing ? `in focus · ${hm(liveDeep)} today` : `of ${hm(w.targets.deepMinutes)} deep work`}</div>
        </Ring>
      </div>

      <div className="wk-dots">
        {week.map((k, i) => (
          <div key={k} className={(workHit(w, k) ? 'hit' : k < today ? 'miss' : '') + (k === today ? ' today' : '')}>
            <span>{WEEK[i].l}</span>
            <i />
          </div>
        ))}
      </div>

      <div className="sec">Today</div>
      {FIELDS.filter((f) => f !== 'deepMinutes').map((f) => (
        <div key={f} className="input-row">
          <div>
            <div style={{ fontSize: 15.5 }}>{META[f].label}</div>
            <div className="sub" style={{ fontSize: 12 }}>
              Target {w.targets[f]}{META[f].unit}
              {log[f] >= w.targets[f] && w.targets[f] > 0 && <span className="acc"> · hit</span>}
            </div>
          </div>
          <Stepper value={log[f]} step={META[f].step} onChange={(v) => update((s) => void (s.work = setInput(s.work, today, f, v)))} />
        </div>
      ))}
      <div className="input-row">
        <div>
          <div style={{ fontSize: 15.5 }}>Deep work (minutes)</div>
          <div className="sub" style={{ fontSize: 12 }}>The focus timer adds this for you</div>
        </div>
        <Stepper value={log.deepMinutes} step={15} onChange={(v) => update((s) => void (s.work = setInput(s.work, today, 'deepMinutes', v)))} />
      </div>

      <div className="sec" style={{ justifyContent: 'space-between' }}>
        <span>Trend</span>
        <div className="seg" style={{ letterSpacing: 0, textTransform: 'none' }}>
          <button className={range === 'week' ? 'on' : ''} onClick={() => setRange('week')}>Week</button>
          <button className={range === 'month' ? 'on' : ''} onClick={() => setRange('month')}>30 days</button>
        </div>
      </div>
      <div className="pills" style={{ marginTop: 8 }}>
        {FIELDS.map((f) => (
          <button key={f} className={'pill-btn' + (field === f ? ' on' : '')} onClick={() => setField(f)}>{META[f].short}</button>
        ))}
      </div>
      <Bars values={values} target={w.targets[field]} labels={range === 'week' ? WEEK.map((x) => x.l) : span.map((k, i) => (i % 7 === 0 ? String(parseKey(k).getDate()) : ''))} />
      <div className="sub" style={{ marginTop: 6 }}>
        Total: <b style={{ color: 'var(--text)' }}>{field === 'deepMinutes' ? hm(sum.deepMinutes) : `${sum[field]}${META[field].unit}`}</b> {range === 'week' ? 'this week' : 'in 30 days'}
      </div>

      <div className="dock">
        {focusing ? (
          <button className="btn ghost" onClick={() => update((s) => void (s.work = stopFocus(s.work, Date.now())))}>End session · {clock}</button>
        ) : (
          <button className="btn" onClick={() => update((s) => void (s.work = startFocus(s.work, Date.now())))}>Start focus session</button>
        )}
      </div>

      <Sheet open={targets} onClose={() => setTargets(false)}>
        <h2 className="title">Daily targets</h2>
        <p className="note" style={{ margin: '6px 0 14px' }}>A day counts when every target is met. Set one to 0 to ignore it.</p>
        {FIELDS.map((f) => (
          <div key={f} className="input-row">
            <span style={{ fontSize: 15 }}>{META[f].label}{f === 'deepMinutes' ? ' (min)' : ''}</span>
            <Stepper value={w.targets[f]} step={META[f].step} onChange={(v) => update((s) => void (s.work.targets[f] = v))} />
          </div>
        ))}
        <div className="field" style={{ marginTop: 16 }}>
          <label>Work days</label>
          <div className="days">
            {WEEK.map(({ d, l }) => {
              const on = w.days.length === 0 || w.days.includes(d)
              return (
                <button
                  key={d}
                  className={on ? 'on' : ''}
                  onClick={() =>
                    update((s) => {
                      const cur = s.work.days.length ? s.work.days : [0, 1, 2, 3, 4, 5, 6]
                      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]
                      s.work.days = next.length === 7 || next.length === 0 ? [] : next
                    })
                  }
                >
                  {l}
                </button>
              )
            })}
          </div>
        </div>
        <button className="btn" onClick={() => setTargets(false)}>Done</button>
      </Sheet>
    </Screen>
  )
}
