import { uid } from '../seed'
import { useStore } from '../store'
import { Back } from '../nav'
import { SortableList, Toggle } from '../ui'
import { DEFAULT_TARGETS, SLOTS, active, nutrientTargets } from '../domain/food'
import { NUTRIENTS, NUTRIENT_GROUPS } from '../domain/nutrients'
import type { FoodState, Macros, Meal, NutrientKey, Nutrients, State, Supplement } from '../types'

const MACROS: { key: keyof Macros; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
]

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Collapsible per-portion nutrient inputs for a meal, top-up or supplement. */
function NutrientInputs({ value, onChange }: { value: Nutrients | undefined; onChange: (k: NutrientKey, v: number) => void }) {
  const filled = NUTRIENTS.filter((n) => (value?.[n.key] ?? 0) > 0).length
  return (
    <details className="nut-edit">
      <summary>Nutrients <span className="sub">· {filled} of {NUTRIENTS.length} filled</span></summary>
      <div className="nut-in">
        {NUTRIENTS.map((n) => (
          <label key={n.key}>
            <span>{n.name} <i>{n.unit}</i></span>
            <input className="num" inputMode="decimal" defaultValue={value?.[n.key] ? String(value[n.key]) : ''} placeholder="0" onChange={(e) => onChange(n.key, num(e.target.value))} />
          </label>
        ))}
      </div>
    </details>
  )
}

/** Where a meal list lives: one of the four slots, or the top-ups. */
type MealList = { get: (f: FoodState) => Meal[]; set: (f: FoodState, list: Meal[]) => void }

