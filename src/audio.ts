// Bells and tones synthesised with Web Audio, so there are no audio files to ship.
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Call from a tap so iOS lets later sounds play. */
export function unlockAudio() {
  const c = ac()
  if (!c) return
  const b = c.createBuffer(1, 1, 22050)
  const s = c.createBufferSource()
  s.buffer = b
  s.connect(c.destination)
  s.start(0)
}

function voice(freq: number, gain: number, decay: number, at = 0) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + at
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + decay + 0.05)
}

/** A meditation bell: a fundamental plus inharmonic partials with a long tail. */
export function bell() {
  voice(432, 0.28, 5.5)
  voice(432 * 2.76, 0.08, 3.2)
  voice(432 * 5.4, 0.03, 1.6)
}

export function tone(kind: 'in' | 'hold' | 'out') {
  voice(kind === 'in' ? 392 : kind === 'hold' ? 330 : 262, 0.07, 0.9)
}
