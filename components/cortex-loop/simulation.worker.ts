import { appendRound, simulateRound } from "@/lib/cortex-loop/simulation";
import type { LoopParameters, LoopState } from "@/lib/cortex-loop/types";

self.onmessage = (
  event: MessageEvent<{
    params: LoopParameters;
    state: LoopState;
    count: number;
    request: number;
  }>,
) => {
  let state = event.data.state;
  for (let i = 0; i < event.data.count; i++) {
    const round = simulateRound(event.data.params, state);
    if (!round) break;
    state = appendRound(state, round);
  }
  self.postMessage({ state, request: event.data.request });
};
