import { marked } from 'marked'
import { CATEGORIES, getInsight } from '../content/insights'
import { Back } from '../nav'
import { Screen } from '../ui'
import { ART } from './Learn'

export function Article({ id }: { id: string }) {
  const a = getInsight(id)
  if (!a) return <Screen><Back /></Screen>
  return (
    <Screen>
      <div className="topbar"><Back /></div>
      <div className="ins-img" style={{ height: 210, margin: '14px -20px 18px', width: 'calc(100% + 40px)', borderRadius: 0, background: a.image ? `center/cover url(${a.image})` : ART[a.category] }} />
      <span className="label gold">{CATEGORIES.find((c) => c.id === a.category)?.label} · {a.minutes} min read</span>
      <h1 style={{ marginTop: 8 }}>{a.title}</h1>
      {/* Content is our own bundled Markdown, not user input */}
      <div className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(a.body, { async: false }) as string }} />
    </Screen>
  )
}
