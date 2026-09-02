import { ArrowUpRight, BookOpenText, ExternalLink, Orbit } from "lucide-react";
import { publications, type PublicationStatus } from "@/lib/content/publications";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils/cn";

const copy = {
  zh: {
    kicker: "科研成果",
    title: "Publications",
    description:
      "围绕可信生成式 AI、可靠大模型、神经认知智能与多模态检测展开的论文工作。",
    scholar: "查看 Google Scholar",
    accepted: "已接收",
    underReview: "审稿中",
    preprint: "预印本",
    openPaper: "查看论文",
    summary: "篇论文",
  },
  en: {
    kicker: "Research output",
    title: "Publications",
    description:
      "Research spanning trustworthy generative AI, reliable language models, neurocognitive intelligence, and multimodal detection.",
    scholar: "View Google Scholar",
    accepted: "Accepted",
    underReview: "Under Review",
    preprint: "Preprint",
    openPaper: "View paper",
    summary: "publications",
  },
} as const;

const statusStyles: Record<PublicationStatus, string> = {
  accepted:
    "border-emerald-300/45 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200",
  "under-review":
    "border-amber-300/45 bg-amber-400/12 text-amber-700 dark:text-amber-200",
  preprint:
    "border-sky-300/45 bg-sky-400/12 text-sky-700 dark:text-sky-200",
};

function highlightName(authors: string) {
  return authors.split(/(Renwei Meng\*?)/g).map((part, index) =>
    part.startsWith("Renwei Meng") ? (
      <strong key={`${part}-${index}`} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function HomePublications({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const statusLabel: Record<PublicationStatus, string> = {
    accepted: content.accepted,
    "under-review": content.underReview,
    preprint: content.preprint,
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-violet-200/55 bg-[radial-gradient(circle_at_8%_8%,rgba(56,189,248,0.13),transparent_25%),radial-gradient(circle_at_92%_16%,rgba(139,92,246,0.17),transparent_27%),linear-gradient(145deg,rgba(255,255,255,0.88),rgba(245,243,255,0.76))] p-6 shadow-[0_24px_65px_rgba(76,29,149,0.12)] dark:border-violet-300/15 dark:bg-[radial-gradient(circle_at_8%_8%,rgba(14,165,233,0.13),transparent_25%),radial-gradient(circle_at_92%_16%,rgba(139,92,246,0.2),transparent_27%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(30,27,75,0.68))] sm:p-9">
      <div className="pointer-events-none absolute right-10 top-8 size-40 rounded-full border border-violet-300/15" />
      <div className="pointer-events-none absolute right-20 top-18 size-20 rounded-full border border-cyan-300/15" />

      <div className="relative flex flex-col gap-6 border-b border-violet-200/45 pb-7 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            <Orbit className="size-4" />
            {content.kicker}
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {content.title}
            </h2>
            <span className="mb-1 rounded-full border border-violet-300/45 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-200">
              {publications.length} {content.summary}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {content.description}
          </p>
        </div>

        <a
          href={`https://scholar.google.com/citations?user=kbo7-WcAAAAJ&hl=${locale === "zh" ? "zh-CN" : "en"}`}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/50 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md"
        >
          <BookOpenText className="size-4 text-violet-600 dark:text-violet-300" />
          {content.scholar}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
        {publications.map((publication, index) => {
          const cardContent = (
            <>
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs font-semibold tracking-[0.18em] text-violet-500/75 dark:text-violet-300/70">
                  PUB-{String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    statusStyles[publication.status],
                  )}
                >
                  {statusLabel[publication.status]}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold leading-6 tracking-tight text-foreground sm:text-lg">
                {publication.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {highlightName(publication.authors)}
              </p>
              {publication.contribution ? (
                <p className="mt-1 text-xs italic text-muted-foreground/80">
                  {publication.contribution[locale]}
                </p>
              ) : null}

              <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                <p className="max-w-[85%] text-xs leading-5 text-muted-foreground">
                  {publication.venue}, {publication.year}
                </p>
                {publication.href ? (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-violet-300/45 bg-violet-500/10 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white dark:text-violet-200">
                    <ExternalLink className="size-4" />
                    <span className="sr-only">{content.openPaper}</span>
                  </span>
                ) : null}
              </div>
            </>
          );

          const className = cn(
            "group flex min-h-[245px] flex-col rounded-2xl border border-white/70 bg-background/72 p-5 shadow-[0_12px_35px_rgba(76,29,149,0.08)] backdrop-blur transition duration-300 dark:border-white/10 dark:bg-slate-950/32",
            publication.href &&
              "hover:-translate-y-1 hover:border-violet-300/75 hover:shadow-[0_20px_45px_rgba(109,40,217,0.16)]",
          );

          return publication.href ? (
            <a
              key={publication.id}
              href={publication.href}
              target="_blank"
              rel="noreferrer"
              className={className}
              aria-label={`${content.openPaper}: ${publication.title}`}
            >
              {cardContent}
            </a>
          ) : (
            <article key={publication.id} className={className}>
              {cardContent}
            </article>
          );
        })}
      </div>
    </section>
  );
}
