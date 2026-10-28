import { useRef } from 'react'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back } from '../nav'
import type { State } from '../types'

export function Settings() {
  const { state, update, replace } = useStore()
  const file = useRef<HTMLInputElement>(null)

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `routine-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importBackup = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as State
      if (data.version !== 1 || !Array.isArray(data.habits) || !Array.isArray(data.sessions)) throw new Error()
      if (!confirm('Replace everything in the app with this backup?')) return
      replace(data)
      alert('Backup restored.')
    } catch {
      alert("That file isn't a valid backup.")
    }
  }

  return (
    <div className="screen">
      <div className="topbar"><Back label="Today" /></div>
      <h1 style={{ margin: '18px 0 22px' }}>Settings</h1>

      <div className="field">
        <label>Your name</label>
        <input className="input" value={state.name} onChange={(e) => update((s) => void (s.name = e.target.value))} />
      </div>

      <div className="sec">Backup</div>
      <p className="note">Everything is stored on this phone only. Export a backup now and then so nothing's ever lost.</p>
      <button className="btn" onClick={exportBackup} style={{ marginTop: 14 }}>Export backup</button>
      <button className="btn ghost" onClick={() => file.current?.click()} style={{ marginTop: 8 }}>Import backup</button>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) importBackup(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
