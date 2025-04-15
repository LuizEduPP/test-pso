"use client";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

export default function DragProvider({ children, onDragEnd }) {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      {children}
    </DndContext>
  );
}
