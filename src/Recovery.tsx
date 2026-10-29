import { Component, type ReactNode } from 'react'
import { get } from 'idb-keyval'
import { V1_BACKUP_KEY } from './migrate'

/** Saves everything stored on the phone, straight from IndexedDB, without needing the app to work. */
export async function exportRaw() {
  const data = { state: await get('state'), v1Backup: await get(V1_BACKUP_KEY), exportedAt: new Date().toISOString() }
  const file = new File([JSON.stringify(data)], `mastery-rescue-${Date.now()}.json`, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Mastery data' })
      return
    } catch {
      /* cancelled: fall through to download */
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000)
}

export function Recovery({ error }: { error: string }) {
  return (
    <div className="screen full" style={{ paddingTop: 'calc(var(--safe-top) + 60px)' }}>
      <div className="label gold">Something went wrong</div>
      <h1>Your data is safe</h1>
      <p className="note" style={{ marginTop: 10 }}>
        The app couldn't open your saved data, so it hasn't touched it. Save a copy now and send it over so it can be fixed.
      </p>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--faint)', marginTop: 14 }}>{error}</pre>
      <button className="btn" style={{ marginTop: 20 }} onClick={exportRaw}>Save a copy of my data</button>
      <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => location.reload()}>Try again</button>
    </div>
  )
}

/** Catches render errors anywhere in the app and shows the recovery screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? `${e.message}\n${e.stack?.split('\n').slice(0, 3).join('\n') ?? ''}` : String(e) }
  }
  render() {
    return this.state.error ? <Recovery error={this.state.error} /> : this.props.children
  }
}
