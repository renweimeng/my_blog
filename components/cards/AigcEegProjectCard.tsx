import Link from "next/link";
import { Activity, ArrowUpRight, BrainCircuit, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AigcEegProjectCard() {
  return (
    <Link
      href="/aigc-eeg/index.html"
      className="group relative overflow-hidden rounded-2xl border border-fuchsia-300/60 bg-[linear-gradient(135deg,#312e81,#7c3aed_46%,#db2777)] p-5 text-white shadow-[0_22px_55px_rgba(126,34,206,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(126,34,206,0.38)]"
    >
      <div className="absolute right-0 top-0 h-32 w-32 bg-white/12 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-24 w-32 bg-cyan-300/14 blur-2xl" />
      <div className="relative flex min-h-[250px] flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-fuchsia-800">
              <Sparkles className="size-3.5" />
              Featured Project
            </Badge>
            <Badge variant="outline" className="border-white/35 text-white">
              AIGC + EEG
            </Badge>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/14">
              <BrainCircuit className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-tight">二元AIGC脑机接口鉴伪</h2>
              <p className="mt-2 text-sm leading-6 text-fuchsia-50/88">
                一个双脑 EEG 与 AIGC 视频鉴伪演示系统，包含实时监测、脑网络同步、风险评分、可解释性注意力与统计报告界面。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/18 pt-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Activity className="size-4" />
            打开演示项目
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-fuchsia-800 transition group-hover:translate-x-1">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
