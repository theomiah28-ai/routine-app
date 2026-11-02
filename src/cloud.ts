import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from './config'
import type { RemoteRow } from './sync'
import type { State } from './types'

/** Accounts switch on once the publishable key is set; until then the app runs local-only. */
export const accountsEnabled = !!SUPABASE_KEY

let client: SupabaseClient | null = null
export function cloud(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  return client
}

export async function currentSession(): Promise<Session | null> {
  const { data } = await cloud().auth.getSession()
  return data.session
}

/** Emails a 6-digit sign-in code (creates the account on first use). */
export async function sendCode(email: string): Promise<void> {
  const { error } = await cloud().auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  if (error) throw error
}

export async function verifyCode(email: string, code: string): Promise<Session> {
  const { data, error } = await cloud().auth.verifyOtp({ email, token: code, type: 'email' })
  if (error || !data.session) throw error ?? new Error('That code didn’t work')
  return data.session
}

export async function signOut(): Promise<void> {
  await cloud().auth.signOut()
}

const withTimeout = <T,>(p: PromiseLike<T>, ms: number) =>
  Promise.race([Promise.resolve(p), new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

/** This user's saved copy, or null if they have none yet. Throws when offline. */
export async function fetchRemote(userId: string): Promise<RemoteRow | null> {
  const { data, error } = await withTimeout(cloud().from('app_state').select('state, updated_at').eq('user_id', userId).maybeSingle(), 6000)
  if (error) throw error
  return data ? { state: data.state as State, updatedAt: Number(data.updated_at) } : null
}

export async function pushRemote(userId: string, state: State): Promise<void> {
  const { error } = await cloud()
    .from('app_state')
    .upsert({ user_id: userId, state, updated_at: state.meta?.updatedAt ?? Date.now() })
  if (error) throw error
}
