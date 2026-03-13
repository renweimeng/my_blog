import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteName } from "@/lib/seo/metadata";
import type { Dictionary } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/locales";

export function HomeHero({
  dict,
  locale,
  photo,
  name,
}: {
  dict: Dictionary;
  locale: Locale;
  photo: string;
  name: string;
}) {
  const siteName = getSiteName(locale);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-sky-100/85 via-white to-emerald-100/75 px-6 py-16 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:px-12">
      <div className="absolute -left-24 top-8 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />
      <div className="absolute bottom-0 right-24 h-44 w-44 rounded-full bg-emerald-300/35 blur-3xl dark:bg-emerald-500/20" />
      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_280px]">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/85 dark:text-primary">
            {dict.home.heroKicker}
          </p>
          <p className="text-sm font-medium text-foreground/80">
            {siteName}
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            {dict.home.heroTitle}
          </h1>
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            {dict.home.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="shadow-lg shadow-primary/30">
              <Link href={`/${locale}/research`}>{dict.home.ctaResearch}</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/70 bg-white/65 backdrop-blur hover:bg-white dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15">
              <Link href={`/${locale}/articles`}>{dict.home.ctaArticles}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[250px] lg:mx-0">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/30 via-cyan-400/30 to-emerald-400/30 blur-2xl animate-float-slow" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-3 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur dark:border-white/20 dark:bg-white/10">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem]">
              <Image
                src={photo}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 220px, 250px"
                priority
              />
            </div>
            <p className="mt-3 text-center text-xs font-medium tracking-wide text-foreground/80">
              {name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
