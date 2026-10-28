import { ASCENT } from '../content/ascent'
import { elapsed, stageIndex } from '../domain/transmutation'
import { eyeStage, sitStreak, totalMinutes } from '../domain/stillness'
import { faithStreak } from '../domain/faith'
import { workLog, workStreak } from '../domain/work'
import { brainState, todayMinutes } from '../domain/screentime'
import { consistency } from '../domain/progress'
import { exerciseHistory, topWeight } from '../domain/gym'
import { addDays, todayKey } from '../dates'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Ascent } from '../symbols/Ascent'
import { Eye } from '../symbols/Eye'
import { Cross } from '../symbols/Cross'
import { Brain } from '../symbols/Brain'
import { Ring, Screen } from '../ui'
import { crossBrightness } from './Faith'
import { formatMinutes } from './Stillness'

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="sub" style={{ fontSize: 12 }}>Log a few sessions</div>
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 120},${36 - (max === min ? 18 : ((v - min) / (max - min)) * 32)}`).join(' ')
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" style={{ overflow: 'visible' }}>
      <polyline fill="none" stroke="#e8c46a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

export function Journey() {
  const { state } = useStore()
  const { push } = useNav()
  const today = todayKey()
  const sr = elapsed(state.transmutation.start, Date.now())
  const mins = totalMinutes(state.stillness)
  const eye = eyeStage(mins)
  const faith = faithStreak(state.faith, today)
  const w = state.work
  const deep = workLog(w, today).deepMinutes
  const brain = brainState(todayMinutes(state.screenTime, today), state.screenTime)
  const month = consistency(state, addDays(today, -29), today, 'all')

  // The most-logged lift's top-set trend
  const lifts = Object.keys(state.exercises).map((id) => ({ id, h: exerciseHistory(state, id) })).sort((a, b) => b.h.length - a.h.length)
  const lift = lifts[0]?.h.length ? lifts[0] : null

  return (
    <Screen>
      <div className="date" style={{ marginTop: 8 }}>Journey</div>
      <h1>Who you're becoming</h1>

      <button className="jr-tile wide" onClick={() => push({ name: 'progress' })}>
        <div>
          <span className="label">Progress</span>
          <b>{Math.round(month * 100)}%</b>
          <small>consistency, last 30 days</small>
        </div>
        <Ring pct={month} size={64} stroke={6} />
      </button>

      <div className="jr-grid">
        <button className="jr-tile tall" onClick={() => push({ name: 'transmutation' })}>
          <span className="label gold">Transmutation</span>
          <div style={{ margin: '6px -6px 0', height: 168, overflow: 'hidden' }}>
            <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%' }}><Ascent days={sr.days} compact /></div>
          </div>
          <b>{sr.days}d</b>
          <small>{ASCENT[stageIndex(sr.days)].name}</small>
        </button>

        <div className="jr-col">
          <button className="jr-tile" onClick={() => push({ name: 'stillness' })}>
            <span className="label gold">Stillness</span>
            <div style={{ margin: '6px 0 2px' }}><Eye openness={eye.openness} width={130} /></div>
            <small>{eye.name} · {formatMinutes(mins)}</small>
          </button>
          <button className="jr-tile" onClick={() => push({ name: 'faith' })}>
            <span className="label gold">Faith</span>
            <Cross brightness={crossBrightness(faith)} height={64} />
            <small>{faith}-day walk</small>
          </button>
        </div>
      </div>

      <div className="jr-grid">
        <button className="jr-tile" onClick={() => push({ name: 'work' })}>
          <span className="label gold">Work</span>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 6px' }}>
            <Ring pct={w.targets.deepMinutes ? deep / w.targets.deepMinutes : 0} size={74} stroke={7}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{Math.round(deep / 6) / 10}h</span>
            </Ring>
          </div>
          <small>{workStreak(w, today)}-day streak</small>
        </button>
        <button className="jr-tile" onClick={() => push({ name: 'screentime' })}>
          <span className="label gold">Screen time</span>
          <div style={{ margin: '8px 0 2px' }}><Brain state={brain} width={104} /></div>
          <small style={{ textTransform: 'capitalize' }}>{brain} · preview</small>
        </button>
      </div>

      <button className="jr-tile wide" onClick={() => push({ name: 'gym' })}>
        <div>
          <span className="label gold">Gym</span>
          <b>{state.sessions.length}</b>
          <small>{lift ? `sessions · ${state.exercises[lift.id].name} trend` : 'sessions'}</small>
        </div>
        <Spark values={lift ? lift.h.map((x) => topWeight(x.sets)) : []} />
      </button>

      <div className="sub" style={{ textAlign: 'center', marginTop: 16 }}>{sitStreak(state.stillness, today)}-day sit streak · {state.milestones.length} milestones earned</div>
    </Screen>
  )
}
