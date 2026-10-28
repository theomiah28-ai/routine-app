import { APP_NAME } from './config'
import type { Milestone, Section } from './types'

const W = 1080
const H = 1350

function glyph(c: CanvasRenderingContext2D, section: Section) {
  c.save()
  c.translate(W / 2, 560)
  c.strokeStyle = '#fff0c4'
  c.fillStyle = '#fff0c4'
  c.lineWidth = 14
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.shadowColor = 'rgba(255, 211, 107, 0.9)'
  c.shadowBlur = 50
  c.beginPath()
  switch (section) {
    case 'transmutation':
      c.moveTo(0, 200)
      c.bezierCurveTo(90, 130, -90, 70, 0, 0)
      c.bezierCurveTo(90, -70, -90, -130, 0, -200)
      c.stroke()
      c.beginPath()
      c.arc(0, -200, 22, 0, Math.PI * 2)
      c.fill()
      break
    case 'stillness':
      c.moveTo(-230, 0)
      c.quadraticCurveTo(0, -170, 230, 0)
      c.quadraticCurveTo(0, 170, -230, 0)
      c.stroke()
      c.beginPath()
      c.arc(0, 0, 62, 0, Math.PI * 2)
      c.fill()
      break
    case 'faith':
      c.lineWidth = 22
      c.moveTo(0, -210)
      c.lineTo(0, 210)
      c.moveTo(-120, -90)
      c.lineTo(120, -90)
      c.stroke()
      break
    case 'gym':
      c.lineWidth = 22
      c.moveTo(-190, 0)
      c.lineTo(190, 0)
      c.moveTo(-150, -90)
      c.lineTo(-150, 90)
      c.moveTo(150, -90)
      c.lineTo(150, 90)
      c.moveTo(-210, -50)
      c.lineTo(-210, 50)
      c.moveTo(210, -50)
      c.lineTo(210, 50)
      c.stroke()
      break
    case 'work':
      c.lineWidth = 26
      c.arc(0, 0, 170, -Math.PI / 2, Math.PI * 1.25)
      c.stroke()
      break
    default:
      c.lineWidth = 24
      c.moveTo(-120, 10)
      c.lineTo(-30, 100)
      c.lineTo(140, -100)
      c.stroke()
  }
  c.restore()
}

/** A 4:5 milestone card in the app's gold style, ready to post. */
export async function renderCard(m: Milestone): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const c = canvas.getContext('2d')!
  c.fillStyle = '#0b0b0c'
  c.fillRect(0, 0, W, H)
  const glow = c.createRadialGradient(W / 2, 560, 0, W / 2, 560, 620)
  glow.addColorStop(0, 'rgba(232, 196, 106, 0.42)')
  glow.addColorStop(0.45, 'rgba(232, 196, 106, 0.1)')
  glow.addColorStop(1, 'rgba(232, 196, 106, 0)')
  c.fillStyle = glow
  c.fillRect(0, 0, W, H)
  glyph(c, m.section)

  const font = '-apple-system, "SF Pro Display", Inter, system-ui, sans-serif'
  c.textAlign = 'center'
  c.fillStyle = '#f2f2f2'
  c.font = `700 120px ${font}`
  c.fillText(m.value, W / 2, 970)
  c.fillStyle = '#e8c46a'
  c.font = `600 46px ${font}`
  c.fillText(m.title, W / 2, 1050)
  c.fillStyle = '#8a7a55'
  c.font = `800 30px ${font}`
  c.letterSpacing = '12px'
  c.fillText(APP_NAME.toUpperCase(), W / 2, 1250)

  return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'))
}

export async function shareCard(blob: Blob, title: string) {
  const file = new File([blob], `${title.replace(/[^\w]+/g, '-').toLowerCase()}.png`, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch {
      /* cancelled */
    }
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  URL.revokeObjectURL(a.href)
}
