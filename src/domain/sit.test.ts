import { describe, expect, it } from 'vitest'
import { finishSit, sitLeft } from './sit'
import { parseKey, todayKey, addDays } from '../dates'
import type { StillnessState } from '../types'

const start = parseKey(addDays(todayKey(), -1)).getTime() + 23.5 * 3600e3 // 23:30 yesterday
const base = (): StillnessState => ({ sitMinutes: 30, logs: [], activeSit: { start, minutes: 30 } })

describe('sit sessions', () => {
  it('time left is measured from the saved start', () => {
    expect(sitLeft(base().activeSit!, start + 10 * 60e3)).toBe(20 * 60e3)
    expect(sitLeft(base().activeSit!, start + 99 * 60e3)).toBe(0)
  })
  it('completed sit logs full minutes, clears the active sit, and is dated by its start', () => {
    const r = finishSit(base(), true, start + 31 * 60e3)
    expect(r.stillness.activeSit).toBeNull()
    expect(r.stillness.logs[0]).toMatchObject({ kind: 'sit', minutes: 30, completed: true, start })
    expect(r.dayKey).toBe(addDays(todayKey(), -1))
  })
  it('partial sit counts minutes up to when the app was left', () => {
    const s = base()
    s.activeSit!.hiddenAt = start + 12 * 60e3
    const r = finishSit(s, false, start + 300 * 60e3)
    expect(r.stillness.logs[0]).toMatchObject({ minutes: 12, completed: false })
  })
  it('partial sit with no time sits logs nothing', () => {
    expect(finishSit(base(), false, start).stillness.logs).toEqual([])
  })
})
