import { seedState } from './seed'
import type { State } from './types'

export interface RemoteRow {
  state: State
  updatedAt: number
}

const hasData = (s: State | null) => !!s && s.settings.onboarded

/**
 * Decide what a signed-in user should see, given this phone's copy and their account's copy.
 * `push` says whether this phone's copy should be uploaded to their account.
 */
export function reconcile(local: State | null, remote: RemoteRow | null, userId: string): { state: State; push: boolean } {
  const claim = (s: State) => ({ ...s, meta: { updatedAt: s.meta?.updatedAt ?? Date.now(), ownerId: userId } })

  // Another person's data on this phone is never shown to this user
  const mine = local && (!local.meta?.ownerId || local.meta.ownerId === userId) ? local : null

  if (remote && (!hasData(mine) || remote.updatedAt >= (mine?.meta?.updatedAt ?? 0))) {
    return { state: claim(remote.state), push: false }
  }
  if (hasData(mine)) return { state: claim(mine!), push: true }
  return { state: claim(seedState()), push: false }
}
