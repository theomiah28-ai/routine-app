export type InstallMode = 'none' | 'ios' | 'ios-other-browser' | 'android' | 'android-menu' | 'desktop'

/** Which install help a visitor needs, from their browser and whether the app is already on their home screen. */
export function installMode(ua: string, standalone: boolean, canPrompt: boolean): InstallMode {
  if (standalone) return 'none'
  if (/iPhone|iPad|iPod/.test(ua)) return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) ? 'ios-other-browser' : 'ios'
  if (/Android/.test(ua)) return canPrompt ? 'android' : 'android-menu'
  return 'desktop'
}

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
