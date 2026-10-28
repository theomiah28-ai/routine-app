// Builds src/content/kjv-verses.json and kjv-chapters.json from the public-domain KJV (thiagobodruk/bible), keeping only
// the verses and chapters referenced in src/content/faith-refs.json.
// Usage: node scripts/fetch-kjv.mjs [path/to/en_kjv.json]   (downloads it when no path is given)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'

const raw = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : await (await fetch(URL)).text()
const bible = JSON.parse(raw.replace(/^﻿/, ''))
const books = new Map(bible.map((b) => [b.name, b.chapters]))
const clean = (t) => t.replace(/\{[^}]*\}/g, '').replace(/\s+([.,;:?!])/g, '$1').replace(/\s{2,}/g, ' ').trim()

function chapter(ref) {
  const m = ref.match(/^(.+) (\d+)$/)
  const ch = m && books.get(m[1])?.[Number(m[2]) - 1]
  if (!ch) throw new Error(`Missing chapter: ${ref}`)
  return ch.map(clean)
}

function verse(ref) {
  const m = ref.match(/^(.+) (\d+):(\d+)(?:-(\d+))?$/)
  if (!m) throw new Error(`Bad reference: ${ref}`)
  const ch = chapter(`${m[1]} ${m[2]}`)
  const from = Number(m[3])
  const to = Number(m[4] ?? m[3])
  const out = ch.slice(from - 1, to)
  if (out.length !== to - from + 1) throw new Error(`Missing verse: ${ref}`)
  return out.join(' ')
}

const refs = JSON.parse(readFileSync(join(root, 'src/content/faith-refs.json'), 'utf8'))
const verses = Object.fromEntries(refs.verses.map((v) => [v.ref, verse(v.ref)]))
const chapters = Object.fromEntries(refs.plans.flatMap((p) => p.days).map((r) => [r, chapter(r)]))
writeFileSync(join(root, 'src/content/kjv-verses.json'), JSON.stringify(verses))
writeFileSync(join(root, 'src/content/kjv-chapters.json'), JSON.stringify(chapters))
console.log(`wrote ${Object.keys(verses).length} verses, ${Object.keys(chapters).length} chapters`)
