import Link from "next/link";
import { ArrowUpRight, Brain, Radar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";

export function DeepheckProjectCard({ locale }: { locale: Locale }) {
  return (
    <Link
      href={`/${locale}/projects/deepheck`}
      className="group relative overflow-hidden rounded-2xl border border-cyan-200/30 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.34),transparent_30%),linear-gradient(135deg,#1e1b4b,#4c1d95_46%,#7e22ce_78%,#0f172a)] p-5 text-white shadow-[0_22px_60px_rgba(76,29,149,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(34,211,238,0.22)]"
    >
      <div className="absolute right-3 top-3 h-24 w-24 rounded-full bg-cyan-300/16 blur-2xl" />
      <div className="absolute -bottom-8 left-10 h-28 w-40 rounded-full bg-fuchsia-400/16 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

      <div className="relative flex min-h-[250px] flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-violet-900">
              <Sparkles className="size-3.5" />
              Featured System
            </Badge>
            <Badge variant="outline" className="border-cyan-100/40 text-cyan-50">
              LLM + EEG
            </Badge>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-300/14 text-cyan-100 ring-1 ring-cyan-200/20">
              <Brain className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-tight">Deepheck 在线实时监测系统</h2>
              <p className="mt-2 text-sm leading-6 text-cyan-50/86">
                面向大语言模型幻觉检测的神经认知可视化平台，融合双人 EEG、Token 风险、ERP 响应与 PLV 脑际同步大屏监测。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/18 pt-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Radar className="size-4" />
            进入监测系统
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-violet-900 transition group-hover:translate-x-1">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
