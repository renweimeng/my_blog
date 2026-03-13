"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme ?? "system" : "system";
  const translateClass =
    currentTheme === "light"
      ? "translate-x-0"
      : currentTheme === "system"
        ? "translate-x-[42px]"
        : "translate-x-[84px]";

  return (
    <div
      className={cn(
        "relative flex h-10 w-[134px] items-center rounded-full border border-border/70",
        "bg-white/70 px-1.5 text-sm shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        "dark:bg-slate-900/70",
      )}
      role="tablist"
      aria-label="Theme switcher"
    >
      <span
        className={cn(
          "pointer-events-none absolute top-1 h-8 w-10 rounded-full bg-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-transform duration-300 dark:bg-white",
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
              "relative z-10 flex h-full flex-1 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300",
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
