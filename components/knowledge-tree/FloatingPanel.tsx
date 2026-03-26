"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { GripHorizontal, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FloatingPanelProps = {
  title: string;
  subtitle?: string;
  width: number;
  initialY?: number;
  initialX?: number;
  dock?: "left" | "right";
  initiallyMinimized?: boolean;
  className?: string;
  children: ReactNode;
};

export function FloatingPanel({
  title,
  subtitle,
  width,
  initialY = 24,
  initialX = 24,
  dock = "left",
  initiallyMinimized = false,
  className,
  children,
}: FloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") {
      return { x: initialX, y: initialY };
    }

    return {
      x: dock === "right" ? Math.max(16, window.innerWidth - width - 24) : initialX,
      y: initialY,
    };
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const nextX =
        dock === "right"
          ? Math.max(16, window.innerWidth - width - 24)
          : initialX;

      setPosition((current) =>
        current.x === nextX && current.y === initialY
          ? current
          : { x: nextX, y: initialY }
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [dock, initialX, initialY, width]);

  useEffect(() => {
    function clampPosition() {
      const rect = panelRef.current?.getBoundingClientRect();
      const panelWidth = rect?.width ?? width;
      const panelHeight = rect?.height ?? 72;
      setPosition((current) => ({
        x: Math.min(Math.max(12, current.x), Math.max(12, window.innerWidth - panelWidth - 12)),
        y: Math.min(Math.max(12, current.y), Math.max(12, window.innerHeight - panelHeight - 12)),
      }));
    }

    clampPosition();
    window.addEventListener("resize", clampPosition);
    return () => window.removeEventListener("resize", clampPosition);
  }, [isMinimized, width]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };

    const currentTarget = event.currentTarget;
    currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);
    const rect = panelRef.current?.getBoundingClientRect();
    const panelWidth = rect?.width ?? width;
    const panelHeight = rect?.height ?? 72;

    setPosition({
      x: Math.min(Math.max(12, nextX), Math.max(12, window.innerWidth - panelWidth - 12)),
      y: Math.min(Math.max(12, nextY), Math.max(12, window.innerHeight - panelHeight - 12)),
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "pointer-events-auto absolute z-30 overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950/74 shadow-[0_28px_70px_rgba(3,12,31,0.34)] backdrop-blur-xl",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: `min(${width}px, calc(100vw - 24px))`,
      }}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-3 border-b border-white/10 bg-white/6 px-4 py-3 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <GripHorizontal className="size-4 text-white/55" />
            <span className="truncate">{title}</span>
          </div>
          {subtitle ? <p className="mt-1 text-xs text-white/48">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized((value) => !value)}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/72 transition hover:bg-white/12"
        >
          {isMinimized ? <Plus className="size-4" /> : <Minus className="size-4" />}
        </button>
      </div>

      {!isMinimized ? <div className="max-h-[calc(100vh-9rem)] overflow-auto p-3">{children}</div> : null}
    </div>
  );
}
