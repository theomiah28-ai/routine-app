import { useEffect, useState } from 'react'
import { APP_NAME } from './config'
import { sendCode, verifyCode } from './cloud'
import { Screen } from './ui'

/** Email → 6-digit code. A code (not a link) keeps sign-in inside the installed app on iPhone. */
export function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (!wait) return
    const t = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const valid = /^\S+@\S+\.\S+$/.test(email.trim())

  const send = async () => {
    setBusy(true)
    setError(null)
    try {
      await sendCode(email.trim().toLowerCase())
      setSent(true)
      setWait(60)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t send the code. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const verify = async (c = code) => {
    if (c.length < 6) return
    setBusy(true)
    setError(null)
    try {
      await verifyCode(email.trim().toLowerCase(), c)
      // The auth listener in AuthGate takes it from here
    } catch {
      setError('That code didn’t work. Check it, or send a new one.')
      setBusy(false)
    }
  }

  return (
    <Screen bg="gold" full>
      <div style={{ marginTop: 70 }}>
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={64} height={64} style={{ borderRadius: 16 }} />
        <h1 style={{ fontSize: 36, marginTop: 18 }}>{APP_NAME}</h1>
        <p className="prose-p" style={{ marginTop: 6 }}>Master your energy, your mind and your body.</p>

        {!sent ? (
          <div className="field" style={{ marginTop: 30 }}>
            <label>Sign in or create your account</label>
            <input
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && valid && send()}
              placeholder="you@email.com"
              autoFocus
            />
            <p className="note" style={{ marginTop: 10 }}>We'll email you a 6-digit code. No password needed.</p>
          </div>
        ) : (
          <div className="field" style={{ marginTop: 30 }}>
            <label>Enter the code sent to {email.trim()}</label>
            <input
              className="input code-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const c = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(c)
                if (c.length === 6) verify(c)
              }}
              placeholder="000000"
              autoFocus
            />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="link muted" onClick={() => { setSent(false); setCode(''); setError(null) }}>‹ Different email</button>
              <button className="link gold" disabled={wait > 0 || busy} style={{ opacity: wait > 0 ? 0.4 : 1 }} onClick={send}>
                {wait > 0 ? `Resend in ${wait}s` : 'Resend code'}
              </button>
            </div>
          </div>
        )}
        {error && <p className="note" style={{ color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
      </div>

      <div className="dock">
        {!sent ? (
          <button className="btn" disabled={!valid || busy} onClick={send}>{busy ? 'Sending…' : 'Send my code'}</button>
        ) : (
          <button className="btn" disabled={code.length < 6 || busy} onClick={() => verify()}>{busy ? 'Checking…' : 'Sign in'}</button>
        )}
      </div>
    </Screen>
  )
}
