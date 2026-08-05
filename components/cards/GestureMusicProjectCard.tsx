import Link from "next/link";
import { ArrowUpRight, Hand, Music2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";

const copy = {
  zh: {
    title: "VibeChord 手势吉他与鼓机",
    description:
      "通过摄像头识别双手手势，用自然动作实时控制和弦、音色、琶音与鼓机节奏，体验无需实体乐器的沉浸式网页演奏。",
    action: "开始手势演奏",
  },
  en: {
    title: "VibeChord Gesture Guitar & Drums",
    description:
      "Use real-time hand gestures to control chords, instruments, arpeggios, and drum grooves through an immersive camera-powered web instrument.",
    action: "Start performing",
  },
} as const;

export function GestureMusicProjectCard({ locale }: { locale: Locale }) {
  const content = copy[locale];

  return (
    <Link
      href="/gesture-guitar-drum/index.html"
      className="group relative overflow-hidden rounded-2xl border border-violet-300/55 bg-[radial-gradient(circle_at_82%_14%,rgba(34,211,238,0.3),transparent_27%),radial-gradient(circle_at_12%_92%,rgba(244,114,182,0.22),transparent_28%),linear-gradient(135deg,#1e1b4b,#5b21b6_43%,#7e22ce_72%,#172554)] p-5 text-white shadow-[0_22px_58px_rgba(109,40,217,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(126,34,206,0.42)]"
    >
      <div className="absolute -right-8 top-6 size-36 rounded-full border border-cyan-200/15" />
      <div className="absolute right-2 top-16 size-20 rounded-full border border-fuchsia-200/20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent" />

      <div className="relative flex min-h-[250px] flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white text-violet-900">
              <Sparkles className="size-3.5" />
              Featured Project
            </Badge>
            <Badge variant="outline" className="border-cyan-100/40 text-cyan-50">
              Gesture AI + Music
            </Badge>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/14 text-cyan-100 ring-1 ring-cyan-200/25">
              <Music2 className="size-7" />
              <Hand className="absolute -bottom-1 -right-1 size-4 rounded-full bg-fuchsia-500 p-0.5 text-white" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-tight">{content.title}</h2>
              <p className="mt-2 text-sm leading-6 text-violet-50/88">
                {content.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/18 pt-4 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Hand className="size-4" />
            {content.action}
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-violet-900 transition group-hover:translate-x-1">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
