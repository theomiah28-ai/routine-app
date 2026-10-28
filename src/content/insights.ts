// Insights library. Each article is a Markdown file in ./insights with a frontmatter block.
// Drop a new .md file in that folder and it appears in the app.

export type InsightCategory = 'mindset' | 'neuroplasticity' | 'identity' | 'subconscious' | 'transmutation' | 'esoteric'

export const CATEGORIES: { id: InsightCategory; label: string }[] = [
  { id: 'mindset', label: 'Mindset' },
  { id: 'neuroplasticity', label: 'Neuroplasticity' },
  { id: 'identity', label: 'Identity' },
  { id: 'subconscious', label: 'Subconscious' },
  { id: 'transmutation', label: 'Transmutation' },
  { id: 'esoteric', label: 'Esoteric' },
]

export interface Insight {
  id: string
  title: string
  category: InsightCategory
  minutes: number
  image?: string
  body: string
}

export function parseArticle(id: string, raw: string): Insight {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return {
    id,
    title: meta.title ?? id,
    category: (meta.category as InsightCategory) ?? 'mindset',
    minutes: Number(meta.minutes) || 3,
    image: meta.image || undefined,
    body: m?.[2] ?? raw,
  }
}

const files = import.meta.glob('./insights/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export const INSIGHTS: Insight[] = Object.entries(files)
  .map(([path, raw]) => parseArticle(path.replace(/^.*\/|\.md$/g, ''), raw))
  .sort((a, b) => a.title.localeCompare(b.title))

export const getInsight = (id: string) => INSIGHTS.find((a) => a.id === id)

export const visibleInsights = (showEsoteric: boolean) => INSIGHTS.filter((a) => showEsoteric || a.category !== 'esoteric')
