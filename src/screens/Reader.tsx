import { useEffect, useState } from 'react'
import { loadChapter } from '../content/faith'
import { completeReading, faithDone } from '../domain/faith'
import { todayKey } from '../dates'
import { useStore } from '../store'
import { Back, useNav } from '../nav'
import { Screen } from '../ui'

export function Reader({ chapter: chapterRef, planDay }: { chapter: string; planDay?: boolean }) {
  const { state, update } = useStore()
  const { pop } = useNav()
  const [verses, setVerses] = useState<string[] | null>(null)
  const today = todayKey()
  const read = faithDone(state.faith, today, 'reading')

  useEffect(() => {
    loadChapter(chapterRef).then(setVerses)
  }, [chapterRef])

  return (
    <Screen full>
      <div className="topbar"><Back label="Faith" /></div>
      <div className="label gold" style={{ marginTop: 16 }}>King James Version</div>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, fontSize: 34, marginBottom: 18 }}>{chapterRef}</h1>
      {verses === null ? (
        <div className="empty">Opening…</div>
      ) : (
        <div className="scripture">
          {verses.map((v, i) => (
            <span key={i}>
              <sup>{i + 1}</sup>
              {v}{' '}
            </span>
          ))}
        </div>
      )}
      {planDay && verses && (
        <div className="dock">
          {read ? (
            <button className="btn ghost" onClick={pop}>Read today ✓</button>
          ) : (
            <button
              className="btn"
              onClick={() => {
                update((s) => void (s.faith = completeReading(s.faith, today)))
                pop()
              }}
            >
              Mark as read
            </button>
          )}
        </div>
      )}
    </Screen>
  )
}
