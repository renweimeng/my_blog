"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme ?? "system" : "system";
  const translateClass = currentTheme === "light"
    ? "translate-x-0"
    : currentTheme === "system"
      ? compact
        ? "translate-x-[36px]"
        : "translate-x-[42px]"
      : compact
        ? "translate-x-[72px]"
        : "translate-x-[84px]";

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full border border-border/70",
        compact ? "h-9 w-[112px] px-1 text-[10px]" : "h-10 w-[134px] px-1.5 text-sm",
        "bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        "dark:bg-slate-900/70",
      )}
      role="tablist"
      aria-label="Theme switcher"
    >
      <span
        className={cn(
          "pointer-events-none absolute top-1 rounded-full bg-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-transform duration-300 dark:bg-white",
          compact ? "h-7 w-[34px]" : "h-8 w-10",
          translateClass,
        )}
      />
      {(["light", "system", "dark"] as const).map((item) => {
        const active = currentTheme === item;
        const label = item.charAt(0).toUpperCase() + item.slice(1);

        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTheme(item)}
            className={cn(
              "relative z-10 flex h-full flex-1 items-center justify-center rounded-full font-medium transition-colors duration-300",
              compact ? "text-[10px]" : "text-xs",
              active ? "text-white dark:text-slate-950" : "text-foreground/65",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
