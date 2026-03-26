"use client";

import { Button } from "@/components/ui/button";
import { layerMetas } from "@/data/knowledgeGraph";
import type { LayerFilterOption } from "@/types/knowledge";
import { cn } from "@/lib/utils/cn";

interface LayerFilterProps {
  value: LayerFilterOption;
  onChange: (value: LayerFilterOption) => void;
}

const options: LayerFilterOption[] = ["全部", ...layerMetas.map((item) => item.key)];

export function LayerFilter({ value, onChange }: LayerFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const label = option === "全部" ? "全部" : layerMetas.find((item) => item.key === option)?.label ?? option;
        return (
          <Button
            key={option}
            type="button"
            variant={value === option ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full px-4",
              value !== option && "border-white/15 bg-slate-950/45 text-white/80 hover:bg-white/10"
            )}
            onClick={() => onChange(option)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
