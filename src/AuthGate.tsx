import { useEffect, useState, type ReactNode } from 'react'
import { accountsEnabled, cloud, currentSession } from './cloud'
import { SignIn } from './SignIn'

/** Signed in → renders the app for that user. Accounts not configured → runs the app local-only. */
export function AuthGate({ children }: { children: (userId: string | undefined, email: string | undefined) => ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null | undefined>(accountsEnabled ? undefined : null)

  useEffect(() => {
    if (!accountsEnabled) return
    currentSession().then((s) => setUser(s ? { id: s.user.id, email: s.user.email } : null))
    const { data } = cloud().auth.onAuthStateChange((_e, s) => setUser(s ? { id: s.user.id, email: s.user.email } : null))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!accountsEnabled) return <>{children(undefined, undefined)}</>
  if (user === undefined) return null
  if (!user) return <SignIn />
  // Keyed by user so switching accounts reloads that person's data from scratch
  return <div key={user.id}>{children(user.id, user.email)}</div>
}
