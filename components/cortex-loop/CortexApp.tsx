"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Expand,
  Languages,
  Menu,
  Minimize,
  MoonStar,
  Pause,
  Play,
  Presentation,
  X,
} from "lucide-react";
import {
  appendRound,
  initialLoopState,
  simulateRound,
} from "@/lib/cortex-loop/simulation";
import {
  defaultParameters,
  type CortexLocale,
  type CortexPage,
  type LoopRound,
} from "@/lib/cortex-loop/types";
import { pageInfo } from "@/lib/cortex-loop/content";
import { CortexContext } from "./CortexContext";
import { HomeView } from "./HomeView";
import "./cortex.css";

const LoopLab = dynamic(() => import("./LoopLab"), {
  loading: () => <div className="cl-loading">CORTEX / LOOP LAB</div>,
});
const RelayView = dynamic(() => import("./RelayView"), {
  loading: () => <div className="cl-loading">CORTEX / RELAY</div>,
});
const TaskViews = dynamic(() => import("./TaskViews"), {
  loading: () => <div className="cl-loading">CORTEX / TASK SPACE</div>,
});
const TheoryView = dynamic(() => import("./TheoryView"), {
  loading: () => <div className="cl-loading">CORTEX / THEORY</div>,
});
const ResearchViews = dynamic(() => import("./ResearchViews"), {
  loading: () => <div className="cl-loading">CORTEX / RESEARCH</div>,
});

