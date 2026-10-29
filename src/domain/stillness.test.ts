import { describe, expect, it } from 'vitest'
import { eyeStage, logPractice, sitDoneOn, sitStreak } from './stillness'
import { addDays, parseKey, todayKey } from '../dates'
import type { PracticeLog, StillnessState } from '../types'

const today = todayKey()
const at = (key: string, h = 7) => parseKey(key).getTime() + h * 3600e3
const sit = (key: string, minutes = 30, completed = true): PracticeLog => ({ id: key + minutes, kind: 'sit', start: at(key), minutes, completed })
const st = (logs: PracticeLog[]): StillnessState => ({ sitMinutes: 30, logs })

describe('stillness', () => {
  it('eye stage from minutes', () => {
    expect(eyeStage(0)).toMatchObject({ index: 0, name: 'Closed', nextAt: 60 })
    expect(eyeStage(860)).toMatchObject({ index: 2, name: 'Waking', nextAt: 1500 })
    expect(eyeStage(1500)).toMatchObject({ index: 3, name: 'Clarity', nextAt: 3000 })
    expect(eyeStage(365 * 60)).toMatchObject({ index: 7, name: 'Awake', nextAt: null, openness: 1 })
    expect(eyeStage(0).openness).toBeGreaterThan(0)
  })

  it('openness grows within a stage', () => {
    expect(eyeStage(1000).openness).toBeGreaterThan(eyeStage(700).openness)
  })

  it('partial sit counts minutes not streak', () => {
    const s = st([sit(today, 12, false)])
    expect(sitDoneOn(s, today)).toBe(false)
    expect(sitStreak(s, today)).toBe(0)
  })

  it('sitDoneOn true only for completed sit', () => {
    const s = st([{ ...sit(today), kind: 'box' }, sit(addDays(today, -1))])
    expect(sitDoneOn(s, today)).toBe(false)
    expect(sitDoneOn(s, addDays(today, -1))).toBe(true)
  })

  it('sit streak counts consecutive days and today does not break it', () => {
    const s = st([sit(addDays(today, -1)), sit(addDays(today, -2)), sit(addDays(today, -4))])
    expect(sitStreak(s, today)).toBe(2)
    expect(sitStreak(logPractice(s, sit(today)), today)).toBe(3)
  })
})
