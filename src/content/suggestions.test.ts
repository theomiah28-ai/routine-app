import { describe, expect, it } from 'vitest'
import { SUGGESTIONS, suggestFor } from './suggestions'

describe('suggestFor', () => {
  it('matches goals, best matches first', () => {
    const s = suggestFor(['focus', 'money'])
    expect(s.length).toBeGreaterThan(0)
    expect(s.every((x) => x.goals.some((g) => g === 'focus' || g === 'money'))).toBe(true)
    expect(s[0].goals.filter((g) => g === 'focus' || g === 'money').length).toBe(2)
  })
  it('no goals, no suggestions', () => expect(suggestFor([])).toEqual([]))
  it('only links to the three sections', () => {
    expect(SUGGESTIONS.every((x) => !x.link || ['transmutation', 'stillness', 'gym'].includes(x.link))).toBe(true)
  })
})
