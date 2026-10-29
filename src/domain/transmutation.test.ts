import { describe, expect, it } from 'vitest'
import { stageIndex } from './transmutation'

describe('transmutation stages', () => {
  it('stage at 0 days is Foundation (0)', () => expect(stageIndex(0)).toBe(0))
  it('stage at 6 days is still Foundation', () => expect(stageIndex(6)).toBe(0))
  it('day 7 reaches Creation', () => expect(stageIndex(7)).toBe(1))
  it('stage at 42 days is 3 (Magnetism)', () => expect(stageIndex(42)).toBe(3))
  it('stage at 365 is 6', () => expect(stageIndex(365)).toBe(6))
})
