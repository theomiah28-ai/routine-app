import { useState } from 'react'
import { addDays, dateKey, formatLong } from '../dates'
import { useNow } from './Transmutation'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Check, Ring } from '../ui'
import { MAX_TOPUPS, SLOTS, WATER_STEP, active, dayScore, editFoodDay, foodTargets, formatLitres, macroLine, scoreLabel, suppStreak, totals } from '../domain/food'
import type { FoodDay, FoodSlot } from '../types'

export function Food() {
  const { state, update } = useStore()
  const { push } = useNav()
  const [day, setDay] = useState<'today' | 'yesterday'>('today')
  // Re-reads the clock every minute and when the app comes back, so midnight rolls over
  const now = useNow(60_000)
  const today = dateKey(new Date(now))
  const key = day === 'today' ? today : addDays(today, -1)
  const food = state.food
  const targets = foodTargets(state)
  const log = food.log[key]
  const t = totals(food, log)
  const score = dayScore(food, targets, log)

  const edit = (fn: (d: FoodDay) => void) => update((s) => editFoodDay(s, key, fn))
  const pick = (slot: FoodSlot, id: string) => edit((d) => void (d[slot] = d[slot] === id ? null : id))
  const count = (id: string, by: number) => edit((d) => void (d.counters[id] = Math.max(0, Math.min(MAX_TOPUPS, (d.counters[id] ?? 0) + by))))
  const water = log?.waterMl ?? 0

  const macros: { label: string; got: number; target: number }[] = [
    { label: 'Protein', got: t.protein, target: targets.protein },
    { label: 'Carbs', got: t.carbs, target: targets.carbs },
    { label: 'Fat', got: t.fat, target: targets.fat },
  ]

  return (
    <div className="screen full">
      <div className="topbar">
        <span className="date">{formatLong(key)}</span>
        <button className="link" onClick={() => push({ name: 'foodEdit' })}>Edit meals</button>
      </div>
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Food</h1>
        <div className="seg">
          <button className={day === 'yesterday' ? 'on' : ''} onClick={() => setDay('yesterday')}>Yesterday</button>
          <button className={day === 'today' ? 'on' : ''} onClick={() => setDay('today')}>Today</button>
        </div>
      </div>

      <div className="food-sum">
        <div className="row" style={{ alignItems: 'center', gap: 18 }}>
          <Ring pct={targets.kcal ? t.kcal / targets.kcal : 0} size={104} stroke={8}>
            <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
              <div style={{ fontSize: 21, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(t.kcal)}</div>
              <div className="sub" style={{ fontSize: 11 }}>/ {targets.kcal} kcal</div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <span className="label gold">Daily score</span>
            <div className="score-num">{score === null ? '--' : `${score}%`}</div>
            <div className="sub">{score === null ? 'Pick a meal to start' : scoreLabel(score)}</div>
          </div>
        </div>
        {macros.map((m) => (
          <div key={m.label} className="macro">
            <div className="macro-top">
              <span>{m.label}</span>
              <span className="sub">{Math.round(m.got)} / {m.target}g</span>
            </div>
            <div className="jr-bar"><i style={{ width: `${m.target ? Math.min(100, (m.got / m.target) * 100) : 0}%`, opacity: m.got ? 1 : 0 }} /></div>
          </div>
        ))}
      </div>

      {SLOTS.map((slot) => {
        const options = active(food.meals[slot.key])
        return (
          <div key={slot.key}>
            <div className="sec" style={{ marginBottom: 10 }}>{slot.title}</div>
            {options.map((m) => {
              const on = log?.[slot.key] === m.id
              return (
                <button key={m.id} className={'card meal' + (on ? ' next' : '')} onClick={() => pick(slot.key, m.id)}>
                  <span className="grow">
                    {m.name}
                    {m.ingredients && <small className="wrap">{m.ingredients}</small>}
                    <small className="macros">{macroLine(m)}</small>
                  </span>
                  {on && <span className="pill">Selected</span>}
                </button>
              )
            })}
            {!options.length && <div className="group-empty">No {slot.title.toLowerCase()} meals. Add one in Edit meals.</div>}
          </div>
        )
      })}

      <div className="sec">Top-ups</div>
      {active(food.counters).map((c) => {
        const n = log?.counters[c.id] ?? 0
        return (
          <div key={c.id} className="item">
            <span className="name">
              {c.name}
              <small className="sub" style={{ display: 'block', fontSize: 12 }}>{c.ingredients ? `${c.ingredients} · ` : ''}{macroLine(c)}</small>
            </span>
            <div className="seg">
              <button onClick={() => count(c.id, -1)} disabled={!n} aria-label={`One less ${c.name}`}>−</button>
              <button className={n ? 'on' : ''} style={{ minWidth: 34 }}>{n}</button>
              <button onClick={() => count(c.id, 1)} disabled={n >= MAX_TOPUPS} aria-label={`One more ${c.name}`}>+</button>
            </div>
          </div>
        )
      })}

      <div className="sec">Supplements</div>
      {active(food.supplements).map((x) => {
        const on = !!log?.supplements[x.id]
        const streak = suppStreak(food, x.id, today)
        return (
          <div key={x.id} className={'item' + (on ? ' done' : '')}>
            <Check on={on} onClick={() => edit((d) => void (d.supplements[x.id] = !on))} />
            <span className="name">
              {x.name}
              {x.optional && <span className="tag">optional</span>}
              {x.note && <small className="sub" style={{ display: 'block', fontSize: 12 }}>{x.note}</small>}
            </span>
            <span className={'streak' + (streak ? '' : ' zero')}>{streak}d</span>
          </div>
        )
      })}
      <div className="item water">
        <span className="name">
          Water
          <small className="sub" style={{ display: 'block', fontSize: 12 }}>{formatLitres(water)} of {formatLitres(food.waterGoalMl)}{water >= food.waterGoalMl ? ' · goal hit' : ''}</small>
          <span className="jr-bar"><i style={{ width: `${Math.min(100, (water / food.waterGoalMl) * 100)}%`, opacity: water ? 1 : 0 }} /></span>
        </span>
        <div className="seg">
          <button onClick={() => edit((d) => void (d.waterMl -= WATER_STEP))} disabled={!water} aria-label={`Remove ${WATER_STEP}ml`}>−</button>
          <button className="on" onClick={() => edit((d) => void (d.waterMl += WATER_STEP))}>+{WATER_STEP}ml</button>
        </div>
      </div>
    </div>
  )
}
