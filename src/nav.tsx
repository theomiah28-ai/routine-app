import { createContext, useContext } from 'react'

export type Tab = 'today' | 'journey' | 'learn' | 'you'

export type Route =
  | { name: 'today' }
  | { name: 'habit'; id: string }
  | { name: 'habitEdit'; id?: string }
  | { name: 'gym' }
  | { name: 'dayEdit'; id: string }
  | { name: 'exercise'; id: string }
  | { name: 'workout' }
  | { name: 'transmutation' }
  | { name: 'stage'; index: number }
  | { name: 'urge' }
  | { name: 'stillness' }
  | { name: 'sit' }
  | { name: 'breath'; id: 'box' | 'power' | 'calm' }
  | { name: 'visualise'; id: string }
  | { name: 'faith' }
  | { name: 'plans' }
  | { name: 'reader'; ref: string; planDay?: boolean }
  | { name: 'work'; startFocus?: boolean }
  | { name: 'screentime' }
  | { name: 'journey' }
  | { name: 'progress' }
  | { name: 'learn' }
  | { name: 'article'; id: string }
  | { name: 'you' }
  | { name: 'morning' }
  | { name: 'evening' }
  | { name: 'onboarding' }

/** Routes that take over the whole screen (no tab bar). */
export const FULLSCREEN = new Set<Route['name']>(['workout', 'sit', 'breath', 'visualise', 'urge', 'morning', 'evening', 'onboarding'])

export const NavCtx = createContext<{
  push: (r: Route) => void
  pop: () => void
  reset: () => void
  switchTab: (t: Tab) => void
} | null>(null)

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
