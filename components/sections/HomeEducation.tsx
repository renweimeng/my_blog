"use client";

import { useState } from "react";
import { CalendarDays, GraduationCap, Landmark, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailOverlay } from "@/components/sections/DetailOverlay";
import type { Locale } from "@/lib/i18n/locales";
import type { EducationItem } from "@/lib/content/people";

type HomeEducationProps = {
  locale: Locale;
  education: EducationItem[];
};

export function HomeEducation({ locale, education }: HomeEducationProps) {
  const [active, setActive] = useState<EducationItem | null>(null);

  if (education.length === 0) return null;

  const isZh = locale === "zh";
  const title = isZh ? "我的教育经历" : "Education";
  const subtitle = isZh
    ? "这里是我的学术背景与本科阶段经历。"
    : "A snapshot of my academic path and undergraduate journey.";

  return (
    <section className="space-y-6 reveal-up delay-1">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {title}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((item, index) => (
          <button
            key={`${item.school}-${item.degree}`}
            type="button"
            className="group glass-card reveal-up relative cursor-pointer border-white/50 bg-gradient-to-br from-card via-card to-primary/8 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)] dark:border-white/10"
            style={{ animationDelay: `${120 + index * 120}ms` }}
            onClick={() => setActive(item)}
          >
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {item.start} - {item.end}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">{item.degree}</h3>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-foreground/85">
              <Landmark className="size-4 text-primary" />
              {item.school}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="size-4 text-primary" />
              {item.major}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {item.achievements && item.achievements.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.achievements.map((achievement) => (
                  <Badge key={achievement} variant="outline" className="bg-white/65 dark:bg-white/5">
                    {achievement}
                  </Badge>
                ))}
              </div>
            )}

            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {isZh ? "点击查看详情" : "Click for details"}
            </span>
          </button>
        ))}
      </div>

      <DetailOverlay
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? `${active.degree} · ${active.school}` : ""}
        subtitle={active ? `${active.start} - ${active.end}` : ""}
      >
        {active?.detail ? (
          <>
            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "学校介绍" : "School Overview"}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {active.detail.schoolIntro}
              </p>
            </section>

            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "专业介绍" : "Major Overview"}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {active.detail.majorIntro}
              </p>
            </section>

            {active.detail.metrics ? (
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card/75 p-5">
                  <h4 className="text-lg font-semibold">
                    {isZh ? "绩点 / 成绩" : "GPA / Score"}
                  </h4>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {active.detail.metrics.gpa ?? "--"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/75 p-5">
                  <h4 className="text-lg font-semibold">
                    {isZh ? "排名" : "Rank"}
                  </h4>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {active.detail.metrics.rank ?? "--"}
                  </p>
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
              <h4 className="text-lg font-semibold">
                {isZh ? "主修学科" : "Core Curriculum"}
              </h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">{isZh ? "数学" : "Mathematics"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {active.detail.curriculum.math.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{isZh ? "计算机基础" : "CS Fundamentals"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {active.detail.curriculum.csFundamentals.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{isZh ? "进阶课" : "Advanced Courses"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {active.detail.curriculum.advanced.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{isZh ? "通识课" : "General Courses"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {active.detail.curriculum.general.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/75 p-5">
                <p className="inline-flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  {isZh ? "获得奖项" : "Awards"}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {active.detail.awards.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/75 p-5">
                <p className="inline-flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  {isZh ? "参加志愿" : "Volunteering"}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {active.detail.volunteering.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-border/70 bg-card/75 p-5">
            <p className="text-sm text-muted-foreground">
              {isZh
                ? "请在 content/people/zh.json 与 content/people/en.json 中为本科信息补充 detail 字段。"
                : "Please add the detail field for this education item in content/people/zh.json and content/people/en.json."}
            </p>
          </section>
        )}
      </DetailOverlay>
    </section>
  );
}
