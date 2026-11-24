import { addDays } from '../dates'
import type { FoodDay, FoodSlot, FoodState, Macros, Meal, State, Supplement } from '../types'

export const SLOTS: { key: FoodSlot; title: string }[] = [
  { key: 'preworkout', title: 'Pre-workout' },
  { key: 'breakfast', title: 'Breakfast' },
  { key: 'lunch', title: 'Lunch' },
  { key: 'dinner', title: 'Dinner' },
]

export const DEFAULT_TARGETS: Macros = { kcal: 2400, protein: 190, carbs: 255, fat: 67 }
export const MAX_TOPUPS = 4
export const WATER_STEP = 750
/** Protein that counts as a high-protein day on Today */
export const HIGH_PROTEIN_G = 150

const meal = (id: string, name: string, ingredients: string, kcal: number, protein: number, carbs: number, fat: number): Meal => ({ id, name, ingredients, kcal, protein, carbs, fat })

export function defaultFood(): FoodState {
  return {
    meals: {
      preworkout: [meal('banana-honey', 'Banana & Honey', '1 banana, 1 tbsp honey', 170, 1, 44, 0)],
      breakfast: [
        meal('eggs-sourdough', 'Eggs & Sourdough', '3 eggs in butter, 2 slices sourdough', 490, 27, 49, 20),
        meal('eggs-shake', 'Eggs & Shake', '3 eggs in butter, 1 slice sourdough, 1 whey shake', 490, 47, 27, 20),
      ],
      lunch: [
        meal('chicken-rice', 'Chicken & Rice', '180g cooked chicken, 150g rice, 150g frozen veg, 1 tbsp olive oil', 660, 64, 52, 21),
        meal('shrimp-rice', 'Shrimp & Rice', '250g cooked shrimp, 150g rice, 150g frozen veg, 1 tbsp olive oil', 615, 67, 52, 17),
      ],
      dinner: [
        meal('beef-rice', 'Beef & Rice', '200g raw 10% mince, 150g rice, 150g frozen veg', 600, 48, 52, 21),
        meal('beef-egg-bowl', 'Beef & Egg Bowl', '150g mince, 2 eggs, 150g rice, frozen veg', 650, 51, 53, 26),
      ],
    },
    counters: [
      meal('whey-shake', 'Whey Shake', '1 scoop in water', 120, 24, 3, 1.5),
      meal('extra-rice', 'Extra Rice', '100g cooked', 130, 3, 28, 0),
      meal('extra-sourdough', 'Extra Sourdough Slice', '1 slice', 120, 4, 24, 1),
    ],
    supplements: [
      { id: 'creatine', name: 'Creatine 5g' },
      { id: 'vitamin-d3', name: 'Vitamin D3 10µg', note: 'Take with a meal containing fat' },
      { id: 'magnesium', name: 'Magnesium', note: 'Evening', optional: true },
    ],
    waterGoalMl: 3000,
    log: {},
  }
}

/** Add whatever food fields a save is missing. Never changes what's already there. */
export function withFoodDefaults(food: Partial<FoodState> | undefined): FoodState {
  const def = defaultFood()
  if (!food) return def
  return { ...def, ...food, meals: { ...def.meals, ...food.meals } }
}

export const emptyDay = (): FoodDay => ({ preworkout: null, breakfast: null, lunch: null, dinner: null, counters: {}, supplements: {}, waterMl: 0 })

export const foodTargets = (s: State): Macros => s.settings.foodTargets ?? DEFAULT_TARGETS

/** Any meal or top-up by id, including deleted ones so past days keep their totals. */
export function findMeal(food: FoodState, id: string): Meal | undefined {
  for (const slot of SLOTS) {
    const m = food.meals[slot.key].find((x) => x.id === id)
    if (m) return m
  }
  return food.counters.find((x) => x.id === id)
}

export const active = <T extends { archived?: boolean }>(list: T[]) => list.filter((x) => !x.archived)

export function totals(food: FoodState, day: FoodDay | undefined): Macros {
  const t: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  if (!day) return t
  const add = (m: Meal | undefined, n: number) => {
    if (!m || n <= 0) return
    t.kcal += m.kcal * n
    t.protein += m.protein * n
    t.carbs += m.carbs * n
    t.fat += m.fat * n
  }
  for (const slot of SLOTS) {
    const id = day[slot.key]
    if (id) add(findMeal(food, id), 1)
  }
  for (const [id, n] of Object.entries(day.counters)) add(findMeal(food, id), n)
  return t
}

export const hasMeal = (day: FoodDay | undefined) => !!day && SLOTS.some((slot) => !!day[slot.key])

/** Full marks within `full` of the target, falling linearly to 0 at `zero` off. */
const band = (off: number, full: number, zero: number) => (off <= full ? 1 : off >= zero ? 0 : (zero - off) / (zero - full))

/** Supplements that count towards the score: everything not optional or deleted. */
export const requiredSupplements = (food: FoodState) => active(food.supplements).filter((x) => !x.optional)

