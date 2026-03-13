"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DetailOverlay } from "@/components/sections/DetailOverlay";
import type { InternshipItem } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/locales";

type InternshipSectionProps = {
  locale: Locale;
  internships: InternshipItem[];
};

export function InternshipSection({ locale, internships }: InternshipSectionProps) {
  const [active, setActive] = useState<InternshipItem | null>(null);
  if (internships.length === 0) return null;

  const isZh = locale === "zh";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isZh ? "实习" : "Internships"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isZh
            ? "点击任一实习卡片，查看完整项目背景、职责与成果。"
            : "Click an internship card to view detailed background, responsibilities, and outcomes."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {internships.map((item) => (
          <button
            key={`${item.company}-${item.role}-${item.start}`}
            type="button"
            className="group glass-card relative cursor-pointer border-white/50 bg-gradient-to-br from-card via-card to-emerald-500/10 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)] dark:border-white/10"
            onClick={() => setActive(item)}
          >
            <p className="text-xs text-muted-foreground">
              {item.start} - {item.end}
              {item.location ? ` · ${item.location}` : ""}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{item.role}</h3>
            <p className="mt-1 text-sm text-foreground/85">{item.company}</p>
            <p className="mt-3 text-sm text-muted-foreground">{item.summary}</p>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {isZh ? "点击查看详情" : "Click for details"}
            </span>
          </button>
        ))}
      </div>

      <DetailOverlay
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? `${active.role} · ${active.company}` : ""}
        subtitle={active ? `${active.start} - ${active.end}` : ""}
      >
        {active?.detail ? (
          <>
            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "实习单位介绍" : "Company Overview"}
              </h4>
              <p className="mt-2 text-sm text-muted-foreground">
                {active.detail.companyIntro}
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "岗位介绍" : "Role Overview"}
              </h4>
              <p className="mt-2 text-sm text-muted-foreground">
                {active.detail.roleIntro}
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "工作内容" : "Highlights"}
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {active.detail.highlights.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.detail.tech.map((item) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
            <p className="text-sm text-muted-foreground">
              {isZh
                ? "请在 content/people/zh.json 与 content/people/en.json 中为实习补充 detail 字段。"
                : "Please add the detail field for this internship in content/people/zh.json and content/people/en.json."}
            </p>
          </section>
        )}
      </DetailOverlay>
    </section>
  );
}
