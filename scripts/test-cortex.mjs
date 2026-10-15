import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const load = createRequire(import.meta.url);
const directory = fileURLToPath(new URL(".", import.meta.url));

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "cortex-check-"));
try {
  for (const name of ["types", "simulation", "relay", "tasks"]) {
    const source = fs.readFileSync(
      path.join(directory, "../lib/cortex-loop", `${name}.ts`),
      "utf8",
    );
    const output = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
    });
    fs.writeFileSync(path.join(temporary, `${name}.js`), output.outputText);
  }
  const { defaultParameters } = load(path.join(temporary, "types.js"));
  const { runExperiment, riskShrinkage, generateCandidates, initialLoopState } =
    load(path.join(temporary, "simulation.js"));
  const { enumeratePaths, scorePath, makeKernel } = load(
    path.join(temporary, "relay.js"),
  );
  const { findPath, roomBlocks } = load(path.join(temporary, "tasks.js"));

  const run = runExperiment(defaultParameters, 30);
  assert.equal(run.rounds.length, 30);
  assert.deepEqual(
    runExperiment(defaultParameters, 30),
    run,
    "a seed must replay the same complete experiment",
  );
  assert.notDeepEqual(
    runExperiment({ ...defaultParameters, seed: 99 }, 30),
    run,
  );
  for (const round of run.rounds) {
    assert.ok(
      Math.abs(round.candidates.reduce((s, q) => s + q.propensity, 0) - 1) <
        1e-10,
    );
    assert.ok(round.candidates.every((q) => q.propensity > 0));
    assert.equal(
      round.selected.propensity,
      round.candidates.find((q) => q.id === round.selected.id).propensity,
    );
    assert.ok(round.teacher.rho >= 0 && round.teacher.rho <= 1);
    assert.equal(round.eeg.length, 8);
    assert.equal(
      round.modelAfter,
      round.modelBefore + (round.audit === "pass" ? 1 : 0),
    );
    if (round.audit !== "pass")
      assert.deepEqual(
        round.skillsAfter,
        round.skillsBefore,
        "a rejected model must not be deployed",
      );
  }
  assert.ok(run.rounds.some((r) => r.audit === "pass"));
  const stress = runExperiment({ ...defaultParameters, drift: 0.94 }, 20);
  assert.ok(
    stress.rounds.some((r) => r.audit === "fail"),
    "drift must expose a reproducible rollback",
  );
  assert.equal(
    stress.version,
    1,
    "failed shadows must not change the deployed model",
  );
  assert.ok(
    runExperiment({ ...defaultParameters, teacherWeight: 0 }, 5).rounds.every(
      (r) => r.teacher.rho === 0,
    ),
  );
  assert.ok(
    runExperiment({ ...defaultParameters, fatigue: 0.95 }, 3).rounds.every(
      (r) => !r.teacher.accepted,
    ),
  );
  for (const mode of ["static", "active"]) {
    const frozen = runExperiment({ ...defaultParameters, mode }, 10);
    assert.equal(frozen.version, 1);
    assert.ok(frozen.rounds.every((r) => r.audit === "frozen"));
  }
  const uniform = generateCandidates(
    { ...defaultParameters, mode: "online" },
    initialLoopState(),
  );
  assert.ok(uniform.every((q) => q.propensity === 1 / uniform.length));
  assert.ok(
    runExperiment({ ...defaultParameters, budgetMinutes: 1 }, 50).minutes <= 1,
  );
  assert.equal(runExperiment(defaultParameters, 70).rounds.length, 50);
  assert.equal(riskShrinkage(0, 0).rho, 0);
  for (const a of [0.01, 0.4, 1])
    for (const variance of [0, 0.3, 2]) {
      const optimum = riskShrinkage(a, variance);
      assert.ok(optimum.risk <= Math.min(a, variance) + 1e-10);
    }
  const paths = enumeratePaths();
  assert.equal(paths.length, 35);
  assert.ok(
    paths.every(
      (p) =>
        p[0] === 1 &&
        p[7] === 4 &&
        p.every((v, i) => i === 0 || (v >= p[i - 1] && v <= p[i - 1] + 1)),
    ),
  );
  assert.ok(paths.every((p) => Number.isFinite(scorePath(p).score)));
  const self = makeKernel(20, 0, false),
    cross = makeKernel(20, 0, true);
  assert.ok(
    self.raw.every((row, i) =>
      row.every((v, j) => Math.abs(v - cross.raw[i][j]) < 1e-10),
    ),
    "zero-noise estimators must agree",
  );
  const route = findPath(roomBlocks);
  assert.deepEqual(route[0], [0, 0]);
  assert.deepEqual(route.at(-1), [6, 6]);
  assert.ok(
    route.every((p) => !roomBlocks.some((b) => b[0] === p[0] && b[1] === p[1])),
  );
  assert.deepEqual(
    findPath([
      [0, 1],
      [1, 0],
    ]),
    [],
  );
  console.log(
    `CORTEX checks passed: reproducibility, 30-round loop, ${stress.rounds.filter((r) => r.audit === "fail").length} rollbacks, audit isolation, budgets, zero transfer, 35 paths and spatial routing.`,
  );
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
