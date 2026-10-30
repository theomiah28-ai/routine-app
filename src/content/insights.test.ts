import { describe, expect, it } from 'vitest'
import { parseArticle, INSIGHTS, visibleInsights } from './insights'

describe('insights', () => {
  it('parses frontmatter and body', () => {
    const a = parseArticle('x', '---\ntitle: Hello world\ncategory: mindset\nminutes: 4\n---\n\n# Body\n\nText')
    expect(a).toMatchObject({ id: 'x', title: 'Hello world', category: 'mindset', minutes: 4 })
    expect(a.body.trim().startsWith('# Body')).toBe(true)
  })

  it('loads the bundled articles', () => {
    expect(INSIGHTS.length).toBeGreaterThanOrEqual(5)
    expect(INSIGHTS.every((a) => a.title && a.category)).toBe(true)
  })

  it('hides esoteric unless enabled', () => {
    expect(visibleInsights(false).some((a) => a.category === 'esoteric')).toBe(false)
  })
})
