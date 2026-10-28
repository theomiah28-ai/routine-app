import { ASCENT } from '../content/ascent'
import { elapsed, stageIndex } from '../domain/transmutation'
import { useStore } from '../store'
import { Back } from '../nav'
import { Screen } from '../ui'

export function StageDetail({ index }: { index: number }) {
  const { state } = useStore()
  const s = ASCENT[index]
  const reached = stageIndex(elapsed(state.transmutation.start, Date.now()).days) >= index

  return (
    <Screen bg="gold">
      <div className="topbar"><Back label="Ascent" /></div>
      <div
        className="stage-hero"
        style={s.image ? { backgroundImage: `url(${s.image})` } : undefined}
      >
        <div className="stage-hero-glow" style={{ opacity: reached ? 1 : 0.25 }} />
        <div className="stage-roman">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index]}</div>
      </div>
      <span className="pill">STAGE {index + 1} · DAY {s.day}</span>
      <h1 style={{ marginTop: 12 }}>{s.name}</h1>
      <div style={{ color: 'var(--gold-dim)', fontSize: 14 }}>{s.subtitle}</div>

      {reached ? (
        <>
          <p className="prose-p">{s.teaching}</p>
          <div className="gain-cost">
            <div><b className="acc">What you gain</b>{s.gains}</div>
            <div><b className="quit-c">What wasting it costs</b>{s.costs}</div>
          </div>
        </>
      ) : (
        <div className="locked">
          <span>🔒︎</span>
          Unlocks at day {s.day}. Keep climbing.
        </div>
      )}
    </Screen>
  )
}
