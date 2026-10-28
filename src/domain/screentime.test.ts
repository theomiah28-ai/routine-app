import { describe, expect, it } from 'vitest'
import { brainState, todayMinutes, SAMPLE_TOTAL } from './screentime'
import type { ScreenTimeState } from '../types'

const st: ScreenTimeState = { limit: 120, foggy: 120, rotting: 240, manual: {} }

describe('screen time', () => {
  it('thresholds', () => {
    expect(brainState(119, st)).toBe('sharp')
    expect(brainState(120, st)).toBe('foggy')
    expect(brainState(239, st)).toBe('foggy')
    expect(brainState(240, st)).toBe('rotting')
  })
  it('manual entry beats the sample', () => {
    expect(todayMinutes(st, '2026-10-28')).toBe(SAMPLE_TOTAL)
    expect(todayMinutes({ ...st, manual: { '2026-10-28': 45 } }, '2026-10-28')).toBe(45)
  })
})
