"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  status: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBar({ value, status, onChange, onSearch }: SearchBarProps) {
  return (
    <form
      className="flex min-w-[300px] flex-1 flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/65 p-1 shadow-[0_10px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
        <div className="flex flex-1 items-center gap-2 px-3 text-white/55">
          <Search className="size-4" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="搜索节点，例如：Transformer、医学 AI、智能体"
            className="h-10 w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
        <Button type="submit" className="rounded-xl px-4">
          搜索定位
        </Button>
      </div>
      <p className="min-h-5 text-xs text-white/55">{status || "支持按节点名、层级、说明和标签搜索。"}</p>
    </form>
  );
}
