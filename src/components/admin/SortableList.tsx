"use client";

import { useCallback, useId, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export interface HandleProps {
  setActivator: (node: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

interface Props<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, handle: HandleProps, isDragging: boolean) => ReactNode;
  layout?: "list" | "grid";
  className?: string;
}

/**
 * Drag-and-drop ordering (mouse, touch and keyboard). `renderItem` receives
 * handle props to spread onto the drag handle element.
 */
export function SortableList<T extends { id: string }>({ items, onChange, renderItem, layout = "list", className }: Props<T>) {
  // A stable id keeps dnd-kit's accessibility ids identical on server and client.
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(items, from, to));
  };

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle, isDragging) => renderItem(item, index, handle, isDragging)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }: { id: string; children: (handle: HandleProps, isDragging: boolean) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "relative z-10 opacity-80")}>
      {children({ setActivator: setActivatorNodeRef, attributes, listeners }, isDragging)}
    </div>
  );
}

/** Ready-made drag handle button. */
export function DragHandle({ handle, label = "Drag to reorder", className }: { handle: HandleProps; label?: string; className?: string }) {
  // Attach dnd-kit's activator through a callback so the handle object itself
  // is a plain prop, not something React treats as a ref.
  const attach = useCallback((node: HTMLButtonElement | null) => handle.setActivator(node), [handle]);
  const { attributes, listeners } = handle;

  return (
    <button
      type="button"
      ref={attach}
      {...attributes}
      {...listeners}
      aria-label={label}
      title={label}
      className={cn("inline-flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing", className)}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="9" cy="6" r="1.6" />
        <circle cx="15" cy="6" r="1.6" />
        <circle cx="9" cy="12" r="1.6" />
        <circle cx="15" cy="12" r="1.6" />
        <circle cx="9" cy="18" r="1.6" />
        <circle cx="15" cy="18" r="1.6" />
      </svg>
    </button>
  );
}
