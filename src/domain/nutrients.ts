import type { NutrientKey, Nutrients } from '../types'

export interface NutrientDef {
  key: NutrientKey
  name: string
  unit: 'mg' | 'µg' | 'g'
  /** Daily target for an adult man */
  target: number
  why: string
}

export const NUTRIENT_GROUPS: { title: string; items: NutrientDef[] }[] = [
  {
    title: 'Hormones',
    items: [
      { key: 'zinc', name: 'Zinc', unit: 'mg', target: 11, why: 'Testosterone, thyroid' },
      { key: 'vitaminD', name: 'Vitamin D', unit: 'µg', target: 15, why: 'Testosterone, mood' },
      { key: 'magnesium', name: 'Magnesium', unit: 'mg', target: 400, why: 'Sleep, testosterone, recovery' },
      { key: 'vitaminA', name: 'Vitamin A', unit: 'µg', target: 900, why: 'Testosterone, immunity' },
    ],
  },
  {
    title: 'Thyroid',
    items: [
      { key: 'selenium', name: 'Selenium', unit: 'µg', target: 55, why: 'T4 → T3, sperm health' },
      { key: 'iodine', name: 'Iodine', unit: 'µg', target: 150, why: 'Makes thyroid hormone' },
      { key: 'iron', name: 'Iron', unit: 'mg', target: 8, why: 'Energy, oxygen' },
    ],
  },
  {
    title: 'Brain',
    items: [
      { key: 'omega3', name: 'Omega-3', unit: 'mg', target: 500, why: 'EPA + DHA: focus, mood' },
      { key: 'choline', name: 'Choline', unit: 'mg', target: 550, why: 'Focus, memory' },
      { key: 'b12', name: 'B12', unit: 'µg', target: 2.4, why: 'Nerves, energy' },
      { key: 'folate', name: 'Folate', unit: 'µg', target: 400, why: 'Brain, cell repair' },
      { key: 'b6', name: 'B6', unit: 'mg', target: 1.3, why: 'Dopamine, serotonin' },
    ],
  },
  {
    title: 'Energy & recovery',
    items: [
      { key: 'potassium', name: 'Potassium', unit: 'mg', target: 3400, why: 'Muscle, pump' },
      { key: 'vitaminC', name: 'Vitamin C', unit: 'mg', target: 90, why: 'Lowers cortisol, absorbs iron' },
      { key: 'calcium', name: 'Calcium', unit: 'mg', target: 1000, why: 'Bones, muscle contraction' },
      { key: 'fibre', name: 'Fibre', unit: 'g', target: 30, why: 'Gut health' },
    ],
  },
]

export const NUTRIENTS: NutrientDef[] = NUTRIENT_GROUPS.flatMap((g) => g.items)

export const defaultNutrientTargets = () => Object.fromEntries(NUTRIENTS.map((n) => [n.key, n.target])) as Record<NutrientKey, number>

