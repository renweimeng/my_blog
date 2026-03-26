import { KnowledgeTreeApp } from "@/components/knowledge-tree/KnowledgeTreeApp";
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
    title: "自顶向下学习法知识大树",
    description:
      "一个可视化的中文知识图谱页面：从 AI 应用目标出发，递归反推全部前置知识，并给出推荐学习顺序。",
    locale: resolvedLocale,
    path: `/${resolvedLocale}/knowledge-tree`,
  });
}

export default async function KnowledgeTreePage() {
  return <KnowledgeTreeApp />;
}
