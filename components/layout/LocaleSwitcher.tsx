"use client";

import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n/locales";
import { ensureLocale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (nextLocale: Locale) => {
    const target = ensureLocale(pathname, nextLocale);
    router.push(target);
  };

  const nextLocale: Locale = locale === "zh" ? "en" : "zh";
  const isZh = locale === "zh";

  return (
    <button
      type="button"
      onClick={() => handleSwitch(nextLocale)}
      aria-label={isZh ? "切换到 English" : "Switch to 中文"}
      className={cn(
        "relative flex h-10 w-[138px] items-center rounded-full border border-border/70",
        "bg-white/70 px-2 text-sm shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        "transition-colors duration-300 hover:bg-white/85 dark:bg-slate-900/70 dark:hover:bg-slate-900/85",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-1 h-8 w-[62px] rounded-full bg-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-transform duration-300 dark:bg-white",
          isZh ? "translate-x-0" : "translate-x-[64px]",
        )}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-2 font-medium">
        <span
          className={cn(
            "transition-colors duration-300",
            isZh ? "text-white dark:text-slate-950" : "text-foreground/65",
          )}
        >
          中文
        </span>
        <span
          className={cn(
            "transition-colors duration-300",
            isZh ? "text-foreground/65" : "text-white dark:text-slate-950",
          )}
        >
          English
        </span>
      </span>
    </button>
  );
}
