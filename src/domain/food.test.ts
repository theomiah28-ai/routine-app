import { describe, expect, it } from 'vitest'
import { DEFAULT_TARGETS, dayScore, defaultFood, editFoodDay, emptyDay, fuelDays, fuelStage, fuelStreak, scoreLabel, suppStreak, totals } from './food'
import { migrate } from '../migrate'
import { seedState } from '../seed'
import { addDays, todayKey } from '../dates'
import { resetProgress } from './journey'
import type { FoodDay, State } from '../types'

const today = todayKey()
const food = defaultFood()
const day = (d: Partial<FoodDay>): FoodDay => ({ ...emptyDay(), ...d })
const allSupps = { creatine: true, 'vitamin-d3': true }

/** 2340 kcal · P214 C210 F70 */
const bigDay = day({
  preworkout: 'banana-honey',
  breakfast: 'eggs-shake',
  lunch: 'chicken-rice',
  dinner: 'beef-egg-bowl',
  counters: { 'whey-shake': 2, 'extra-rice': 1 },
  supplements: allSupps,
})

describe('food totals and score', () => {
  it('adds up meals and top-ups', () => {
    expect(totals(food, bigDay)).toEqual({ kcal: 2340, protein: 214, carbs: 210, fat: 70 })
  })

  it('shows no score until a meal is picked', () => {
    expect(dayScore(food, DEFAULT_TARGETS, undefined)).toBeNull()
    expect(dayScore(food, DEFAULT_TARGETS, day({ counters: { 'whey-shake': 2 }, supplements: allSupps }))).toBeNull()
  })

  it('scores calories, protein, carbs, fat and supplements', () => {
    // kcal 30 (60 off) + protein 30 + carbs 9.25 (17.6% off) + fat 10 + supplements 20
    expect(dayScore(food, DEFAULT_TARGETS, bigDay)).toBe(99)
  })

  it('calories fall linearly from ±100 to 0 at ±500', () => {
    const t = { kcal: 2400, protein: 1, carbs: 44, fat: 0 }
    // Banana only: 170 kcal is far off, carbs 44 hit, protein 1/1, fat target 0 counts as hit
    expect(dayScore(food, t, day({ preworkout: 'banana-honey', supplements: allSupps }))).toBe(0 + 30 + 10 + 10 + 20)
    expect(dayScore(food, { ...t, kcal: 470 }, day({ preworkout: 'banana-honey', supplements: allSupps }))).toBe(Math.round(30 * (500 - 300) / 400) + 70)
  })

  it('magnesium is optional: missing it costs nothing, missing creatine does', () => {
    const noMag = dayScore(food, DEFAULT_TARGETS, bigDay)
    const withMag = dayScore(food, DEFAULT_TARGETS, { ...bigDay, supplements: { ...allSupps, magnesium: true } })
    expect(withMag).toBe(noMag)
    expect(dayScore(food, DEFAULT_TARGETS, { ...bigDay, supplements: { 'vitamin-d3': true } })).toBe(noMag! - 10)
  })

  it('labels the score', () => {
    expect([95, 90, 89, 75, 74, 50, 49].map(scoreLabel)).toEqual(['Dialled', 'Dialled', 'Solid', 'Solid', 'Okay', 'Okay', 'Off track'])
  })
})

describe('food data', () => {
  it('a new install is seeded with the menu and targets', () => {
    const s = seedState()
    expect(s.food.meals.lunch.map((m) => m.name)).toEqual(['Chicken & Rice', 'Shrimp & Rice'])
    expect(s.settings.foodTargets).toEqual({ kcal: 2400, protein: 190, carbs: 255, fat: 67 })
  })

  it('an existing save gains food without anything else changing', () => {
    const s = seedState() as unknown as Record<string, any>
    delete s.food
    delete s.settings.foodTargets
    s.settings.onboarded = true
    s.settings.journeyStart = today
    s.habits = [{ id: 'a', name: 'Gym', kind: 'build', days: [], createdAt: today, timeOfDay: 'morning', link: 'gym' }]
    s.checks = { [today]: ['a'] }
    const n = migrate(structuredClone(s), Date.now())
    expect(n.food.meals.breakfast).toHaveLength(2)
    expect(n.settings.foodTargets).toEqual(DEFAULT_TARGETS)
    expect(n.habits).toEqual(s.habits)
    expect(n.checks).toEqual(s.checks)
  })

  it('edited meals, targets and logs are never re-seeded over', () => {
    const s = seedState()
    s.settings.onboarded = true
    s.food.meals.lunch = [{ id: 'x', name: 'Steak', ingredients: '', kcal: 700, protein: 60, carbs: 0, fat: 40 }]
    s.food.log[today] = day({ lunch: 'x' })
    s.settings.foodTargets = { kcal: 2600, protein: 200, carbs: 280, fat: 70 }
    const n = migrate(JSON.parse(JSON.stringify(s)), Date.now())
    expect(n.food.meals.lunch.map((m) => m.name)).toEqual(['Steak'])
    expect(n.food.log[today].lunch).toBe('x')
    expect(n.settings.foodTargets!.kcal).toBe(2600)
  })

  it('start again clears what was eaten but keeps the menu', () => {
    const s = seedState()
    s.food.log[today] = bigDay
    s.food.meals.lunch.push({ id: 'x', name: 'Steak', ingredients: '', kcal: 700, protein: 60, carbs: 0, fat: 40 })
    const r = resetProgress(s, today, Date.now())
    expect(r.food.log).toEqual({})
    expect(r.food.meals.lunch).toHaveLength(3)
  })
})

