import { useState } from 'react'
import { THEMES, verseText } from '../content/faith'
import { faithDone, planToday, verseOfDay, type FaithItem } from '../domain/faith'
import { faithDays, faithStage } from '../domain/progression'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Cross } from '../symbols/Cross'
import { Check, Screen, Sheet } from '../ui'

export const crossBrightness = (streak: number) => Math.min(1, 0.25 + streak / 60)

export function Faith() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [gratitude, setGratitude] = useState(false)
  const today = todayKey()
  const f = state.faith
  const streak = faithDays(state, today)
  const stage = faithStage(streak)
  const verse = verseOfDay(today)
  const plan = planToday(f, today)
  const [note, setNote] = useState(f.days[today]?.note ?? '')

  const set = (item: FaithItem, v: boolean) => update((s) => void (s.faith.days[today] = { ...s.faith.days[today], [item]: v }))

  return (
    <Screen bg="gold">
      <div className="topbar"><Back label="Today" /></div>
      <div className="label gold" style={{ marginTop: 16 }}>Faith · walk with God</div>
      <div style={{ marginTop: 8 }}><Cross brightness={crossBrightness(streak)} /></div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{streak} {streak === 1 ? 'day' : 'days'}</div>
        <div style={{ fontSize: 13, color: '#c9b88a' }}>walking in the light · {stage.name}</div>
        {stage.next && <div className="jr-bar" style={{ maxWidth: 220, margin: '10px auto 2px' }}><i style={{ width: `${Math.max(2, stage.pct * 100)}%` }} /></div>}
        {stage.next && <div className="sub" style={{ fontSize: 11.5 }}>Day {stage.next.day} · {stage.next.name}</div>}
      </div>

      <div className="verse">
        <div className="row">
          <span className="label gold">Verse of the day</span>
          <span className="pill">{THEMES[verse.theme].toUpperCase()}</span>
        </div>
        <q>{verseText(verse.ref)}</q>
        <div className="ref">{verse.ref}</div>
        <div className="note" style={{ marginTop: 10, fontSize: 13 }}>
          {verse.note ?? <>Why this matters for builders <span className="placeholder-tag">Theo to write</span></>}
        </div>
      </div>

      <div className="sec">Today</div>
      <div className={'item' + (faithDone(f, today, 'prayer') ? ' done' : '')}>
        <Check on={faithDone(f, today, 'prayer')} onClick={() => set('prayer', !faithDone(f, today, 'prayer'))} />
        <span className="name">Morning prayer</span>
        <span className={'streak' + (streak ? '' : ' zero')}>{streak}d</span>
      </div>
      <div className={'item' + (faithDone(f, today, 'reading') ? ' done' : '')}>
        <Check on={faithDone(f, today, 'reading')} onClick={() => plan && push({ name: 'reader', ref: plan.ref, planDay: true })} />
        <button className="name" onClick={() => (plan ? push({ name: 'reader', ref: plan.ref, planDay: true }) : push({ name: 'plans' }))}>
          {plan ? `Read: ${plan.ref}` : 'Choose a reading plan'}
        </button>
        <span className="sub" style={{ fontSize: 11.5 }}>{plan ? plan.plan.name : '›'}</span>
      </div>
      <div className={'item' + (faithDone(f, today, 'gratitude') ? ' done' : '')}>
        <Check on={faithDone(f, today, 'gratitude')} onClick={() => setGratitude(true)} />
        <button className="name" onClick={() => setGratitude(true)}>Evening gratitude</button>
      </div>

      <button className="card" style={{ marginTop: 18 }} onClick={() => push({ name: 'plans' })}>
        <span className="grow">Reading plans<small>Scripture for people building something</small></span>
        <span className="chev">›</span>
      </button>

      <Sheet open={gratitude} onClose={() => setGratitude(false)}>
        <h2 className="title">What are you grateful for?</h2>
        <p className="note" style={{ margin: '6px 0 14px' }}>Optional. A line or two is enough.</p>
        <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Today I'm grateful for…" />
        <button
          className="btn"
          style={{ marginTop: 14 }}
          onClick={() => {
            update((s) => void (s.faith.days[today] = { ...s.faith.days[today], gratitude: true, note: note.trim() || undefined }))
            setGratitude(false)
          }}
        >
          Give thanks
        </button>
        {faithDone(f, today, 'gratitude') && (
          <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => { set('gratitude', false); setGratitude(false) }}>Untick</button>
        )}
      </Sheet>
    </Screen>
  )
}
