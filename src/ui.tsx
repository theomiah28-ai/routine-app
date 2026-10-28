import { useEffect, useRef, type ReactNode } from 'react'
import { DndContext, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVertical } from './dnd'

export function Check({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <span
      className={'chk' + (on ? ' on' : '')}
      onClick={(e) => {
        if (!onClick) return
        e.stopPropagation()
        onClick()
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#1a1405" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
}

export function Screen({ children, bg = 'default', full }: { children: ReactNode; bg?: 'default' | 'gold' | 'night'; full?: boolean }) {
  return (
    <div className={'screen' + (full ? ' full' : '')}>
      <div className={'screen-bg ' + bg} />
      {children}
    </div>
  )
}

export function Label({ children, gold }: { children: ReactNode; gold?: boolean }) {
  return <div className={'label' + (gold ? ' gold' : '')}>{children}</div>
}

export function Card({ children, onClick, glow, style }: { children: ReactNode; onClick?: () => void; glow?: boolean; style?: React.CSSProperties }) {
  return (
    <button className={'card' + (glow ? ' glow' : '')} onClick={onClick} style={style} disabled={!onClick}>
      {children}
    </button>
  )
}

export function GoldButton({ children, onClick, dock, disabled, overTabs }: { children: ReactNode; onClick: () => void; dock?: boolean; disabled?: boolean; overTabs?: boolean }) {
  const btn = <button className="btn" onClick={onClick} disabled={disabled}>{children}</button>
  return dock ? <div className={'dock' + (overTabs ? ' over-tabs' : '')}>{btn}</div> : btn
}

export function GhostButton({ children, onClick, style }: { children: ReactNode; onClick: () => void; style?: React.CSSProperties }) {
  return <button className="btn ghost" onClick={onClick} style={style}>{children}</button>
}

/** Circular progress. Glows gold when complete. */
export function Ring({ pct, size, stroke = 8, children, track = '#221f18' }: { pct: number; size: number; stroke?: number; children?: ReactNode; track?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, pct))
  return (
    <div className={'ring' + (p >= 1 ? ' full' : '')} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0c4" />
            <stop offset="0.5" stopColor="#e8c46a" />
            <stop offset="1" stopColor="#c9a043" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          style={{ opacity: p > 0 ? 1 : 0 }}
        />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  )
}

export function Stepper({ value, onChange, step = 1, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  const round = (v: number) => Math.round(v * 100) / 100
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, round(value - step)))} aria-label="Decrease">−</button>
      <input
        inputMode="decimal"
        value={String(value)}
        onChange={(e) => {
          const v = parseFloat(e.target.value.replace(',', '.'))
          onChange(Number.isFinite(v) ? Math.max(min, v) : min)
        }}
        aria-label={suffix}
      />
      <button onClick={() => onChange(round(value + step))} aria-label="Increase">+</button>
    </div>
  )
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
  if (!open) return null
  return (
    <>
      <div className="sheet-scrim" onClick={onClose} />
      <div className="sheet" role="dialog">
        <div>{children}</div>
      </div>
    </>
  )
}

export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [text, onDone])
  return <div className="toast">{text}</div>
}

export function Sun({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  )
}

export function Moon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  )
}

function SortableRow({ id, handle, children }: { id: string; handle: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      className={'sortable-item' + (handle ? '' : ' hold') + (isDragging ? ' dragging' : '')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...(handle ? {} : { ...attributes, ...listeners, role: undefined, tabIndex: undefined })}
    >
      {handle && <span className="handle" {...attributes} {...listeners}>⋮⋮</span>}
      <div className="grow">{children}</div>
    </div>
  )
}

/**
 * Vertical list reorderable by dragging the ⋮⋮ handle, or with `handle={false}`
 * by pressing and holding anywhere on a row.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  handle = true,
}: {
  items: T[]
  onReorder: (items: T[]) => void
  render: (item: T) => ReactNode
  handle?: boolean
}) {
  const hold = { delay: 300, tolerance: 8 }
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: handle ? { distance: 4 } : hold }),
    useSensor(TouchSensor, { activationConstraint: handle ? { delay: 0, tolerance: 4 } : hold }),
  )
  const justDragged = useRef(0)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    justDragged.current = Date.now()
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, from, to))
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragCancel={() => (justDragged.current = Date.now())}
      modifiers={[restrictToVertical]}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {/* Swallow the click that fires when a held-and-dragged row is released */}
        <div onClickCapture={(e) => Date.now() - justDragged.current < 250 && e.stopPropagation()}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id} handle={handle}>
              {render(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
