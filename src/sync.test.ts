import { describe, expect, it } from 'vitest'
import { reconcile } from './sync'
import { seedState } from './seed'
import type { State } from './types'

const used = (updatedAt: number, ownerId?: string): State => {
  const s = seedState()
  s.settings.onboarded = true
  s.settings.name = 'Theo'
  s.meta = { updatedAt, ownerId }
  return s
}

describe('reconcile', () => {
  it('brand-new user on a fresh phone starts fresh and saves nothing yet', () => {
    const r = reconcile(seedState(), null, 'u1')
    expect(r.push).toBe(false)
    expect(r.state.settings.onboarded).toBe(false)
    expect(r.state.meta?.ownerId).toBe('u1')
  })

  it('signing in on a new phone brings their account down', () => {
    const remote = used(500, 'u1')
    const r = reconcile(seedState(), { state: remote, updatedAt: 500 }, 'u1')
    expect(r.state.settings.name).toBe('Theo')
    expect(r.push).toBe(false)
  })

  it('existing data from before accounts is claimed and uploaded on first sign-in', () => {
    const r = reconcile(used(100), null, 'u1')
    expect(r.state.settings.name).toBe('Theo')
    expect(r.state.meta?.ownerId).toBe('u1')
    expect(r.push).toBe(true)
  })

  it('the newer copy wins between phone and account', () => {
    expect(reconcile(used(900, 'u1'), { state: used(500, 'u1'), updatedAt: 500 }, 'u1').push).toBe(true)
    const r = reconcile(used(100, 'u1'), { state: { ...used(800, 'u1'), habits: [] }, updatedAt: 800 }, 'u1')
    expect(r.push).toBe(false)
    expect(r.state.meta?.updatedAt).toBe(800)
  })

  it("never shows one person's data to another person on the same phone", () => {
    const someoneElses = used(999, 'u2')
    const fresh = reconcile(someoneElses, null, 'u1')
    expect(fresh.state.settings.onboarded).toBe(false)
    expect(fresh.state.meta?.ownerId).toBe('u1')
    expect(fresh.push).toBe(false)
    const theirs = reconcile(someoneElses, { state: used(10, 'u1'), updatedAt: 10 }, 'u1')
    expect(theirs.state.meta?.updatedAt).toBe(10)
  })
})
