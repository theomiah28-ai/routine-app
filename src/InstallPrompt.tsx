import { useEffect, useState } from 'react'
import { APP_NAME } from './config'
import { installMode, isStandalone } from './install'

type DeferredPrompt = Event & { prompt: () => Promise<void> }
const KEY = 'install-dismissed'

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px' }}>
      <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  )
}

/** Shown to visitors who opened the link in a browser: how to put the app on their home screen. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<DeferredPrompt | null>(null)
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as DeferredPrompt)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const mode = installMode(navigator.userAgent, isStandalone(), !!deferred)
  if (hidden || mode === 'none') return null

  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode: just hide for now */
    }
  }

  return (
    <div className="install">
      <div className="install-card">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={44} height={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>Install {APP_NAME}</b>
          {mode === 'ios' && <p>Tap <ShareIcon /> <b>Share</b> below, then <b>Add to Home Screen</b>. It works offline and saves your progress on your phone.</p>}
          {mode === 'ios-other-browser' && <p>Open this link in <b>Safari</b>, then tap Share → <b>Add to Home Screen</b>.</p>}
          {mode === 'android' && <p>Add it to your home screen. It works offline and saves your progress on your phone.</p>}
          {mode === 'android-menu' && <p>Tap the <b>⋮</b> menu, then <b>Add to Home screen</b> or <b>Install app</b>.</p>}
          {mode === 'desktop' && <p>Mastery is made for your phone. Open this link on your phone to install it.</p>}
          <div className="install-actions">
            {mode === 'android' && deferred && (
              <button className="btn small" onClick={() => deferred.prompt().then(() => setDeferred(null))}>Install</button>
            )}
            <button className="link muted" onClick={dismiss}>Not now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
