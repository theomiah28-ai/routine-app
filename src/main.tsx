import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { StoreProvider } from './store'
import { App } from './App'
import { ErrorBoundary } from './Recovery'
import { InstallPrompt } from './InstallPrompt'
import { AuthGate } from './AuthGate'
import { AccountCtx } from './account'
import './styles.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthGate>
        {(userId, email) => (
          <AccountCtx.Provider value={{ userId, email }}>
            <StoreProvider userId={userId}>
              <App />
            </StoreProvider>
          </AccountCtx.Provider>
        )}
      </AuthGate>
      <InstallPrompt />
    </ErrorBoundary>
  </StrictMode>,
)
