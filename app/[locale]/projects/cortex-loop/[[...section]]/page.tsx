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
          ? "交互探索人类认知过程蒸馏：RELAY 真实论文结果、可复现的人脑–AI 学习闭环、审美与空间实验、Agent 规划、交互理论和独立审计。"
          : "Explore human cognitive process distillation through RELAY paper results, a reproducible human–AI learning loop, aesthetics, spatial intelligence, agent planning and interactive theory.",
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
