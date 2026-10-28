import { describe, expect, it } from 'vitest'
import { setInput, startFocus, stopFocus, totals, workHit, workLog, workStreak } from './work'
import { addDays, parseKey, todayKey, weekday } from '../dates'
import type { WorkState } from '../types'

const today = todayKey()
const T = { videos: 2, products: 1, hoursWorked: 6, deepMinutes: 120 }
const full = { videos: 2, products: 1, hoursWorked: 6, deepMinutes: 120 }
const w = (over: Partial<WorkState> = {}): WorkState => ({ createdAt: addDays(today, -30), targets: T, days: [], log: {}, focusStart: null, ...over })

describe('work', () => {
  it('workLog defaults to zeros', () => {
    expect(workLog(w(), today)).toEqual({ videos: 0, products: 0, hoursWorked: 0, deepMinutes: 0 })
  })

  it('hit requires all targets', () => {
    expect(workHit(w({ log: { [today]: full } }), today)).toBe(true)
    expect(workHit(w({ log: { [today]: { ...full, videos: 1 } } }), today)).toBe(false)
  })

  it('zero target ignored', () => {
    const s = w({ targets: { ...T, products: 0 }, log: { [today]: { ...full, products: 0 } } })
    expect(workHit(s, today)).toBe(true)
  })

  it('all-zero targets never count as a hit', () => {
    expect(workHit(w({ targets: { videos: 0, products: 0, hoursWorked: 0, deepMinutes: 0 } }), today)).toBe(false)
  })

  it('streak skips unscheduled days', () => {
    const y = addDays(today, -1)
    const y2 = addDays(today, -2)
    // schedule every day except the day before yesterday
    const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== weekday(y2))
    const s = w({ days, log: { [y]: full, [addDays(today, -3)]: full } })
    expect(workStreak(s, today)).toBe(2)
  })

  it('stopFocus adds minutes to the start day', () => {
    const start = parseKey(today).getTime() + 9 * 3600e3
    let s = startFocus(w(), start)
    expect(s.focusStart).toBe(start)
    s = stopFocus(s, start + 50 * 60e3)
    expect(s.focusStart).toBeNull()
    expect(workLog(s, today).deepMinutes).toBe(50)
  })

  it('setInput sets one field', () => {
    const s = setInput(w(), today, 'videos', 3)
    expect(workLog(s, today)).toMatchObject({ videos: 3, products: 0 })
  })

  it('totals sums range', () => {
    const s = w({ log: { [today]: full, [addDays(today, -1)]: { ...full, videos: 5 }, [addDays(today, -9)]: full } })
    expect(totals(s, addDays(today, -6), today).videos).toBe(7)
  })
})
