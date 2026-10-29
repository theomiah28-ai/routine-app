import { describe, expect, it } from 'vitest'
import { loadState } from './load'

describe('loadState', () => {
  it('returns a fresh state when nothing is saved', () => {
    const r = loadState(undefined, Date.now())
    expect('state' in r && r.state.version).toBe(2)
  })
  it('migrates V1 data', () => {
    const r = loadState({ version: 1, habits: [], checks: {}, splitName: 'x', days: [], exercises: {}, sessions: [], active: null }, Date.now())
    expect('state' in r && r.state.version).toBe(2)
  })
  it('reports an error instead of throwing on corrupt data', () => {
    const r = loadState({ version: 1, habits: 'nope' }, Date.now())
    expect('error' in r).toBe(true)
  })
  it('reports an error for a V2 state missing its sections', () => {
    const r = loadState({ version: 2, habits: [] }, Date.now())
    expect('error' in r).toBe(true)
  })
})
