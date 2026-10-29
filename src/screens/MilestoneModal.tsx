import { useEffect, useState } from 'react'
import { renderCard, shareCard } from '../cards'
import type { Milestone } from '../types'

export function MilestoneModal({ m, onClose }: { m: Milestone; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    let u: string | null = null
    renderCard(m).then((b) => {
      setBlob(b)
      u = URL.createObjectURL(b)
      setUrl(u)
    })
    return () => {
      if (u) URL.revokeObjectURL(u)
    }
  }, [m])

  return (
    <div className="ms-wrap" role="dialog">
      <div className="ms-burst" />
      <div className="ms-inner">
        <div className="label gold" style={{ textAlign: 'center' }}>Milestone</div>
        <h2 className="title" style={{ textAlign: 'center', marginTop: 6 }}>{m.title}</h2>
        <div className="ms-card">{url ? <img src={url} alt={m.title} /> : <div style={{ aspectRatio: '4 / 5' }} />}</div>
        <button className="btn" disabled={!blob} onClick={() => blob && shareCard(blob, m.title)}>Share</button>
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
