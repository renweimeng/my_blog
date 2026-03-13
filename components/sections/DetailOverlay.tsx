"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DetailOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function DetailOverlay({
  open,
  onClose,
  title,
  subtitle,
  children,
}: DetailOverlayProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[120] flex items-center justify-center p-4 transition-all duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/25 bg-gradient-to-br from-white via-slate-50 to-cyan-50 shadow-[0_28px_80px_rgba(15,23,42,0.35)] dark:border-white/15 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-14 left-6 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="relative max-h-[80vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
              {subtitle && (
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
