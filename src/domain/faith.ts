import type { FaithState } from '../types'

export type FaithItem = 'prayer' | 'reading' | 'gratitude'

export function faithDone(_f: FaithState, _key: string, _item: FaithItem): boolean {
  return false
}
