import Link from "next/link";
import { ArrowUpRight, Eye, ScanSearch, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DiffScanAuthProjectCard() {
  return (
    <Link
      href="/diffscanauth/index.html"
      className="group relative overflow-hidden rounded-2xl border border-violet-300/55 bg-[radial-gradient(circle_at_14%_10%,rgba(34,211,238,0.28),transparent_28%),linear-gradient(135deg,#312e81,#6d28d9_46%,#9333ea_72%,#111827)] p-5 text-white shadow-[0_22px_58px_rgba(109,40,217,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_78px_rgba(147,51,234,0.38)]"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 left-8 h-28 w-36 rounded-full bg-cyan-300/14 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/65 to-transparent" />

      <div className="relative flex min-h-[250px] flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-violet-900">
              <Sparkles className="size-3.5" />
              Featured Project
            </Badge>
            <Badge variant="outline" className="border-white/35 text-white">
              Eye Tracking + AIGC
            </Badge>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/14 text-cyan-100 ring-1 ring-cyan-200/20">
              <Eye className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-tight">DiffScanAuth 实时眼动鉴伪系统</h2>
              <p className="mt-2 text-sm leading-6 text-violet-50/88">
                基于人类眼动引导的序列式 AI 图像检测界面，包含注视轨迹、模型扫描策略、证据区域、置信度曲线与鉴伪指标面板。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/18 pt-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <ScanSearch className="size-4" />
            打开鉴伪系统
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-violet-900 transition group-hover:translate-x-1">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
