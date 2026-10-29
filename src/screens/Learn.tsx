import { useState } from 'react'
import { CATEGORIES, visibleInsights, type Insight, type InsightCategory } from '../content/insights'
import { useStore } from '../store'
import { useNav } from '../nav'
import { Screen } from '../ui'

export const ART: Record<InsightCategory, string> = {
  mindset: 'radial-gradient(70% 80% at 30% 30%, #4a3a1a, #120f09)',
  neuroplasticity: 'radial-gradient(70% 80% at 60% 30%, #2a3442, #0b0e12)',
  identity: 'radial-gradient(70% 80% at 40% 40%, #3a2a3a, #100c10)',
  subconscious: 'radial-gradient(70% 80% at 50% 70%, #1e2a2a, #090c0c)',
  transmutation: 'radial-gradient(55% 70% at 50% 60%, rgba(232,196,106,0.55), transparent 70%), linear-gradient(160deg, #2a1f0c, #0e0c08)',
  esoteric: 'radial-gradient(60% 70% at 50% 50%, #3a2a12, #0a0806)',
}

const label = (c: InsightCategory) => CATEGORIES.find((x) => x.id === c)!.label

function Thumb({ a, big }: { a: Insight; big?: boolean }) {
  return <div className="ins-img" style={{ height: big ? 150 : 84, background: a.image ? `center/cover url(${a.image})` : ART[a.category] }} />
}

export function Learn() {
  const { state } = useStore()
  const { push } = useNav()
  const [cat, setCat] = useState<InsightCategory | 'all'>('all')
  const all = visibleInsights(state.settings.showEsoteric)
  const shown = all.filter((a) => cat === 'all' || a.category === cat)
  const cats = CATEGORIES.filter((c) => all.some((a) => a.category === c.id))
  const [featured, ...rest] = shown

  return (
    <Screen>
      <div className="date" style={{ marginTop: 8 }}>Learn</div>
      <h1>Understand your mind</h1>
      <div className="pills" style={{ marginTop: 14 }}>
        <button className={'pill-btn' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>For you</button>
        {cats.map((c) => (
          <button key={c.id} className={'pill-btn' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{c.label}</button>
        ))}
      </div>

      {featured && (
        <button className="ins" style={{ marginTop: 14 }} onClick={() => push({ name: 'article', id: featured.id })}>
          <Thumb a={featured} big />
          <div className="ins-tx">
            <span className="label gold">{label(featured.category)} · {featured.minutes} min</span>
            <b style={{ fontSize: 18 }}>{featured.title}</b>
          </div>
        </button>
      )}
      <div className="ins-grid">
        {rest.map((a) => (
          <button key={a.id} className="ins" onClick={() => push({ name: 'article', id: a.id })}>
            <Thumb a={a} />
            <div className="ins-tx">
              <span className="label">{label(a.category)}</span>
              <b>{a.title}</b>
            </div>
          </button>
        ))}
      </div>
      {!state.settings.showEsoteric && <p className="hint" style={{ marginTop: 18 }}>Esoteric teachings can be switched on in You.</p>}
    </Screen>
  )
}