/** 0-100, or null until a meal is picked. */
export function dayScore(food: FoodState, targets: Macros, day: FoodDay | undefined): number | null {
  if (!hasMeal(day)) return null
  const t = totals(food, day)
  const rel = (x: number, target: number) => (target > 0 ? Math.abs(x - target) / target : 0)
  const kcal = 30 * band(Math.abs(t.kcal - targets.kcal), 100, 500)
  const protein = 30 * (targets.protein > 0 ? Math.min(t.protein / targets.protein, 1) : 1)
  const carbs = 10 * band(rel(t.carbs, targets.carbs), 0.15, 0.5)
  const fat = 10 * band(rel(t.fat, targets.fat), 0.15, 0.5)
  const req = requiredSupplements(food)
  const supps = 20 * (req.length ? req.filter((x) => day!.supplements[x.id]).length / req.length : 1)
  return Math.round(kcal + protein + carbs + fat + supps)
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Dialled'
  if (score >= 75) return 'Solid'
  if (score >= 50) return 'Okay'
  return 'Off track'
}

/** A day that counts on the Fuel card */
export const FUELLED = 80

const fuelled = (s: State, key: string) => (dayScore(s.food, foodTargets(s), s.food.log[key]) ?? 0) >= FUELLED

/** Every day ever with a score of 80 or more. */
export const fuelDays = (s: State) => Object.keys(s.food.log).filter((k) => fuelled(s, k)).length

/** Days in a row scoring 80+. Today only breaks the run once it's over, so an unfinished today is skipped. */
export function fuelStreak(s: State, today: string): number {
  let key = fuelled(s, today) ? today : addDays(today, -1)
  let n = 0
  while (fuelled(s, key)) {
    n++
    key = addDays(key, -1)
  }
  return n
}

export const FUEL = [
  { days: 0, name: 'Empty tank' },
  { days: 1, name: 'Spark' },
  { days: 7, name: 'Kindled' },
  { days: 21, name: 'Fuelled' },
  { days: 45, name: 'Stoked' },
  { days: 90, name: 'High octane' },
  { days: 180, name: 'Forged' },
  { days: 365, name: 'Furnace' },
]

export function fuelStage(days: number) {
  let index = 0
  FUEL.forEach((st, i) => days >= st.days && (index = i))
  const next = FUEL[index + 1]
  return { index, name: FUEL[index].name, next, pct: next ? (days - FUEL[index].days) / (next.days - FUEL[index].days) : 1 }
}

/** Days in a row a supplement was ticked; an unticked today doesn't break the run yet. */
export function suppStreak(food: FoodState, id: string, today: string): number {
  const on = (k: string) => !!food.log[k]?.supplements[id]
  let key = on(today) ? today : addDays(today, -1)
  let n = 0
  while (on(key)) {
    n++
    key = addDays(key, -1)
  }
  return n
}

const HIGH_PROTEIN = /high[\s-]*protein/i
const CREATINE = /creatine/i
const VITAMIN_D = /vit(amin)?\.?\s*d\b|\bd3\b/i

/** The Today habit a supplement ticks, if one with a matching name exists. */
function habitPattern(supp: Supplement): RegExp | null {
  if (CREATINE.test(supp.name)) return CREATINE
  if (VITAMIN_D.test(supp.name)) return VITAMIN_D
  return null
}

function setCheck(s: State, key: string, habitId: string, on: boolean) {
  const list = s.checks[key] ?? []
  if (on && !list.includes(habitId)) s.checks[key] = [...list, habitId]
  if (!on && list.includes(habitId)) s.checks[key] = list.filter((x) => x !== habitId)
}

/**
 * Change one day's food log, then keep Today in step: crossing 150g protein ticks (or unticks) the
 * high-protein habit, and ticking creatine or vitamin D ticks the matching habit. Only a crossing
 * changes Today, so a habit ticked by hand stays ticked.
 */
export function editFoodDay(s: State, key: string, fn: (d: FoodDay) => void) {
  const before = structuredClone(s.food.log[key] ?? emptyDay())
  const day = s.food.log[key] ?? (s.food.log[key] = emptyDay())
  fn(day)
  for (const [id, n] of Object.entries(day.counters)) {
    if (n <= 0) delete day.counters[id]
    else day.counters[id] = Math.min(MAX_TOPUPS, n)
  }
  day.waterMl = Math.max(0, day.waterMl)

  const protein = (d: FoodDay) => totals(s.food, d).protein >= HIGH_PROTEIN_G
  const hp = s.habits.find((h) => HIGH_PROTEIN.test(h.name))
  if (hp && protein(before) !== protein(day)) setCheck(s, key, hp.id, protein(day))

  for (const supp of s.food.supplements) {
    const was = !!before.supplements[supp.id]
    const now = !!day.supplements[supp.id]
    const pattern = habitPattern(supp)
    if (was === now || !pattern) continue
    const h = s.habits.find((x) => pattern.test(x.name))
    if (h) setCheck(s, key, h.id, now)
  }
}

export const formatLitres = (ml: number) => `${Math.round(ml / 10) / 100}L`

export const macroLine = (m: Macros) => `${round1(m.kcal)} kcal · P ${round1(m.protein)}g · C ${round1(m.carbs)}g · F ${round1(m.fat)}g`

const round1 = (n: number) => Math.round(n * 10) / 10
