import Link from "next/link";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getSiteName } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/routing";

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const siteName = getSiteName(locale);
  const navItems = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/research`, label: dict.nav.research },
    { href: `/${locale}/projects`, label: dict.nav.projects },
    { href: `/${locale}/articles`, label: dict.nav.articles },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-base font-semibold tracking-tight text-transparent"
        >
          {siteName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LocaleSwitcher locale={locale} />
          <ThemeSwitcher />
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher locale={locale} />
          <ThemeSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 border border-border/60 bg-white/45 px-3 dark:bg-white/10">
                {dict.actions.menu}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-l border-border/70 bg-card/95 backdrop-blur-xl">
              <div className="mt-8 flex flex-col gap-4">
                {navItems.map((item, index) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-xl px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted",
                        index === navItems.length - 1 && "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                    {index < navItems.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
