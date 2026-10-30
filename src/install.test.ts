import { describe, expect, it } from 'vitest'
import { installMode } from './install'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1'
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'

describe('installMode', () => {
  it('nothing to show once installed', () => expect(installMode(IPHONE, true, false)).toBe('none'))
  it('iPhone Safari gets the Share → Add to Home Screen steps', () => expect(installMode(IPHONE, false, false)).toBe('ios'))
  it('iPhone in another browser is told to open Safari', () => expect(installMode(IPHONE_CHROME, false, false)).toBe('ios-other-browser'))
  it('Android with the install prompt gets a button', () => expect(installMode(ANDROID, false, true)).toBe('android'))
  it('Android without the prompt gets menu steps', () => expect(installMode(ANDROID, false, false)).toBe('android-menu'))
  it('desktop is told to open it on a phone', () => expect(installMode(MAC, false, false)).toBe('desktop'))
})
