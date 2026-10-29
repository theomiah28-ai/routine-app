import { useRef, useState } from 'react'
import { APP_NAME, APP_VERSION } from '../config'
import { renderCard, shareCard } from '../cards'
import { migrate } from '../migrate'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen, Sheet, Stepper, Toggle } from '../ui'
import type { Milestone } from '../types'

const ICON: Record<Milestone['section'], string> = {
  transmutation: '∿',
  stillness: '◉',
  faith: '✝︎',
  work: '◔',
  gym: '⟛',
  routine: '✓',
  screentime: '◌',
}

export function You() {
  const { state, update, replace } = useStore()
  const { push } = useNav()
  const file = useRef<HTMLInputElement>(null)
  const [guide, setGuide] = useState(false)
  const set = state.settings

  // The share sheet ("Save to Files") is the reliable way out of a home-screen app on iPhone
  const exportBackup = async () => {
    const file = new File([JSON.stringify(state)], `crucible-backup-${todayKey()}.json`, { type: 'application/json' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Crucible backup' })
        return
      } catch {
        return
      }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(file)
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000)
  }

  const importBackup = async (f: File) => {
    try {
      const raw = JSON.parse(await f.text())
      if (!Array.isArray(raw?.habits) || !Array.isArray(raw?.sessions)) throw new Error()
      if (!confirm('Replace everything in the app with this backup?')) return
      const next = migrate(raw, Date.now())
      // A restore isn't a fresh install: skip onboarding and the migration welcome
      next.settings = { ...next.settings, onboarded: true, whatsNew: false }
      replace(next)
      alert('Backup restored.')
    } catch {
      alert("That file isn't a valid backup.")
    }
  }

  const earned = [...state.milestones].filter((m) => m.section !== 'faith' && m.section !== 'work').sort((a, b) => b.at - a.at)

  return (
    <Screen>
      <div className="date" style={{ marginTop: 8 }}>You</div>
      <h1>{set.name || 'Your settings'}</h1>

      <div className="field" style={{ marginTop: 18 }}>
        <label>Your name</label>
        <input className="input" value={set.name} onChange={(e) => update((s) => void (s.settings.name = e.target.value))} placeholder="Your first name" />
      </div>

      <div className="sec">Milestones</div>
      {earned.length ? (
        <div className="ms-grid">
          {earned.map((m) => (
            <button key={m.id} className="ms-mini" onClick={async () => shareCard(await renderCard(m), m.title)}>
              <span className="ms-icon">{ICON[m.section]}</span>
              <b>{m.value}</b>
              <small>{m.title}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="note">Your milestone cards collect here. Tap one to share it.</p>
      )}

      <div className="sec">Practice</div>
      <div className="setting">
        <span>Morning Sit length<div className="sub" style={{ fontSize: 12 }}>{state.stillness.sitMinutes} min</div></span>
        <Stepper value={state.stillness.sitMinutes} step={5} min={5} onChange={(v) => update((s) => void (s.stillness.sitMinutes = v))} />
      </div>
      <div className="setting">
        <span>Gym rest timer<div className="sub" style={{ fontSize: 12 }}>{Math.floor(set.restSeconds / 60)}:{String(set.restSeconds % 60).padStart(2, '0')}</div></span>
        <Stepper value={set.restSeconds} step={15} min={15} onChange={(v) => update((s) => void (s.settings.restSeconds = v))} />
      </div>
      <div className="setting">
        <span>Show esoteric teachings<div className="sub" style={{ fontSize: 12 }}>Deeper material in Learn, off unless you want it</div></span>
        <Toggle on={set.showEsoteric} onChange={(v) => update((s) => void (s.settings.showEsoteric = v))} />
      </div>
      <div className="setting" style={{ opacity: 0.6 }}>
        <span>Reminders<div className="sub" style={{ fontSize: 12 }}>Morning, wind-down and nudges</div></span>
        <span className="placeholder-tag">coming soon</span>
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
      <button className="add-row" style={{ marginTop: 6 }} onClick={() => setGuide(true)}>Get the new name and icon on your home screen ›</button>

      <p className="hint" style={{ marginTop: 26 }}>{APP_NAME} · v{APP_VERSION} · by Foundry</p>

      <Sheet open={guide} onClose={() => setGuide(false)}>
        <h2 className="title">New name and icon</h2>
        <p className="note" style={{ margin: '6px 0 14px' }}>iPhone keeps the old name on an app that's already installed. To switch without losing anything:</p>
        <ol className="steps">
          <li><b>Export a backup</b> and choose <b>Save to Files</b>.</li>
          <li>Open the Files app and <b>check the backup file is there</b>. Don't go on until it is: deleting the app deletes its data.</li>
          <li>Delete the old app from your home screen, open the link in Safari, then Share → <b>Add to Home Screen</b>.</li>
          <li>Open the new app, go to You → <b>Import backup</b>, and pick the file.</li>
        </ol>
        <button className="btn" onClick={exportBackup}>Export backup now</button>
      </Sheet>
    </Screen>
  )
}