describe('Today integration', () => {
  const withHabits = (): State => {
    const s = seedState()
    s.habits = [
      { id: 'hp', name: 'High-Protein meal', kind: 'build', days: [], createdAt: today, timeOfDay: 'morning' },
      { id: 'cr', name: 'Take creatine', kind: 'build', days: [], createdAt: today, timeOfDay: 'morning' },
      { id: 'vd', name: 'Vitamin D', kind: 'build', days: [], createdAt: today, timeOfDay: 'morning' },
    ]
    return s
  }

  it('ticks the high-protein habit at 150g and unticks it if protein drops back', () => {
    const s = withHabits()
    editFoodDay(s, today, (d) => void (d.lunch = 'chicken-rice')) // 64g
    expect(s.checks[today] ?? []).not.toContain('hp')
    editFoodDay(s, today, (d) => {
      d.dinner = 'beef-egg-bowl' // 115g
      d.counters['whey-shake'] = 2 // 163g
    })
    expect(s.checks[today]).toContain('hp')
    editFoodDay(s, today, (d) => void (d.dinner = null)) // 112g
    expect(s.checks[today]).not.toContain('hp')
  })

  it('leaves a high-protein habit ticked by hand alone while staying under 150g', () => {
    const s = withHabits()
    s.checks[today] = ['hp']
    editFoodDay(s, today, (d) => void (d.lunch = 'chicken-rice'))
    expect(s.checks[today]).toContain('hp')
  })

  it('ticking creatine and vitamin D ticks the matching habits', () => {
    const s = withHabits()
    editFoodDay(s, today, (d) => void (d.supplements.creatine = true))
    expect(s.checks[today]).toEqual(['cr'])
    editFoodDay(s, today, (d) => void (d.supplements['vitamin-d3'] = true))
    expect(s.checks[today]).toEqual(['cr', 'vd'])
    editFoodDay(s, today, (d) => void (d.supplements.creatine = false))
    expect(s.checks[today]).toEqual(['vd'])
  })

  it('caps top-ups at 4 and drops zeros', () => {
    const s = seedState()
    editFoodDay(s, today, (d) => void (d.counters['whey-shake'] = 9))
    expect(s.food.log[today].counters['whey-shake']).toBe(4)
    editFoodDay(s, today, (d) => void (d.counters['whey-shake'] = 0))
    expect(s.food.log[today].counters).toEqual({})
  })
})

describe('Fuel', () => {
  it('counts days scoring 80+ and the run of them', () => {
    const s = seedState()
    const poor = day({ lunch: 'chicken-rice' })
    s.food.log = { [addDays(today, -4)]: bigDay, [addDays(today, -3)]: poor, [addDays(today, -2)]: bigDay, [addDays(today, -1)]: bigDay }
    expect(fuelDays(s)).toBe(3)
    // Today not logged yet: the run up to yesterday still counts
    expect(fuelStreak(s, today)).toBe(2)
    s.food.log[today] = bigDay
    expect(fuelStreak(s, today)).toBe(3)
  })

  it('stages climb with fuelled days', () => {
    expect(fuelStage(0).name).toBe('Empty tank')
    expect(fuelStage(1).name).toBe('Spark')
    expect(fuelStage(10)).toMatchObject({ name: 'Kindled', pct: 3 / 14 })
  })

  it('supplement streaks skip an unticked today', () => {
    const f = defaultFood()
    f.log = { [addDays(today, -2)]: day({ supplements: { creatine: true } }), [addDays(today, -1)]: day({ supplements: { creatine: true } }) }
    expect(suppStreak(f, 'creatine', today)).toBe(2)
    expect(suppStreak(f, 'magnesium', today)).toBe(0)
  })
})
