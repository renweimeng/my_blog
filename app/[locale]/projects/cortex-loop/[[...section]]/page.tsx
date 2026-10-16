import { notFound } from "next/navigation";
import { CortexApp } from "@/components/cortex-loop/CortexApp";
import { pageInfo } from "@/lib/cortex-loop/content";
import type { CortexPage } from "@/lib/cortex-loop/types";
import { isLocale, locales } from "@/lib/i18n/locales";
import { createMetadata, getAbsoluteUrl } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; section?: string[] }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    pageInfo.map((page) => ({
      locale,
      section: page.id === "home" ? [] : [page.id],
    })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, section } = await params;
  const lang = isLocale(locale) ? locale : "en";
  const page = pageInfo.find((p) => p.id === (section?.[0] ?? "home"));
  const tail = section?.length ? `/${section.join("/")}` : "";
  const path = `/${lang}/projects/cortex-loop${tail}`;
  return {
    ...createMetadata({
      title: `CORTEX — ${lang === "zh" ? (page?.zh ?? "人类认知过程蒸馏") : (page?.en ?? "Human cognitive distillation")}`,
      description:
        lang === "zh"
          ? "自动播放的认知实验现场：单被试合成 EEG、视觉测试题、空间频谱与事件响应同步可视化。保留 RELAY 论文结果、人脑–AI 学习闭环及全部研究展示。"
          : "An autonomous cognition observatory with synthetic EEG, visual tasks, spectral analysis and event responses. Explore the original RELAY results and human–AI learning-loop exhibits.",
      locale: lang,
      path,
      image: "/cortex-loop/og-image.png",
    }),
    alternates: {
      canonical: getAbsoluteUrl(path),
      languages: {
        en: getAbsoluteUrl(`/en/projects/cortex-loop${tail}`),
        zh: getAbsoluteUrl(`/zh/projects/cortex-loop${tail}`),
      },
    },
  };
}

export default async function CortexPage({ params }: Props) {
  const { locale, section } = await params;
  const page = section?.[0] ?? "home";
  if (
    !isLocale(locale) ||
    (section?.length ?? 0) > 1 ||
    !pageInfo.some((p) => p.id === page)
  )
    notFound();
  return <CortexApp initialLocale={locale} initialPage={page as CortexPage} />;
}
