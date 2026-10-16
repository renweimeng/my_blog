import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "cortex-live-check-"));
try {
  const source = fs.readFileSync(
    new URL("../lib/cortex-loop/liveSimulation.ts", import.meta.url),
    "utf8",
  );
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  const file = path.join(temporary, "live.cjs");
  fs.writeFileSync(file, output.outputText);
  const {
    liveTasks,
    liveElectrodes,
    LIVE_TRIAL_MS,
    liveStages,
    getLiveFrame,
    liveTiming,
    sampleLiveEEG,
    analyzeLiveSignal,
    getLiveEvents,
    liveOutcome,
    liveResponseAt,
    liveAccuracy,
  } = require(file);

  assert.equal(liveElectrodes.length, 32);
  assert.equal(new Set(liveElectrodes.map((channel) => channel.name)).size, 32);
  assert.equal(liveTasks.length, 6);
  assert.deepEqual(
    liveTasks.map((task) => task.options[task.answer]),
    [5, 0, 1, 1, 90, 6],
  );
  for (const stage of liveStages) {
    const frame = getLiveFrame(stage.start);
    assert.equal(frame.stage.id, stage.id);
    assert.equal(frame.phaseProgress, 0);
    assert.equal(getLiveFrame(stage.end - 1).stage.id, stage.id);
  }
  assert.equal(liveTiming(LIVE_TRIAL_MS).trialIndex, 1);
  assert.equal(liveTiming(LIVE_TRIAL_MS * 6).task.id, liveTasks[0].id);
  assert.equal(getLiveFrame(15000).choice, null);
  assert.equal(getLiveFrame(16000).choice, null);
  assert.equal(getLiveFrame(17800).choice, liveTasks[0].answer);
  assert.equal(
    getLiveFrame(liveResponseAt(0)).responseSeconds,
    (liveResponseAt(0) - 1200) / 1000,
  );
  assert.equal(
    getLiveEvents(liveResponseAt(0)).find((event) => event.phase === 4).time,
    liveResponseAt(0),
  );
  assert.equal(getLiveFrame(19000).completed, 1);
  assert.equal(getLiveFrame(LIVE_TRIAL_MS * 2 + 19000).correct, false);
  assert.equal(liveOutcome(2).correct, false);
  assert.equal(liveAccuracy(0), null);
  assert.equal(liveAccuracy(5), 0.8);

  const original = sampleLiveEEG(4, 7.123);
  for (let channel = 0; channel < 32; channel++) {
    const values = Array.from({ length: 160 }, (_, i) =>
      sampleLiveEEG(channel, 8 + i / 160),
    );
    assert.ok(values.every(Number.isFinite));
    assert.ok(
      Math.max(...values) - Math.min(...values) > 10,
      "each channel must have nontrivial variation",
    );
    assert.ok(Math.max(...values.map(Math.abs)) < 100);
  }
  assert.equal(
    sampleLiveEEG(4, 7.123),
    original,
    "past samples must be reproducible, not regenerated randomly",
  );
  assert.notEqual(sampleLiveEEG(4, 7.123), sampleLiveEEG(5, 7.123));
  const analysis = analyzeLiveSignal(8500, 4);
  assert.deepEqual(analysis, analyzeLiveSignal(8500, 4));
  assert.equal(analysis.scalp.length, 32);
  assert.equal(analysis.spectrum.length, 45);
  assert.ok(
    analysis.scalp.every((value) => value > 0 && Number.isFinite(value)),
  );
  assert.ok(
    Math.abs(analysis.bands.reduce((sum, band) => sum + band.value, 0) - 1) <
      1e-10,
  );
  assert.notDeepEqual(analysis.bands, analyzeLiveSignal(13500, 4).bands);
  assert.notDeepEqual(analysis.spectrum, analyzeLiveSignal(8500, 27).spectrum);
  for (let elapsed = 0; elapsed < LIVE_TRIAL_MS * 12; elapsed += 571) {
    const frame = getLiveFrame(elapsed);
    for (const key of [
      "load",
      "confidence",
      "conflict",
      "attention",
      "alignment",
      "quality",
      "progress",
      "phaseProgress",
    ])
      assert.ok(frame[key] >= 0 && frame[key] <= 1, key);
    const events = getLiveEvents(elapsed);
    assert.ok(events.length <= 18);
    assert.ok(events.every((event) => event.time <= elapsed));
    assert.ok(
      events.every(
        (event, index) => !index || event.time <= events[index - 1].time,
      ),
    );
  }
  console.log(
    "PASS: 32 distinct, reproducible EEG channels; six validated task rules; synchronized trial stages, responses and feedback.",
  );
  console.log(
    "PASS: measured RMS / Goertzel spectrum, normalized band powers, bounded process metrics and chronological event history.",
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
