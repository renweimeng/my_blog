import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Orbit } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";

export function CortexProjectCard({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return (
    <Link
      href={`/${locale}/projects/cortex-loop`}
      className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-fuchsia-200/35 bg-[linear-gradient(140deg,#21172f,#432a58_60%,#775148)] text-white shadow-[0_20px_55px_rgba(72,35,91,0.22)] transition duration-300 hover:-translate-y-1 hover:border-amber-200/60 hover:shadow-[0_25px_65px_rgba(113,69,114,0.32)]"
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src="/cortex-loop/cover.svg"
          alt={
            zh
              ? "CORTEX 认知点云与人脑–AI 学习闭环"
              : "CORTEX cognitive point cloud and human–AI learning loop"
          }
          width={640}
          height={300}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-100/25 bg-black/20 px-2.5 py-1 text-[10px] tracking-wider text-amber-100 backdrop-blur">
          <Orbit size={11} />
          Featured Research
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] tracking-[0.2em] text-amber-200/70">
          CORTEX / CORTEX-LOOP
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          {zh
            ? "CORTEX：蒸馏人类认知过程"
            : "CORTEX: Distilling Human Cognition"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-purple-100/75">
          {zh
            ? "从人类的答案，走向答案形成之前的计算。交互探索 RELAY、脑–AI 学习闭环与下一代认知智能。"
            : "Move upstream from human answers to the computation behind them. Explore RELAY, human–AI learning loops and cognitive intelligence."}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-white/12 pt-4 text-xs text-amber-100/85">
          <span>
            {zh
              ? "进入交互研究网站 · 中 / EN"
              : "Enter the interactive research site · 中 / EN"}
          </span>
          <ArrowUpRight
            size={18}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
