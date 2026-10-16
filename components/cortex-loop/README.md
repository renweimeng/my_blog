# CORTEX research experience

An independent, bilingual visual experience hosted by the portfolio at
`/zh/projects/cortex-loop` and `/en/projects/cortex-loop`.

## Run

Use the repository's `npm install` and `npm run dev`. No backend, device,
model weights, external font service, or API key is required.

## Structure

- `LiveExperiment.tsx` / `LiveEEG.tsx` / `LiveTask.tsx` / `LiveAnalytics.tsx`:
  the default autonomous, single-participant observatory. The original landing
  experience is retained at `/overview`, and every original exhibit remains.
- `lib/cortex-loop/liveSimulation.ts`: deterministic EEG, six self-contained
  task rules, trial stages, responses, spectral analysis and event history.
- `CortexApp.tsx`: shell, navigation, persistent in-memory experiment, locale,
  fullscreen, reduced-motion preference and playback state.
- `BrainScene.tsx` / `SpatialScene.tsx`: lazy-loaded Three.js scenes with SVG
  fallback, intersection-aware rendering and resource disposal.
- `LoopLab.tsx` / `simulation.worker.ts`: eight-step loop, evidence cards,
  round inspection, charts and background batch execution.
- `RelayView.tsx`: manuscript results, kernel and alignment experiments,
  shrinkage, deployment and a concept-level intervention proxy.
- `TaskViews.tsx`: procedural preference stimuli, spatial manipulation and
  routing, plus an explicit tool-recovery state machine.
- `TheoryView.tsx`: eight interactive theoretical explanations with assumptions.
- `ResearchViews.tsx`: blueprint generator, provenance, local export/clear,
  consent design, references and research ladder.
- `lib/cortex-loop/`: typed schemas, deterministic generators, path search,
  paper-reported aggregates and spatial breadth-first search.

Each page has a real server route and bilingual metadata. The in-experience
History API navigation preserves round, parameters and language state.
Reloading a page starts a new local experiment. No raw user signals are acquired.

## Scientific sources

RELAY aggregates are transcribed from the author-provided revised main paper:
Table 1 and Table 3, PDF page 5. Table 2's Full-space confidence interval includes
zero. The supplied figure is optimized as WebP. Source PDFs are retained without
modification in `public/cortex-loop/references/`.

Real item-level neural traces and original model weights were not supplied.
Interactive traces, prediction proxies, closed-loop outcomes and prospective
task experiments therefore carry simulation/concept labels. Static and
active-only deployment baselines freeze parameters; they do not claim to
measure post-session offline training gains.

The loop uses separate random streams for candidate selection, participant
observations and fixed-distribution sentinel evaluation. Each completed round
stores its parameter snapshot, candidate probabilities and outcome. Rejected
or uncertain shadow updates never alter the deployed skill vector. JSON export
includes these snapshots so mixed-parameter runs can be replayed.

Run meaningful deterministic checks with `npm run test:cortex`.

## Autonomous observatory

The new entrance plays immediately and cycles through six 20-second cognitive
tasks. One monotonic clock drives the stimulus, response, waveform, event markers
and explanatory panels. Pause/resume, 1x–2x speed, skip, restart, channel selection,
16/32-channel density, waveform gain and local JSON export are available. Skipped
trials are excluded from completed-trial accuracy.

EEG is synthetic, not recorded human data. Its seeded, continuously evaluated
oscillations, colored noise, blink-like transients and event response templates
are buffered at 160 Hz for display. The continuous generator can be sampled at
1 kHz; the plots explicitly separate source and display rates. Spectral charts
use a Hann-windowed 2-second Goertzel analysis of the actual generated channel;
the scalp view interpolates the 250 ms channel RMS on schematic electrode
positions. It is not anatomical source localization. Single-trial event responses
are distinguished from response templates, not mislabeled as averaged ERP.
Load, choice confidence, gaze and relational alignment are explicitly identified
as illustrative task-linked variables, not validated cognitive decoding.

Background tabs do not accumulate unseen trial time, and all animation frames
are released when leaving this view. Lower-motion preferences reduce rendering
cadence without preventing the requested automatic playback. Run
`npm run test:cortex-live` for signal and task invariants.

Background reading: [MNE-Python simulated raw data example](https://mne.tools/stable/auto_examples/simulation/simulate_raw_data.html).
This browser generator is independent; it does not claim MNE's forward model.

## Assets and licenses

The brain point cloud, artwork, room, diagrams, cover and charts are generated
in code. The point cloud is a concept surface, not an anatomical reconstruction.
Outfit and Instrument Serif are self-hosted under their included SIL Open Font
License files in `public/cortex-loop/fonts/`.