const subscribeMotion = (listener: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const readMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tourStops: { page: CortexPage; seconds: number }[] = [
  { page: "home", seconds: 90 },
  { page: "relay", seconds: 180 },
  { page: "loop", seconds: 180 },
  { page: "aesthetic", seconds: 45 },
  { page: "space", seconds: 45 },
  { page: "agent-world", seconds: 45 },
];

export function CortexApp({
  initialLocale,
  initialPage,
}: {
  initialLocale: CortexLocale;
  initialPage: CortexPage;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [page, setPage] = useState(initialPage);
  const [research, setResearch] = useState(false);
  const preferredMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    () => false,
  );
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? preferredMotion;
  const [menu, setMenu] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const [params, setParams] = useState({ ...defaultParameters });
  const [experiment, setExperiment] = useState(initialLoopState);
  const [pending, setPending] = useState<LoopRound | null>(null);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [tourTime, setTourTime] = useState(0);
  const [tourPlaying, setTourPlaying] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const workerRequest = useRef(0);
  const t = useCallback(
    (zh: string, en: string) => (locale === "zh" ? zh : en),
    [locale],
  );
  const href = useCallback(
    (p: CortexPage, lang = locale) =>
      `/${lang}/projects/cortex-loop${p === "home" ? "" : `/${p}`}`,
    [locale],
  );

  const navigate = useCallback(
    (next: CortexPage) => {
      setPage(next);
      setMenu(false);
      window.history.pushState({}, "", href(next));
      document
        .querySelector(".cl-scroll")
        ?.scrollTo({ top: 0, behavior: "instant" });
    },
    [href],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background: { element: HTMLElement; inert: boolean }[] = [];
    let branch = document.querySelector<HTMLElement>(".cl-root");
    while (branch?.parentElement && branch.parentElement !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (
          sibling === branch ||
          !(sibling instanceof HTMLElement) ||
          ["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)
        )
          continue;
        background.push({ element: sibling, inert: sibling.inert });
        sibling.inert = true;
      }
      branch = branch.parentElement;
    }
    const pop = () => {
      const parts = window.location.pathname.split("/").filter(Boolean);
      setLocale(parts[0] === "zh" ? "zh" : "en");
      const p = parts[3] ?? "home";
      setPage(pageInfo.some((x) => x.id === p) ? (p as CortexPage) : "home");
    };
    const full = () => setFullscreen(Boolean(document.fullscreenElement));
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("popstate", pop);
    window.addEventListener("keydown", key);
    document.addEventListener("fullscreenchange", full);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      window.removeEventListener("popstate", pop);
      window.removeEventListener("keydown", key);
      document.removeEventListener("fullscreenchange", full);
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const title = pageInfo.find((p) => p.id === page);
    document.title = `CORTEX — ${locale === "zh" ? title?.zh : title?.en}`;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [page, locale]);

  const step = useCallback(() => {
    if (phase === 0 && !pending) {
      const round = simulateRound(params, experiment);
      if (!round) {
        setPlaying(false);
        setNotice(
          t(
            "已达到时间预算或 50 轮上限，可重置后重新运行。",
            "The time budget or 50-round limit has been reached. Reset to start a new run.",
          ),
        );
        return;
      }
      setPending(round);
      setPhase(1);
    } else if (phase < 7) setPhase((p) => p + 1);
    else if (pending) {
      setExperiment((s) => appendRound(s, pending));
      setPending(null);
      setPhase(0);
    }
  }, [phase, pending, params, experiment, t]);

  useEffect(() => {
    if (!playing || page !== "loop") return;
    const timer = window.setTimeout(step, reducedMotion ? 1600 : 1100);
    return () => window.clearTimeout(timer);
  }, [playing, page, step, reducedMotion]);

  const reset = useCallback(() => {
    workerRequest.current++;
    setBatchRunning(false);
    setPlaying(false);
    setPending(null);
    setPhase(0);
    setExperiment(initialLoopState());
    setNotice("");
  }, []);
  const runBatch = useCallback(
    (count: number) => {
      setPlaying(false);
      setPending(null);
      setPhase(0);
      const fallback = () => {
        let result = experiment;
        for (let i = 0; i < count; i++) {
          const round = simulateRound(params, result);
          if (!round) break;
          result = appendRound(result, round);
        }
        setExperiment(result);
        setBatchRunning(false);
      };
      if (!window.Worker) {
        fallback();
        return;
      }
      setBatchRunning(true);
      const request = ++workerRequest.current;
      try {
        if (!workerRef.current)
          workerRef.current = new Worker(
            new URL("./simulation.worker.ts", import.meta.url),
            { type: "module" },
          );
        workerRef.current.onmessage = (event) => {
          if (event.data.request !== workerRequest.current) return;
          setExperiment(event.data.state);
          setBatchRunning(false);
        };
        workerRef.current.onerror = () => {
          workerRef.current?.terminate();
          workerRef.current = null;
          if (request === workerRequest.current) fallback();
        };
        workerRef.current.postMessage({
          params,
          state: experiment,
          count,
          request,
        });
      } catch {
        fallback();
      }
    },
    [params, experiment],
  );

  const advanceTour = useCallback(() => {
    if (tour === null) return;
    const next = tour + 1;
    if (next >= tourStops.length) {
      setTour(null);
      setTourPlaying(false);
      setPlaying(false);
      return;
    }
    setTour(next);
    setTourTime(0);
    navigate(tourStops[next].page);
    setPlaying(tourStops[next].page === "loop");
  }, [tour, navigate]);
  useEffect(() => {
    if (tour === null || !tourPlaying) return;
    const timer = setTimeout(() => {
      if (tourTime + 1 >= tourStops[tour].seconds) advanceTour();
      else setTourTime((s) => s + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tour, tourPlaying, tourTime, advanceTour]);

  const changeLocale = () => {
    const next = locale === "zh" ? "en" : "zh";
    window.history.pushState({}, "", href(page, next));
    setLocale(next);
    document.cookie = `NEXT_LOCALE=${next}; path=/; SameSite=Lax`;
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else
        setNotice(
          t(
            "当前浏览器不支持全屏，可使用浏览器窗口全屏。",
            "Fullscreen is unavailable in this browser. Use the browser window controls.",
          ),
        );
    } catch {
      setNotice(
        t(
          "未能进入全屏，请使用浏览器窗口的全屏功能。",
          "Unable to enter fullscreen. Use your browser's window controls.",
        ),
      );
    }
  };

  const value = useMemo(
    () => ({
      locale,
      t,
      page,
      navigate,
      research,
      reducedMotion,
      params,
      setParams,
      experiment,
      setExperiment,
      pending,
      phase,
      playing,
      batchRunning,
      setPlaying,
      step,
      reset,
      runBatch,
    }),
    [
      locale,
      t,
      page,
      navigate,
      research,
      reducedMotion,
      params,
      experiment,
      pending,
      phase,
      playing,
      batchRunning,
      step,
      reset,
      runBatch,
    ],
  );

  return (
    <CortexContext.Provider value={value}>
      <div className={`cl-root ${reducedMotion ? "cl-reduced-motion" : ""}`}>
        <a className="cl-skip" href="#cortex-content">
          {t("跳到内容", "Skip to content")}
        </a>
        <header className="cl-header">
          <a
            href={href("home")}
            onClick={(e) => {
              e.preventDefault();
              navigate("home");
            }}
            className="cl-brand"
            aria-label="CORTEX home"
          >
            <span className="cl-brand-symbol">
              <i />
              <i />
              <i />
            </span>
            <span>
              CORTEX<span className="cl-brand-dot">.</span>
              <small>HUMAN → INTELLIGENCE</small>
            </span>
          </a>
          <nav
            className="cl-nav"
            aria-label={t("研究导航", "Research navigation")}
          >
            {pageInfo
              .filter((p) => p.group === "main")
              .map((p) => (
                <a
                  key={p.id}
                  href={href(p.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(p.id);
                  }}
                  aria-current={page === p.id ? "page" : undefined}
                >
                  {locale === "zh" ? p.zh : p.en}
                </a>
              ))}
            <button
              className={menu ? "is-active" : ""}
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
            >
              {t("探索", "Explore")}
              <ChevronDown size={12} />
            </button>
          </nav>
          <div className="cl-header-tools">
            <button
              className="cl-tour-button"
              aria-label={t("开启导览演示", "Start guided presentation")}
              onClick={() => {
                setTour(0);
                setTourTime(0);
                setTourPlaying(true);
                setPlaying(false);
                navigate("home");
              }}
            >
              <Presentation size={15} />
            </button>
            <button
              className={`cl-mode-button ${research ? "is-active" : ""}`}
              onClick={() => setResearch((v) => !v)}
              title={t("叙事 / 科研模式", "Narrative / research mode")}
            >
              <BookOpen size={14} />
              <span>
                {research ? t("科研", "Research") : t("叙事", "Narrative")}
              </span>
            </button>
            <button
              onClick={changeLocale}
              className="cl-language"
              aria-label={t("切换为 English", "Switch to 中文")}
            >
              <Languages size={14} />
              {locale === "zh" ? "EN" : "中"}
            </button>
            <button
              className="cl-icon-button cl-fullscreen"
              onClick={toggleFullscreen}
              aria-label={
                fullscreen
                  ? t("退出全屏", "Exit fullscreen")
                  : t("全屏浏览", "Enter fullscreen")
              }
            >
              {fullscreen ? <Minimize size={17} /> : <Expand size={17} />}
            </button>
            <button
              className="cl-mobile-menu cl-icon-button"
              onClick={() => setMenu((v) => !v)}
              aria-label={t("导航菜单", "Navigation menu")}
              aria-expanded={menu}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
        {menu && (
          <div className="cl-explore-menu">
            <div className="cl-explore-title">
              {t(
                "沿着认知的边界，继续探索。",
                "Follow the edges of cognition.",
              )}
            </div>
            <nav>
              {pageInfo.map((p) => (
                <a
                  key={p.id}
                  href={href(p.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(p.id);
                  }}
                >
                  <span className="cl-mono">{p.short}</span>
                  {locale === "zh" ? p.zh : p.en}
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </nav>
            <a href={`/${locale}/projects`} className="cl-back-link">
              <ArrowLeft size={14} />
              {t("返回孟任巍的项目集", "Back to Renwei Meng's projects")}
            </a>
          </div>
        )}
        <div className="cl-scroll">
          <main id="cortex-content" className="cl-content">
            {page === "home" && <HomeView />}
            {page === "loop" && <LoopLab />}
            {page === "relay" && <RelayView />}
            {["aesthetic", "space", "agent-world"].includes(page) && (
              <TaskViews />
            )}
            {page === "theory" && <TheoryView />}
            {["universe", "audit", "about"].includes(page) && <ResearchViews />}
          </main>
          <footer className="cl-footer">
            <a
              className="cl-footer-logo"
              href={href("home")}
              onClick={(e) => {
                e.preventDefault();
                navigate("home");
              }}
            >
              CORTEX<span>.</span>
            </a>
            <p>
              {t(
                "蒸馏认知计算。探索下一次值得学习的事。",
                "Distill the computation. Discover what is worth learning next.",
              )}
            </p>
            <div>
              <span className="cl-mono">© 2026 RENWEI MENG</span>
              <button
                onClick={() => setMotionOverride(!reducedMotion)}
                aria-pressed={reducedMotion}
              >
                <MoonStar size={13} />
                {t("低动态模式", "Reduced motion")}
                {reducedMotion ? " · ON" : " · OFF"}
              </button>
              <a href={`/${locale}/projects`}>
                <ArrowLeft size={13} />
                {t("个人主页", "Portfolio")}
              </a>
            </div>
          </footer>
        </div>
        {tour !== null && (
          <div className="cl-tour-control">
            <div>
              <Presentation size={15} />
              <span>
                {t("研究导览", "Research tour")} · {tour + 1} /{" "}
                {tourStops.length}
              </span>
              <b>
                {Math.floor((tourStops[tour].seconds - tourTime) / 60)}:
                {String((tourStops[tour].seconds - tourTime) % 60).padStart(
                  2,
                  "0",
                )}
              </b>
            </div>
            <progress max={tourStops[tour].seconds} value={tourTime} />
            <div>
              <button
                onClick={() => {
                  setTourPlaying((v) => !v);
                  if (page === "loop") setPlaying(!tourPlaying);
                }}
              >
                {tourPlaying ? <Pause size={13} /> : <Play size={13} />}{" "}
                {tourPlaying ? t("暂停导览", "Pause") : t("继续导览", "Resume")}
              </button>
              <button onClick={advanceTour}>
                {t("下一站", "Next")}
                <ArrowRight size={13} />
              </button>
              <button
                aria-label={t("结束导览", "End tour")}
                onClick={() => {
                  setTour(null);
                  setTourPlaying(false);
                  setPlaying(false);
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}
        {notice && (
          <div className="cl-toast" role="status">
            <CircleHelp size={18} />
            {notice}
            <button
              onClick={() => setNotice("")}
              aria-label={t("关闭提示", "Dismiss")}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </CortexContext.Provider>
  );
}
