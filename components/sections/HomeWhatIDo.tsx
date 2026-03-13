import Image from "next/image";
import {
  BarChart3,
  Bot,
  Brain,
  Code2,
  Cpu,
  Database,
  Eye,
  LineChart,
  Music2,
  Network,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MusicTurntable } from "@/components/sections/MusicTurntable";
import type { MusicProfile } from "@/lib/content/people";
import type { Locale } from "@/lib/i18n/locales";

type SkillBar = {
  label: string;
  value: number;
};

type HomeWhatIDoProps = {
  locale: Locale;
  music?: MusicProfile;
};

function Bars({ bars }: { bars: SkillBar[] }) {
  return (
    <div className="mt-4 space-y-3">
      {bars.map((bar, index) => (
        <div key={bar.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{bar.label}</span>
            <span>{bar.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-[width] duration-1000 ease-out"
              style={{ width: `${bar.value}%`, transitionDelay: `${200 + index * 100}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeWhatIDo({ locale, music }: HomeWhatIDoProps) {
  const isZh = locale === "zh";

  const fullStackBars = isZh
    ? [
        { label: "前端工程", value: 82 },
        { label: "后端工程", value: 91 },
        { label: "工程化与部署", value: 71 },
      ]
    : [
        { label: "Frontend Engineering", value: 82 },
        { label: "Backend Engineering", value: 91 },
        { label: "DevOps & Deployment", value: 71 },
      ];

  const analysisBars = isZh
    ? [
        { label: "统计分析", value: 88 },
        { label: "数据可视化", value: 85 },
        { label: "实验设计", value: 81 },
      ]
    : [
        { label: "Statistical Analysis", value: 88 },
        { label: "Data Visualization", value: 85 },
        { label: "Experiment Design", value: 81 },
      ];

  const aiEngineeringBars = isZh
    ? [
        { label: "深度学习", value: 87 },
        { label: "计算机视觉", value: 83 },
        { label: "LLM", value: 92 },
        { label: "机器学习", value: 80 },
        { label: "Agent开发", value: 70 },
      ]
    : [
        { label: "Deep Learning", value: 87 },
        { label: "Computer Vision", value: 83 },
        { label: "LLM", value: 92 },
        { label: "Machine Learning", value: 80 },
        { label: "Agent Development", value: 70 },
      ];

  const researchTracks = isZh
    ? [
        { title: "计算机视觉", icon: Eye },
        { title: "LLM", icon: Bot },
        { title: "脑机接口", icon: Brain },
        { title: "深度学习与机器学习", icon: Cpu },
      ]
    : [
        { title: "Computer Vision", icon: Eye },
        { title: "LLM", icon: Bot },
        { title: "Brain-Computer Interface", icon: Brain },
        { title: "Deep Learning & Machine Learning", icon: Cpu },
      ];

  const fallbackMusic: MusicProfile = {
    title: isZh ? "音乐人" : "Musician",
    intro: isZh
      ? "我是一个鼓手，平时也弹吉他、钢琴，也会作曲。"
      : "I am a drummer, and I also play guitar and piano. I compose music as well.",
    instruments: ["Drums", "Guitar", "Piano", "Composition", "Music Production"],
    bandPhotos: ["/music/band_zyz.jpg"],
    track: "/music/Funk.mp3",
  };

  const profile = music ?? fallbackMusic;
  const heroBandImage = profile.bandPhotos[0] ?? "/music/band_zyz.jpg";

  return (
    <section className="space-y-6 reveal-up delay-2">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          {isZh ? "我做什么？" : "What I Do"}
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="glass-card reveal-up border-white/50 bg-gradient-to-br from-card via-card to-sky-500/10 p-6 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Code2 className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {isZh ? "全栈开发工程师" : "Full-Stack Engineer"}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? "覆盖前后端开发、接口设计、部署与性能优化。"
              : "Across frontend, backend, APIs, deployment, and performance tuning."}
          </p>
          <Bars bars={fullStackBars} />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Vue 3",
              "React 19",
              "Next.js",
              "Next.js Server Actions",
              "TypeScript",
              "Tailwind CSS",
              "Prisma",
              "PostgreSQL",
              "Vercel",
              "Node.js",
              "Spring Boot",
              "MyBatis",
              "Redis",
              "Docker",
            ].map((item) => (
              <Badge key={item} variant="outline" className="bg-white/65 dark:bg-white/5">
                {item}
              </Badge>
            ))}
          </div>
        </article>

        <article className="glass-card reveal-up border-white/50 bg-gradient-to-br from-card via-card to-emerald-500/10 p-6 dark:border-white/10 delay-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">
              {isZh ? "数据分析师" : "Data Analyst"}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? "通过数据清洗、建模与可视化输出可执行结论。"
              : "Turning raw data into actionable insights via modeling and visualization."}
          </p>
          <Bars bars={analysisBars} />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Python",
              "Pandas",
              "SQL",
              "Snowflake",
              "MetricQL",
              "R",
              "Scikit-learn",
              "Tableau",
              "Power BI",
            ].map((item) => (
              <Badge key={item} variant="outline" className="bg-white/65 dark:bg-white/5">
                {item}
              </Badge>
            ))}
          </div>
        </article>

        <article className="glass-card reveal-up border-white/50 bg-gradient-to-br from-card via-card to-fuchsia-500/10 p-6 dark:border-white/10 delay-2">
          <div className="flex items-center gap-2">
            <Network className="size-5 text-fuchsia-400" />
            <h3 className="text-lg font-semibold">
              {isZh ? "人工智能工程" : "AI Engineering"}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isZh
              ? "专注机器学习、深度学习、LLM、计算机视觉与智能系统开发，覆盖数据处理、模型训练与推理部署。"
              : "Focused on machine learning, deep learning, LLMs, computer vision, and intelligent systems, spanning data processing, training, and inference deployment."}
          </p>
          <Bars bars={aiEngineeringBars} />
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Python",
              "PyTorch",
              "OpenCV",
              "Transformers",
              "LangGraph",
              "LangChain",
              "vLLM",
              "Pinecone",
              "CUDA",
            ].map(
              (item) => (
                <Badge key={item} variant="outline" className="bg-white/65 dark:bg-white/5">
                  {item}
                </Badge>
              ),
            )}
          </div>
        </article>
      </div>

      <article className="glass-card reveal-up border-white/50 bg-gradient-to-br from-card via-card to-violet-500/10 p-6 dark:border-white/10 delay-2">
        <div className="flex items-center gap-2">
          <LineChart className="size-5 text-violet-500" />
          <h3 className="text-lg font-semibold">
            {isZh ? "科研工作者" : "Researcher"}
          </h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isZh
            ? "围绕四条研究主线持续推进，从方法到系统落地。"
            : "I work across four research tracks from method exploration to system delivery."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {researchTracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <div
                key={track.title}
                className="rounded-2xl border border-border/70 bg-card/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_14px_30px_rgba(56,189,248,0.18)]"
                style={{ animationDelay: `${200 + index * 80}ms` }}
              >
                <Icon className="size-5 text-primary" />
                <p className="mt-2 text-sm font-medium">{track.title}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="size-4" />
          {isZh ? "研究与工程并行推进" : "Research and engineering, delivered together"}
        </div>
      </article>

      <article className="reveal-up delay-2 relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/65 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative grid gap-4 xl:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-[1.7rem] bg-gradient-to-br from-slate-800 to-slate-700 p-6 text-slate-100 shadow-[0_16px_38px_rgba(2,6,23,0.4)]">
            <p className="text-sm font-medium text-cyan-300">{profile.title}</p>
            <p className="mt-4 text-2xl font-semibold leading-tight">
              {isZh ? "Code + Music" : "Code + Music"}
            </p>
            <p className="mt-5 text-base leading-relaxed text-slate-200/95">
              {profile.intro}
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/65">
            <div className="grid gap-3 md:grid-cols-[170px_1fr]">
              <div className="flex h-full min-h-[148px] items-center justify-center rounded-3xl bg-slate-800 p-6 text-center text-4xl font-semibold text-orange-400">
                Band
              </div>
              <div className="group relative min-h-[148px] overflow-hidden rounded-3xl md:min-h-[220px]">
                <Image
                  src={heroBandImage}
                  alt="band"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 900px"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid gap-4 xl:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-6 dark:border-white/10 dark:bg-slate-900/60">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
              <Sparkles className="size-5 text-primary" />
              {isZh ? "我的器材 / 擅长" : "My Gears"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.instruments.map((instrument) => (
                <Badge
                  key={instrument}
                  variant="outline"
                  className="rounded-full border-slate-300 bg-slate-800 px-3 py-1 text-slate-100 dark:border-slate-500"
                >
                  {instrument}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {isZh
                ? "音乐和编程都需要节奏感、结构感与长期练习。"
                : "Music and software both reward rhythm, structure, and deliberate practice."}
            </p>
          </div>

          <div className="space-y-4">
            <MusicTurntable
              src={profile.track}
              title={isZh ? "Studio Groove" : "Studio Groove"}
              locale={locale}
            />
            <div className="rounded-3xl border border-border/70 bg-gradient-to-r from-slate-900 to-slate-700 p-4 text-slate-100">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                <Music2 className="size-4" />
                {isZh ? "音乐标签" : "Music Tags"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Rock", "Funk", "Indie", "Ambient"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
