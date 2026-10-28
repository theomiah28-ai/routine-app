import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import { seedState } from './seed'
import { migrate, V1_BACKUP_KEY } from './migrate'
import type { State } from './types'

type Update = (fn: (s: State) => void) => void

const Ctx = createContext<{ state: State; update: Update; replace: (s: State) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State | null>(null)
  const latest = useRef<State | null>(null)
  latest.current = state

  useEffect(() => {
    navigator.storage?.persist?.()
    get('state').then(async (saved) => {
      if (!saved) return setState(seedState())
      if (saved.version !== 2) await set(V1_BACKUP_KEY, saved)
      setState(migrate(saved, Date.now()))
    })
  }, [])

  useEffect(() => {
    if (!state) return
    const t = setTimeout(() => set('state', state), 150)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden' && latest.current) set('state', latest.current)
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [])

  if (!state) return null

  const update: Update = (fn) =>
    setState((s) => {
      const next = structuredClone(s!)
      fn(next)
      return next
    })

  return <Ctx.Provider value={{ state, update, replace: setState }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
