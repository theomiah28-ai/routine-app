import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { StoreProvider } from './store'
import { App } from './App'
import { ErrorBoundary } from './Recovery'
import { InstallPrompt } from './InstallPrompt'
import './styles.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
      <InstallPrompt />
    </ErrorBoundary>
  </StrictMode>,
)
