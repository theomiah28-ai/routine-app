import { createContext, useContext } from 'react'

export type Route =
  | { name: 'today' }
  | { name: 'habit'; id: string }
  | { name: 'habitEdit'; id?: string }
  | { name: 'settings' }
  | { name: 'gym' }
  | { name: 'dayEdit'; id: string }
  | { name: 'exercise'; id: string }
  | { name: 'workout' }

export const NavCtx = createContext<{ push: (r: Route) => void; pop: () => void; reset: () => void } | null>(null)

export function useNav() {
  const ctx = useContext(NavCtx)
  if (!ctx) throw new Error('useNav outside provider')
  return ctx
}

export function Back({ label = 'Back' }: { label?: string }) {
  const { pop } = useNav()
  return (
    <button className="link muted" onClick={pop}>
      ‹ {label}
    </button>
  )
}
