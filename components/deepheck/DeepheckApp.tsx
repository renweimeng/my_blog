"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HeaderStatusBar } from "./HeaderStatusBar";
import { ControlPanel } from "./ControlPanel";
import { TokenStreamPanel } from "./TokenStreamPanel";
import { EEGWaveformPanel } from "./EEGWaveformPanel";
import { RiskGaugePanel } from "./RiskGaugePanel";
import { ERPPanel } from "./ERPPanel";
import { PLVHeatmapPanel } from "./PLVHeatmapPanel";
import { EventLogPanel } from "./EventLogPanel";
import { PipelinePanel } from "./PipelinePanel";
import {
  createEvent,
  createInitialMetrics,
  createInitialPlvMatrix,
  createInitialTokenState,
  generateErpPoints,
  nextTokenState,
  reweightTokenStateForMode,
  updateMetrics,
  updatePlvMatrix,
} from "./dataGenerator";
import type { ChannelDensity, EventItem, MetricState, PlvMatrix, RiskMode, TokenState, ViewMode } from "./types";

function backgroundClass(mode: RiskMode) {
  if (mode === "high") return "from-slate-950 via-[#130b23] to-[#240817]";
  if (mode === "mild") return "from-slate-950 via-[#111827] to-[#20150a]";
  return "from-slate-950 via-[#071827] to-[#100b27]";
}

export function DeepheckApp({ locale }: { locale: string }) {
  const [paused, setPaused] = useState(false);
  const [riskMode, setRiskModeState] = useState<RiskMode>("mild");
  const [viewMode, setViewMode] = useState<ViewMode>("dense");
  const [density, setDensity] = useState<ChannelDensity>("compact");
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [metrics, setMetrics] = useState<MetricState>(() => createInitialMetrics());
  const [tokenState, setTokenState] = useState<TokenState>(() => createInitialTokenState("mild"));
  const [plvMatrix, setPlvMatrix] = useState<PlvMatrix>(() => createInitialPlvMatrix());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tick, setTick] = useState(0);

  const metricsRef = useRef(metrics);
  const tokenRef = useRef(tokenState);
  const riskModeRef = useRef(riskMode);

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  useEffect(() => { tokenRef.current = tokenState; }, [tokenState]);
  useEffect(() => { riskModeRef.current = riskMode; }, [riskMode]);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleString("zh-CN", { hour12: false }));
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setTokenState((prev) => {
        const next = nextTokenState(prev, riskModeRef.current);
        const risk = next.activeToken?.risk ?? 0.12;
        setMetrics((current) => updateMetrics(current, riskModeRef.current, risk));
        setPlvMatrix((current) => updatePlvMatrix(current, riskModeRef.current, risk));
        setTick((value) => value + 1);
        return next;
      });
    }, riskMode === "high" ? 420 : 560);
    return () => window.clearInterval(timer);
  }, [paused, riskMode]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      const event = createEvent(metricsRef.current, tokenRef.current.activeToken?.text);
      setEvents((current) => [event, ...current].slice(0, 20));
    }, 1450);
    return () => window.clearInterval(timer);
  }, [paused]);

  function setRiskMode(mode: RiskMode) {
    setRiskModeState(mode);
    setTokenState((current) => reweightTokenStateForMode(current, mode));
  }

  const erpPoints = useMemo(() => generateErpPoints(riskMode, metrics.tokenRisk, tick), [riskMode, metrics.tokenRisk, tick]);
  const gridClass =
    viewMode === "presentation"
      ? "xl:grid-cols-[0.92fr_1.65fr_0.92fr]"
      : viewMode === "dense"
        ? "xl:grid-cols-[1.02fr_1.7fr_1.04fr]"
        : "xl:grid-cols-[1.08fr_1.54fr_1fr]";

  return (
    <div className={`fixed inset-0 z-[80] flex h-screen flex-col overflow-hidden bg-gradient-to-br ${backgroundClass(riskMode)} text-slate-100`}> 
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-cyan-500/16 blur-3xl" />
        <div className="absolute right-8 top-16 h-96 w-96 rounded-full bg-violet-500/14 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      </div>

      <HeaderStatusBar locale={locale} metrics={metrics} currentTime={currentTime} />

      <main className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-3">
        <ControlPanel
          paused={paused}
          onPausedChange={setPaused}
          riskMode={riskMode}
          onRiskModeChange={setRiskMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          density={density}
          onDensityChange={setDensity}
          showA={showA}
          showB={showB}
          onShowAChange={setShowA}
          onShowBChange={setShowB}
        />

        <div className={`grid min-h-0 flex-1 gap-3 ${gridClass}`}>
          <div className="flex min-h-0 flex-col gap-3">
            <TokenStreamPanel tokenState={tokenState} metrics={metrics} />
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <EEGWaveformPanel paused={paused} metrics={metrics} mode={riskMode} density={density} showA={showA} showB={showB} />
          </div>

          <div className="deepheck-thin-scroll flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
            <RiskGaugePanel metrics={metrics} />
            <ERPPanel points={erpPoints} metrics={metrics} />
            <PLVHeatmapPanel matrix={plvMatrix} metrics={metrics} />
          </div>
        </div>

        <div className="grid h-[92px] shrink-0 gap-3 xl:grid-cols-[360px_1fr]">
          <EventLogPanel events={events} />
          <PipelinePanel />
        </div>
      </main>
    </div>
  );
}
