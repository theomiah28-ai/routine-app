import { useState } from 'react'
import { suggestFor, type Goal } from '../content/suggestions'
import { beginJourney } from '../domain/journey'
import { todayKey } from '../dates'
import { uid } from '../seed'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen, Sheet } from '../ui'

const GROWS: Record<string, string> = { transmutation: 'Grows the Ascent', stillness: 'Opens the Eye', gym: 'Carves the statue', health: 'Heals the lungs' }

/** Before tracking: build the routine, then "Begin your journey". */
export function BuildRoutine() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [draft, setDraft] = useState('')
  const [why, setWhy] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const have = new Set(state.habits.map((h) => h.name.toLowerCase()))
  const ideas = suggestFor(state.settings.goals as Goal[]).filter((x) => !have.has(x.name.toLowerCase()))

  const addIdea = (name: string) =>
    update((s) => {
      const x = ideas.find((i) => i.name === name)
      if (!x) return
      // One habit per section link; a second one comes in unlinked
      const link = x.link && (x.link === 'health' || !s.habits.some((h) => h.link === x.link)) ? x.link : undefined
      s.habits.push({ id: uid(), name: x.name, kind: x.kind, timeOfDay: x.timeOfDay, days: x.days ?? [], createdAt: todayKey(), link, minutes: link === 'stillness' ? x.minutes : undefined, insightId: x.insightId })
    })
  const addOwn = () => {
    const n = draft.trim()
    if (!n) return
    update((s) => void s.habits.push({ id: uid(), name: n, kind: 'build', timeOfDay: 'anytime', days: [], createdAt: todayKey() }))
    setDraft('')
  }
  const remove = (id: string) => update((s) => void (s.habits = s.habits.filter((h) => h.id !== id)))

  return (
    <Screen full>
      <div className="date" style={{ marginTop: 8 }}>Your routine</div>
      <h1>Build your routine</h1>
      <p className="note">Add every habit you want to build or quit. Nothing is tracked yet. When your routine is ready, begin your journey and the tracking starts.</p>

      <div className="sec">Your habits · {state.habits.length}</div>
      {state.habits.length === 0 && <p className="note" style={{ padding: '10px 0' }}>No habits yet. Add ideas below or write your own.</p>}
      {state.habits.map((h) => (
        <div key={h.id} className="item">
          <button className="name" onClick={() => push({ name: 'habitEdit', id: h.id })}>
            {h.name}
            {h.link && <small className="sub" style={{ display: 'block', fontSize: 11.5, color: 'var(--gold-dim)' }}>{GROWS[h.link]}</small>}
          </button>
          <button className="del" onClick={() => remove(h.id)} aria-label={`Remove ${h.name}`}>×</button>
        </div>
      ))}

      <div className="row" style={{ marginTop: 12 }}>
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOwn()} placeholder="Add your own habit" />
        <button className="link gold" onClick={addOwn} style={{ opacity: draft.trim() ? 1 : 0.4 }}>Add</button>
      </div>
      <button className="add-row" onClick={() => push({ name: 'habitEdit' })}>+ Add with details (days, time, section)</button>

      {ideas.length > 0 && (
        <>
          <div className="sec">Ideas for your goals</div>
          {ideas.map((x) => (
            <div key={x.name}>
              <div className="sug">
                <div style={{ flex: 1 }}>
                  <b>{x.name}</b>
                  <small>{x.link ? GROWS[x.link] : x.kind === 'quit' ? 'Quit' : x.timeOfDay === 'anytime' ? 'Anytime' : x.timeOfDay === 'morning' ? 'Morning' : 'Evening'}</small>
                </div>
                <button className="link muted" style={{ fontSize: 13 }} onClick={() => setWhy(why === x.name ? null : x.name)}>Why?</button>
                <button className="add" onClick={() => addIdea(x.name)} aria-label={`Add ${x.name}`}>+</button>
              </div>
              {why === x.name && <p className="note sug-why">{x.why}</p>}
            </div>
          ))}
        </>
      )}

      <div className="dock">
        <button className="btn" disabled={!state.habits.length} onClick={() => setConfirm(true)}>Begin your journey</button>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)}>
        <div className="label gold">Day one</div>
        <h2 className="title" style={{ marginTop: 6 }}>Begin your journey?</h2>
        <p className="note" style={{ margin: '8px 0 16px' }}>
          Tracking starts today for all {state.habits.length} habits. From here every tick counts: streaks, the Ascent, the Eye and the statue. You can still add or change habits later.
        </p>
        <button
          className="btn"
          onClick={() => {
            update((s) => void Object.assign(s, beginJourney(s, todayKey())))
            setConfirm(false)
          }}
        >
          Begin
        </button>
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => setConfirm(false)}>Not yet</button>
      </Sheet>
    </Screen>
  )
}
