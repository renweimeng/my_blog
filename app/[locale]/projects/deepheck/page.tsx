import { DeepheckApp } from "@/components/deepheck/DeepheckApp";
import { createMetadata } from "@/lib/seo/metadata";
import { isLocale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";

  return createMetadata({
    title: "Deepheck 在线实时监测系统",
    description:
      "面向大语言模型幻觉检测的神经认知可视化监测平台，融合双人 EEG 波形、Token 风险、ERP 响应、PLV 热力图与在线处理流水线。",
    locale: resolvedLocale,
    path: `/${resolvedLocale}/projects/deepheck`,
  });
}

export default async function DeepheckPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";

  return <DeepheckApp locale={resolvedLocale} />;
}
