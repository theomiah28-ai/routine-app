import type { ReactNode } from 'react'
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
        navigator.vibrate?.(8)
        onClick()
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} />
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      className={'sortable-item' + (isDragging ? ' dragging' : '')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className="handle" {...attributes} {...listeners}>⋮⋮</span>
      <div className="grow">{children}</div>
    </div>
  )
}

/** Vertical list reorderable by dragging the ⋮⋮ handle. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
}: {
  items: T[]
  onReorder: (items: T[]) => void
  render: (item: T) => ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 4 } }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, from, to))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVertical]}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRow key={item.id} id={item.id}>
            {render(item)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  )
}