export function FoodEdit() {
  const { state, update } = useStore()
  const food = state.food
  const targets = state.settings.foodTargets ?? DEFAULT_TARGETS

  const editFood = (fn: (f: FoodState, s: State) => void) => update((s) => fn(s.food, s))

  // Deleted items stay at the end, hidden, so past days keep their totals
  const reorder = <T extends { archived?: boolean }>(all: T[], shown: T[]) => [...shown, ...all.filter((x) => x.archived)]

  const mealSection = (title: string, list: MealList) => {
    const items = active(list.get(food))
    const change = (id: string, fn: (m: Meal) => void) => editFood((f) => fn(list.get(f).find((m) => m.id === id)!))
    const remove = (m: Meal) => {
      if (!confirm(`Delete "${m.name}"? Past days keep their totals.`)) return
      change(m.id, (x) => void (x.archived = true))
    }
    const add = () => editFood((f) => list.set(f, [...list.get(f), { id: uid(), name: 'New meal', ingredients: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }]))
    return (
      <div key={title}>
        <div className="sec">{title}</div>
        <SortableList
          items={items}
          onReorder={(shown) => editFood((f) => list.set(f, reorder(list.get(f), shown)))}
          render={(m) => (
            <div className="item plan-item">
              <div className="plan-top">
                <input className="input name-in" defaultValue={m.name} placeholder="Meal name" onChange={(e) => change(m.id, (x) => void (x.name = e.target.value))} />
                <button className="del" onClick={() => remove(m)} aria-label={`Delete ${m.name}`}>×</button>
              </div>
              <input className="input small-in" defaultValue={m.ingredients} placeholder="Ingredients" onChange={(e) => change(m.id, (x) => void (x.ingredients = e.target.value))} />
              <div className="macro-in">
                {MACROS.map((k) => (
                  <label key={k.key}>
                    <input className="num" inputMode="decimal" defaultValue={String(m[k.key])} onChange={(e) => change(m.id, (x) => void (x[k.key] = num(e.target.value)))} />
                    <span>{k.key === 'kcal' ? 'kcal' : k.label[0]}</span>
                  </label>
                ))}
              </div>
              <NutrientInputs value={m.nutrients} onChange={(k, v) => change(m.id, (x) => void (x.nutrients = { ...x.nutrients, [k]: v }))} />
            </div>
          )}
        />
        <button className="add-row" onClick={add}>+ Add {title === 'Top-ups' ? 'top-up' : 'meal'}</button>
      </div>
    )
  }

  const supps = active(food.supplements)
  const changeSupp = (id: string, fn: (x: Supplement) => void) => editFood((f) => fn(f.supplements.find((x) => x.id === id)!))

  return (
    <div className="screen full">
      <div className="topbar"><Back label="Food" /></div>
      <h1>Edit meals</h1>

      <div className="sec">Daily targets</div>
      {MACROS.map((k) => (
        <div key={k.key} className="setting">
          <span>{k.label}</span>
          <span className="row" style={{ gap: 6, alignItems: 'center' }}>
            <input
              className="num"
              inputMode="decimal"
              defaultValue={String(targets[k.key])}
              onChange={(e) => update((s) => void (s.settings.foodTargets = { ...(s.settings.foodTargets ?? DEFAULT_TARGETS), [k.key]: num(e.target.value) }))}
              aria-label={k.label}
            />
            <span className="sub" style={{ width: 30 }}>{k.unit}</span>
          </span>
        </div>
      ))}
      <div className="setting">
        <span>Water goal</span>
        <span className="row" style={{ gap: 6, alignItems: 'center' }}>
          <input className="num" inputMode="decimal" defaultValue={String(food.waterGoalMl / 1000)} onChange={(e) => editFood((f) => void (f.waterGoalMl = Math.max(250, num(e.target.value) * 1000)))} aria-label="Water goal" />
          <span className="sub" style={{ width: 30 }}>L</span>
        </span>
      </div>

      <details className="nut-edit" style={{ marginTop: 4 }}>
        <summary>Nutrient targets</summary>
        {NUTRIENT_GROUPS.map((g) => (
          <div key={g.title}>
            <div className="label gold" style={{ margin: '12px 0 6px' }}>{g.title}</div>
            {g.items.map((n) => (
              <div key={n.key} className="setting">
                <span>{n.name}</span>
                <span className="row" style={{ gap: 6, alignItems: 'center' }}>
                  <input
                    className="num"
                    inputMode="decimal"
                    defaultValue={String(nutrientTargets(food)[n.key])}
                    onChange={(e) => editFood((f) => void (f.nutrientTargets = { ...nutrientTargets(f), [n.key]: num(e.target.value) }))}
                    aria-label={`${n.name} target`}
                  />
                  <span className="sub" style={{ width: 30 }}>{n.unit}</span>
                </span>
              </div>
            ))}
          </div>
        ))}
      </details>

      {SLOTS.map((slot) => mealSection(slot.title, { get: (f) => f.meals[slot.key], set: (f, l) => void (f.meals[slot.key] = l) }))}
      {mealSection('Top-ups', { get: (f) => f.counters, set: (f, l) => void (f.counters = l) })}

      <div className="sec">Supplements</div>
      <SortableList
        items={supps}
        onReorder={(shown) => editFood((f) => void (f.supplements = reorder(f.supplements, shown)))}
        render={(x) => (
          <div className="item plan-item">
            <div className="plan-top">
              <input className="input name-in" defaultValue={x.name} placeholder="Supplement" onChange={(e) => changeSupp(x.id, (y) => void (y.name = e.target.value))} />
              <button
                className="del"
                onClick={() => confirm(`Delete "${x.name}"?`) && changeSupp(x.id, (y) => void (y.archived = true))}
                aria-label={`Delete ${x.name}`}
              >
                ×
              </button>
            </div>
            <input className="input small-in" defaultValue={x.note ?? ''} placeholder="Note (optional)" onChange={(e) => changeSupp(x.id, (y) => void (y.note = e.target.value || undefined))} />
            <div className="plan-row" style={{ justifyContent: 'space-between' }}>
              <span className="sub">Optional: doesn't count against the score</span>
              <Toggle on={!!x.optional} onChange={(v) => changeSupp(x.id, (y) => void (y.optional = v || undefined))} />
            </div>
            <NutrientInputs value={x.nutrients} onChange={(k, v) => changeSupp(x.id, (y) => void (y.nutrients = { ...y.nutrients, [k]: v }))} />
          </div>
        )}
      />
      <button className="add-row" onClick={() => editFood((f) => void f.supplements.push({ id: uid(), name: 'New supplement' }))}>+ Add supplement</button>
      <p className="note" style={{ marginTop: 10 }}>Deleting a meal or supplement keeps your past days as they were. Drag ⋮⋮ to reorder.</p>
    </div>
  )
}
