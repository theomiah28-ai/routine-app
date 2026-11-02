import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import { V1_BACKUP_KEY } from './migrate'
import { loadState } from './load'
import { Recovery } from './Recovery'
import { fetchRemote, pushRemote } from './cloud'
import { reconcile } from './sync'
import type { State } from './types'

type Update = (fn: (s: State) => void) => void

const Ctx = createContext<{ state: State; update: Update; replace: (s: State) => void } | null>(null)

/** Loads this phone's copy; with a signed-in user, reconciles it with their account and keeps the account up to date. */
export function StoreProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latest = useRef<State | null>(null)
  latest.current = state
  // The account copy is behind this phone's copy and needs uploading
  const dirty = useRef(false)
  const first = useRef(true)

  useEffect(() => {
    navigator.storage?.persist?.()
    ;(async () => {
      try {
        const saved = await get('state')
        if (saved && saved.version !== 2) await set(V1_BACKUP_KEY, saved)
        const r = loadState(saved, Date.now())
        if ('error' in r) return setError(r.error)
        if (!userId) return setState(r.state)
        let remote = null
        let online = true
        try {
          remote = await fetchRemote(userId)
        } catch {
          online = false
        }
        const decided = reconcile(saved ? r.state : null, remote, userId)
        setState(decided.state)
        if (decided.push || !online) dirty.current = true
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [])

  useEffect(() => {
    if (!state) return
    const t = setTimeout(() => set('state', state), 150)
    return () => clearTimeout(t)
  }, [state])

  // Upload to the account shortly after changes settle, and retry when back online
  const upload = () => {
    if (!userId || !latest.current || !dirty.current) return
    const snapshot = latest.current
    pushRemote(userId, snapshot).then(
      () => latest.current === snapshot && (dirty.current = false),
      () => {},
    )
  }
  useEffect(() => {
    if (!state || !userId) return
    if (first.current) first.current = false
    else dirty.current = true
    const t = setTimeout(upload, 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId])

  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden' && latest.current) {
        set('state', latest.current)
        upload()
      }
    }
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('online', upload)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('online', upload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Never save over the stored data when it couldn't be loaded
  if (error) return <Recovery error={error} />
  if (!state) return null

  const stamp = (s: State): State => ({ ...s, meta: { ...s.meta, updatedAt: Date.now() } })
  const update: Update = (fn) =>
    setState((s) => {
      const next = structuredClone(s!)
      fn(next)
      return stamp(next)
    })

  return <Ctx.Provider value={{ state, update, replace: (s) => setState(stamp({ ...s, meta: { ...s.meta, ownerId: userId ?? s.meta?.ownerId, updatedAt: 0 } })) }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}