// Rough per-portion estimates from standard food tables. Good enough to show gaps, not lab-exact.
const EGG: Nutrients = { zinc: 0.65, vitaminD: 1.1, magnesium: 6, vitaminA: 80, selenium: 15, iodine: 25, iron: 0.9, omega3: 30, choline: 147, b12: 0.45, folate: 24, b6: 0.085, potassium: 69, calcium: 28 }
const BUTTER_10G: Nutrients = { vitaminA: 68, vitaminD: 0.15, calcium: 2 }
const SOURDOUGH_SLICE: Nutrients = { zinc: 0.4, magnesium: 13, selenium: 15, iodine: 2, iron: 1, choline: 5, folate: 25, b6: 0.04, potassium: 60, calcium: 25, fibre: 1.4 }
const BANANA: Nutrients = { zinc: 0.2, magnesium: 32, vitaminA: 4, selenium: 1, iron: 0.3, choline: 12, folate: 24, b6: 0.43, potassium: 422, vitaminC: 10, calcium: 6, fibre: 3.1 }
const HONEY_TBSP: Nutrients = { potassium: 11 }
const WHEY_SCOOP: Nutrients = { zinc: 0.5, magnesium: 20, selenium: 4, iodine: 5, iron: 0.3, choline: 15, b12: 0.3, b6: 0.05, potassium: 150, calcium: 120 }
const CHICKEN_180G: Nutrients = { zinc: 1.8, vitaminD: 0.2, magnesium: 52, vitaminA: 16, selenium: 50, iodine: 4, iron: 0.8, omega3: 20, choline: 153, b12: 0.6, folate: 7, b6: 1.08, potassium: 460, calcium: 27 }
const SHRIMP_250G: Nutrients = { zinc: 4, magnesium: 87, selenium: 100, iodine: 38, iron: 1.3, omega3: 700, choline: 340, b12: 3.7, folate: 7, b6: 0.4, potassium: 425, calcium: 175 }
const RICE_150G: Nutrients = { zinc: 0.75, magnesium: 18, selenium: 11, iron: 0.3, choline: 3, folate: 5, b6: 0.14, potassium: 52, calcium: 15, fibre: 0.6 }
const VEG_150G: Nutrients = { zinc: 0.6, magnesium: 30, vitaminA: 300, selenium: 1, iron: 1, choline: 20, folate: 45, b6: 0.12, potassium: 250, vitaminC: 25, calcium: 35, fibre: 6 }
const MINCE_RAW_100G: Nutrients = { zinc: 4.8, vitaminD: 0.1, magnesium: 20, selenium: 15, iodine: 1, iron: 2.2, omega3: 20, choline: 60, b12: 2.2, folate: 6, b6: 0.35, potassium: 320, calcium: 12 }

export function sumNutrients(...parts: [Nutrients, number][]): Nutrients {
  const out: Nutrients = {}
  for (const [n, times] of parts) {
    for (const [k, v] of Object.entries(n) as [NutrientKey, number][]) out[k] = Math.round(((out[k] ?? 0) + v * times) * 100) / 100
  }
  return out
}

/** Nutrients for the seeded meals and top-ups, by id. */
export const DEFAULT_MEAL_NUTRIENTS: Record<string, Nutrients> = {
  'banana-honey': sumNutrients([BANANA, 1], [HONEY_TBSP, 1]),
  'eggs-sourdough': sumNutrients([EGG, 3], [BUTTER_10G, 1], [SOURDOUGH_SLICE, 2]),
  'eggs-shake': sumNutrients([EGG, 3], [BUTTER_10G, 1], [SOURDOUGH_SLICE, 1], [WHEY_SCOOP, 1]),
  'chicken-rice': sumNutrients([CHICKEN_180G, 1], [RICE_150G, 1], [VEG_150G, 1]),
  'shrimp-rice': sumNutrients([SHRIMP_250G, 1], [RICE_150G, 1], [VEG_150G, 1]),
  'beef-rice': sumNutrients([MINCE_RAW_100G, 2], [RICE_150G, 1], [VEG_150G, 1]),
  'beef-egg-bowl': sumNutrients([MINCE_RAW_100G, 1.5], [EGG, 2], [RICE_150G, 1], [VEG_150G, 1]),
  'whey-shake': sumNutrients([WHEY_SCOOP, 1]),
  'extra-rice': sumNutrients([RICE_150G, 2 / 3]),
  'extra-sourdough': sumNutrients([SOURDOUGH_SLICE, 1]),
}

/** What the seeded supplements add. Magnesium assumes a typical 200mg dose; edit it to match the label. */
export const DEFAULT_SUPP_NUTRIENTS: Record<string, Nutrients> = {
  creatine: {},
  'vitamin-d3': { vitaminD: 10 },
  magnesium: { magnesium: 200 },
}

export function formatAmount(v: number): string {
  if (v >= 100) return String(Math.round(v))
  if (v >= 10) return String(Math.round(v))
  return String(Math.round(v * 10) / 10)
}
