import { getInsight } from '../content/insights'
import { useNav } from '../nav'

/** "Why? ›" link into an Insights article. Renders nothing when the article doesn't exist. */
export function WhyLink({ insightId, label = 'Why this works' }: { insightId?: string; label?: string }) {
  const { push } = useNav()
  const a = insightId ? getInsight(insightId) : undefined
  if (!a) return null
  return (
    <button className="card" style={{ marginTop: 16 }} onClick={() => push({ name: 'article', id: a.id })}>
      <span className="grow">{label}<small>{a.title} · {a.minutes} min</small></span>
      <span className="chev">›</span>
    </button>
  )
}
