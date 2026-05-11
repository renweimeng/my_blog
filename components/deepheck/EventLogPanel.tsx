"use client";

import { TerminalSquare } from "lucide-react";
import type { EventItem } from "./types";

const levelClass = {
  info: "border-cyan-300/15 bg-cyan-300/7 text-cyan-100",
  warn: "border-amber-300/18 bg-amber-300/8 text-amber-100",
  risk: "border-rose-300/22 bg-rose-400/10 text-rose-100",
};

export function EventLogPanel({ events }: { events: EventItem[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-cyan-100/12 bg-slate-950/72 p-2.5 shadow-[0_16px_46px_rgba(2,6,23,0.34)] backdrop-blur-2xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-white">
        <TerminalSquare className="size-3.5 text-cyan-300" />
        实时事件流
        <span className="ml-auto font-mono text-[10px] text-slate-500">{events.length}/20</span>
      </div>
      <div className="deepheck-thin-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {events.map((event) => (
          <div key={event.id} className={`rounded-xl border px-2.5 py-1.5 text-[11px] leading-4 ${levelClass[event.level]}`}>
            <span className="mr-2 font-mono text-slate-400">{event.time}</span>
            {event.message}
          </div>
        ))}
      </div>
    </section>
  );
}
