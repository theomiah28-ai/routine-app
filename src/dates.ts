const pad = (n: number) => String(n).padStart(2, '0')

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function weekday(key: string): number {
  return parseKey(key).getDay()
}

export function todayKey(): string {
  return dateKey(new Date())
}

/** Monday of the week containing `key`. */
export function weekStart(key: string): string {
  const wd = weekday(key)
  return addDays(key, wd === 0 ? -6 : 1 - wd)
}

export function formatLong(key: string): string {
  return parseKey(key).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
