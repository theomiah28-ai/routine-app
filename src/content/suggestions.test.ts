import { describe, expect, it } from 'vitest'
import { suggestFor } from './suggestions'

describe('suggestFor', () => {
  it('matches goals, best matches first', () => {
    const s = suggestFor(['focus', 'money'], true)
    expect(s.length).toBeGreaterThan(0)
    expect(s.every((x) => x.goals.some((g) => g === 'focus' || g === 'money'))).toBe(true)
    expect(s[0].goals.filter((g) => g === 'focus' || g === 'money').length).toBe(2)
  })
  it('no goals, no suggestions', () => expect(suggestFor([], true)).toEqual([]))
  it('faith off hides faith habits', () => {
    expect(suggestFor(['god', 'sleep'], false).some((x) => x.goals.includes('god'))).toBe(false)
    expect(suggestFor(['god'], true).some((x) => x.link === 'faith')).toBe(true)
  })
})
