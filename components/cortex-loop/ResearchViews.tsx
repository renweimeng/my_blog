"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  Download,
  FileText,
  Fingerprint,
  GitBranch,
  Network,
  Orbit,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { researchBoundaries } from "@/lib/cortex-loop/content";
import { useCortex } from "./CortexContext";
import {
  Action,
  downloadJson,
  InlineLink,
  PageHeading,
  Panel,
  Range,
  Segmented,
  SourceTag,
} from "./Primitives";

export default function ResearchViews() {
  const { page } = useCortex();
  return page === "universe" ? (
    <UniverseView />
  ) : page === "audit" ? (
    <AuditView />
  ) : (
    <AboutView />
  );
}

const taskChoices = [
  ["视觉推理", "Visual reasoning"],
  ["审美", "Aesthetics"],
  ["视频世界", "Video world"],
  ["Agent 规划", "Agent planning"],
  ["空间 3D", "Spatial 3D"],
  ["语言", "Language"],
  ["非临床沟通", "Nonclinical dialogue"],
] as const;
const modalityChoices = [
  "EEG",
  "EEG + Eye",
  "EEG + fMRI",
  "EEG + fNIRS",
  "MEG / fMRI",
];
const modelChoices = [
  "VLM",
  "Ranker / Diffusion reward",
  "World model",
  "LLM Agent",
  "3D model",
  "LLM",
  "Dialogue model",
];

function UniverseView() {
  const { t, locale } = useCortex();
  const [task, setTask] = useState(0),
    [modality, setModality] = useState(0),
    [mode, setMode] = useState("loop"),
    [model, setModel] = useState(0);
  const blueprint = useMemo(
    () => ({
      task: taskChoices[task][locale === "zh" ? 0 : 1],
      modality: modalityChoices[modality],
      student: modelChoices[model],
      mode,
      queryPolicy:
        task === 1
          ? "Preference-boundary & diversity"
          : task === 3
            ? "Mechanism-discrimination"
            : task === 4
              ? "Angle / occlusion uncertainty"
              : "Information gain / human cost",
      cognitiveOperator: [
        "Joint trajectory kernel",
        "Value / attention trajectory",
        "Event transition graph",
        "Conflict–verify–terminate graph",
        "Spatial transformation operator",
        "Semantic integration geometry",
        "Preference & cognitive load",
      ][task],
      updateTarget: [
        "Reasoning adapter",
        "Reward ranker",
        "State-transition adapter",
        "Planner / tool router",
        "Spatial adapter",
        "Layer-state adapter",
        "Preference adapter",
      ][task],
      negativeControls: [
        "Behavior-only",
        "Matched-shuffled neural",
        "Matched-random subspace",
        "Frozen student",
        "No propensity correction",
      ],
      stage: mode === "loop" ? "L0 → L1 → L2 → L3" : "Static → held-out audit",
      source: "research-proposal",
    }),
    [task, modality, model, mode, locale],
  );
  return (
    <>
      <PageHeading
        index="06"
        eyebrow="CORTEX UNIVERSE / PARADIGM SELECTOR"
        title={
          <>
            {t("你的问题，", "Your question.")}
            <br />
            <em>{t("也可以有认知教师。", "A cognitive teacher.")}</em>
          </>
        }
        description={t(
          "连接任务、信号与模型。选择一个坐标，生成包含更新对象、负对照和实验阶梯的研究蓝图。",
          "Connect a task, a signal and a model. Select a coordinate to generate a blueprint with update targets, negative controls and an experimental ladder.",
        )}
      >
        <SourceTag kind="proposal" />
      </PageHeading>
      <div className="cl-universe-workspace">
        <div className="cl-universe-field">
          <svg
            viewBox="0 0 700 460"
            role="img"
            aria-label={t(
              "任务、模态、模型的三维组合空间",
              "A projected space of tasks, modalities and models",
            )}
          >
            <defs>
              <radialGradient id="cl-universe-glow">
                <stop stopColor="#a294ca" stopOpacity=".16" />
                <stop offset="1" stopColor="#a294ca" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="350" cy="240" r="220" fill="url(#cl-universe-glow)" />
            {[0, 1, 2, 3, 4].map((j) => (
              <g key={j}>
                <path
                  d={`M80 ${320 - j * 43} L360 ${430 - j * 43} 650 ${275 - j * 43}`}
                  fill="none"
                  stroke="#5e5573"
                  strokeOpacity=".26"
                />
                <path
                  d={`M80 ${320 - j * 43} L370 ${165 - j * 16} 650 ${275 - j * 43}`}
                  fill="none"
                  stroke="#5e5573"
                  strokeOpacity=".18"
                />
              </g>
            ))}
            {taskChoices.flatMap((item, i) =>
              modalityChoices.map((_, j) => {
                const x = 105 + i * 65 + j * 16,
                  y = 285 + i * 10 - j * 42;
                const active = i === task && j === modality;
                return (
                  <g key={`${i}-${j}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 14 : 3.5}
                      fill={active ? "#e2c194" : "#9f92bd"}
                      fillOpacity={active ? 0.2 : 0.55}
                    />
                    <circle cx={x} cy={y} r={active ? 5 : 0} fill="#efd4ae" />
                  </g>
                );
              }),
            )}
            <text x="40" y="350">
              {t("任务轴", "Task axis")}
            </text>
            <text x="570" y="130">
              {t("模态轴", "Modality axis")}
            </text>
            <text x="435" y="433">
              {t("模型轴", "Model family")}
            </text>
          </svg>
          <div className="cl-universe-caption">
            <Orbit size={20} />
            <span>
              {taskChoices[task][locale === "zh" ? 0 : 1]} ×{" "}
              {modalityChoices[modality]} × {modelChoices[model]}
            </span>
          </div>
        </div>
        <aside>
          <label className="cl-field">
            {t("选择任务", "Choose a task")}
            <select
              value={task}
              onChange={(e) => {
                setTask(Number(e.target.value));
                setModel(Number(e.target.value));
              }}
            >
              {taskChoices.map((v, i) => (
                <option key={i} value={i}>
                  {v[locale === "zh" ? 0 : 1]}
                </option>
              ))}
            </select>
          </label>
          <label className="cl-field">
            {t("神经 / 行为模态", "Neural / behavioral modality")}
            <select
              value={modality}
              onChange={(e) => setModality(Number(e.target.value))}
            >
              {modalityChoices.map((v, i) => (
                <option key={v} value={i}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="cl-field">
            {t("学生模型家族", "Student model family")}
            <select
              value={model}
              onChange={(e) => setModel(Number(e.target.value))}
            >
              {modelChoices.map((v, i) => (
                <option key={v} value={i}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <Segmented
            value={mode}
            onChange={setMode}
            label={t("研究路线", "Research route")}
            options={[
              { value: "static", label: t("静态蒸馏", "Static") },
              { value: "loop", label: t("主动闭环", "Loop") },
            ]}
          />
          <p>
            {t(
              "组合空间是研究设计工具，可行性取决于信号时标、任务接口、设备与参与者同意范围。",
              "This is a research-design space. Feasibility depends on signal timescales, task interfaces, equipment and consent.",
            )}
          </p>
        </aside>
      </div>
      <Panel
        title={t("你的实验蓝图", "Your experiment blueprint")}
        eyebrow="GENERATED RESEARCH DESIGN"
        actions={
          <button
            className="cl-inline-link"
            onClick={() =>
              downloadJson("cortex-experiment-blueprint.json", blueprint)
            }
          >
            <Download size={15} />
            {t("下载蓝图", "Download blueprint")}
          </button>
        }
      >
        <div className="cl-blueprint-grid">
          {[
            [t("课程策略", "Query policy"), blueprint.queryPolicy],
            [t("认知算子", "Cognitive operator"), blueprint.cognitiveOperator],
            [t("更新对象", "Update target"), blueprint.updateTarget],
            [
              t("对齐方法", "Alignment"),
              task === 3
                ? "Event graph matching"
                : "Student-compatible trajectory kernel",
            ],
            [
              t("教师风险", "Teacher risk"),
              "Cross-donor + independent calibration",
            ],
            [t("实验阶梯", "Experimental ladder"), blueprint.stage],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="cl-blueprint-bottom">
          <div>
            <b>{t("必须的负对照", "Required negative controls")}</b>
            <p>{blueprint.negativeControls.join(" · ")}</p>
          </div>
          <div>
            <b>{t("公共数据与自采", "Public & prospective data")}</b>
            <p>
              {t(
                task === 0
                  ? "UvA / THINGS；闭环需额外记录候选概率、实时事件与哨兵表现。"
                  : task === 1
                    ? "AVA / AADB 可提供视觉刺激；成对 EEG–眼动–偏好需按同意范围自采。"
                    : "公开任务可提供刺激先验；匹配的神经过程、时间戳和闭环日志需单独设计采集。",
                task === 0
                  ? "UvA / THINGS can provide priors; a loop also needs propensities, stream events and sentinels."
                  : task === 1
                    ? "AVA / AADB can provide stimuli; paired EEG–gaze–preference requires consented collection."
                    : "Public tasks can provide stimulus priors; matched neural processes, timestamps and loop logs require a separate collection design.",
              )}
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}

function AuditView() {
  const { t, params, experiment, pending, reset, setPlaying, navigate } =
    useCortex();
  const [selected, setSelected] = useState<number | null>(null),
    [consent, setConsent] = useState("task"),
    [fatigueLimit, setFatigueLimit] = useState(0.85),
    [deleted, setDeleted] = useState(false);
  const record =
    selected !== null
      ? experiment.rounds[selected]
      : (experiment.rounds.at(-1) ?? pending);
  return (
    <>
      <PageHeading
        index="08"
        eyebrow="AUDIT / TRUST IS AN INTERFACE"
        title={
          <>
            {t("可解释，", "Explainable.")}{" "}
            <em>{t("也要可追溯。", "And traceable.")}</em>
          </>
        }
        description={t(
          "每一次查询、教师构造与更新都留下证据。数据来自哪里、模型为什么改变、何时应该停止，都在这里可见。",
          "Every query, teacher and update leaves evidence. Inspect data origins, model changes and the conditions for stopping.",
        )}
      >
        <ShieldCheck size={28} />
        <span className="cl-mono">LOCAL-FIRST / AUDITABLE</span>
      </PageHeading>
      <div className="cl-source-guide">
        {(["reported", "simulation", "concept", "proposal"] as const).map(
          (kind, i) => (
            <div key={kind}>
              <SourceTag kind={kind} />
              <p>
                {
                  [
                    t(
                      "作者修订稿中的实测汇总，可定位到表格与页码。",
                      "Empirical aggregates in the revised manuscript, traceable to tables and pages.",
                    ),
                    t(
                      "带有公开随机种子、参数与轮次快照的本地虚拟实验。",
                      "Local virtual experiments with visible seeds, parameters and round snapshots.",
                    ),
                    t(
                      "用于说明机制的程序化图形，不代表真实信号或结果。",
                      "Procedural illustrations of mechanisms, not recordings or measurements.",
                    ),
                    t(
                      "尚需实证检验的未来任务、设计路线和理论推广。",
                      "Future tasks, study designs and theoretical extensions requiring validation.",
                    ),
                  ][i]
                }
              </p>
            </div>
          ),
        )}
      </div>
      <div className="cl-two-columns">
        <Panel
          title={t("本次实验的版本记录", "Provenance for this session")}
          eyebrow="SCHEMA / cortex-loop/1.0"
        >
          <div className="cl-data-lines cl-provenance">
            <span>
              {t("数据来源", "Data source")}
              <b>seeded-simulation</b>
            </span>
            <span>
              {t("配置版本", "Configuration version")}
              <b>cortex-loop/1.0</b>
            </span>
            <span>
              {t("主随机种子", "Master seed")}
              <b>{params.seed}</b>
            </span>
            <span>
              {t("部署版本", "Deployed version")}
              <b>m_{String(experiment.version).padStart(4, "0")}</b>
            </span>
            <span>
              {t("候选池 / 探索率", "Pool / exploration")}
              <b>
                {params.candidateCount} / {params.exploration}
              </b>
            </span>
            <span>
              {t("原始论文模型 hash", "Original model hash")}
              <b>{t("未随稿件提供", "Not supplied")}</b>
            </span>
            <span>
              {t("真实 EEG / 逐题日志", "Raw EEG / item logs")}
              <b>{t("未随稿件提供", "Not supplied")}</b>
            </span>
          </div>
          <button
            className="cl-button cl-button-secondary"
            onClick={() =>
              downloadJson(`cortex-audit-${params.seed}.json`, {
                schema: "cortex-loop/1.0",
                source: "seeded-simulation",
                params,
                experiment,
              })
            }
          >
            <Download size={15} />
            {t("导出完整实验档案", "Export session archive")}
          </button>
        </Panel>
        <Panel
          title={t("停止权和数据控制", "Stopping & data control")}
          eyebrow="PARTICIPANT AGENCY"
        >
          <label className="cl-field">
            {t("同意范围（设计示意）", "Consent scope (design illustration)")}
            <select
              value={consent}
              onChange={(e) => setConsent(e.target.value)}
            >
              <option value="task">
                {t(
                  "仅当前任务与认知负担",
                  "Current task & cognitive load only",
                )}
              </option>
              <option value="preference">
                {t("当前任务与个人偏好", "Current task & personal preference")}
              </option>
            </select>
          </label>
          <Range
            label={t(
              "疲劳停止阈值（治理示意）",
              "Fatigue stop threshold (governance illustration)",
            )}
            value={fatigueLimit}
            min={0.4}
            max={1}
            onChange={setFatigueLimit}
          />
          <p>
            {t(
              "当前网页没有设备接入、账户或原始脑数据上传。禁止将任务内观测扩展为未经授权的健康、政治、宗教或人格推断。",
              "This website has no device connection, account or raw neural upload. Task observations must not be repurposed for unauthorized health, political, religious or personality inference.",
            )}
          </p>
          <div className="cl-hero-actions">
            <button
              className="cl-button cl-button-secondary"
              onClick={() => setPlaying(false)}
            >
              <CircleDot size={15} />
              {t("立即暂停闭环", "Pause the loop")}
            </button>
            <button
              className="cl-text-button cl-danger-text"
              onClick={() => {
                reset();
                setSelected(null);
                setDeleted(true);
              }}
            >
              <Trash2 size={15} />
              {t("清除本次实验", "Clear this session")}
            </button>
          </div>
          {deleted && (
            <small role="status">
              {t(
                "本次虚拟实验已清除。",
                "The virtual session has been cleared.",
              )}
            </small>
          )}
        </Panel>
      </div>
      <Panel
        title={t("逐轮查询与晋升记录", "Round-by-round query & promotion log")}
        actions={
          <span className="cl-mono">{experiment.rounds.length} ROUNDS</span>
        }
      >
        {experiment.rounds.length === 0 ? (
          <div className="cl-empty-state">
            <GitBranch size={30} />
            <h3>
              {t("每一次更新，都会留下来路。", "Every update has a history.")}
            </h3>
            <p>
              {t(
                "运行闭环实验后，这里会显示真实计算出的候选概率、教师风险与审计分支。",
                "Run the loop to inspect computed propensities, teacher risk and audit branches here.",
              )}
            </p>
            <button className="cl-inline-link" onClick={() => navigate("loop")}>
              {t("前往闭环实验室", "Open Loop Lab")}
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="cl-table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Round",
                    "Query",
                    "π(q)",
                    "Risk",
                    "ρ",
                    "Version",
                    "Audit",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {experiment.rounds.map((r, i) => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Round ${r.id}`}
                    onClick={() => setSelected(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelected(i);
                    }}
                    className={selected === i ? "cl-highlight-row" : ""}
                  >
                    <td>{r.id}</td>
                    <td>{r.selected.id}</td>
                    <td>{r.selected.propensity.toFixed(4)}</td>
                    <td>{r.teacher.risk.toFixed(4)}</td>
                    <td>{r.teacher.rho.toFixed(3)}</td>
                    <td>
                      {r.modelBefore} → {r.modelAfter}
                    </td>
                    <td>
                      <span className={`cl-status ${r.audit}`}>{r.audit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {record && (
          <details className="cl-json-record">
            <summary>
              {t("展开选中轮次的原始 JSON", "Expand the selected round JSON")} /{" "}
              {record.id}
            </summary>
            <pre>
              {JSON.stringify(
                {
                  ...record,
                  eeg: `8 channels × ${record.eeg[0].length} samples (included in download)`,
                  gaze: `${record.gaze.length} samples (included in download)`,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </Panel>
      <div className="cl-section-label">
        <span>!</span>
        <h2>
          {t(
            "负结果，也是完整的科研界面",
            "A complete interface includes negative results",
          )}
        </h2>
      </div>
      <div className="cl-boundary-grid">
        {researchBoundaries.map(([zh, en, zbody, ebody], i) => (
          <div key={en}>
            <span className="cl-mono">0{i + 1}</span>
            <h3>{t(zh, en)}</h3>
            <p>{t(zbody, ebody)}</p>
          </div>
        ))}
      </div>
      <div className="cl-download-bar">
        <Fingerprint size={23} />
        <p>
          {t(
            "论文中的汇总结果可以从稿件核对。只有提供冻结的原始日志、预处理配置与模型权重后，才能进行端到端复现实验。",
            "Manuscript aggregates can be checked against the paper. End-to-end experimental reproduction additionally requires frozen raw logs, preprocessing configurations and model weights.",
          )}
        </p>
        <InlineLink href="/cortex-loop/references/RELAY-supplement.pdf">
          {t("实验协议与证明", "Protocols & proofs")}
        </InlineLink>
      </div>
    </>
  );
}

function AboutView() {
  const { t, navigate } = useCortex();
  return (
    <>
      <PageHeading
        index="09"
        eyebrow="THE RESEARCH / OPEN QUESTIONS"
        title={
          <>
            {t("一种科学仪器，", "A scientific instrument")}
            <br />
            <em>{t("连接不同的智能。", "between intelligences.")}</em>
          </>
        }
        description={t(
          "CORTEX 研究如何将任务相关、跨人稳定且可验证的认知结构，转移到 AI 的中间计算中。闭环是下一步，而不是预设的结论。",
          "CORTEX studies how task-relevant, cross-person and verifiable cognitive structure can guide intermediate AI computation. The loop is a next step, not a foregone conclusion.",
        )}
      >
        <SourceTag kind="proposal" />
      </PageHeading>
      <section className="cl-manifesto">
        <span className="cl-mono">C / O / R / T / E / X</span>
        <h2>
          Cross-modal, Operator-aligned,
          <br />
          Risk-calibrated Trajectory Exchange
          <br />
          for eXplainable AI.
        </h2>
        <p>
          {t(
            "先蒸馏已有的认知轨迹，再主动寻找最值得蒸馏的认知轨迹。目标不是把人类永远放在模型之上，而是建立可解释、可验证、允许拒绝更新的认知传输基础设施。",
            "First distill existing cognitive trajectories. Then actively discover which trajectories are worth distilling next. The aim is an explainable, verifiable cognitive-transfer infrastructure that can also decline to update.",
          )}
        </p>
      </section>
      <div className="cl-section-label">
        <span>01</span>
        <h2>{t("从这里继续阅读", "Continue reading")}</h2>
      </div>
      <div className="cl-resource-grid">
        {[
          {
            title: "RELAY",
            body: t(
              "风险校准的人类神经轨迹蒸馏 · 作者修订稿",
              "Risk-calibrated human neural trajectory distillation · revised manuscript",
            ),
            href: "/cortex-loop/references/RELAY-main.pdf",
            label: t("论文全文 · PDF", "Full paper · PDF"),
          },
          {
            title: t("RELAY 补充材料", "RELAY Supplement"),
            body: t(
              "统计理论、路径兼容校准、独立风险审计与完整协议",
              "Statistical theory, path-compatible calibration, independent risk audit and full protocols",
            ),
            href: "/cortex-loop/references/RELAY-supplement.pdf",
            label: t("补充材料 · PDF", "Supplement · PDF"),
          },
          {
            title: t("CORTEX-Loop 研究计划", "CORTEX-Loop research proposal"),
            body: t(
              "理论推导、任务路线、实验阶梯与治理框架",
              "Theory, task roadmaps, experimental ladders and governance",
            ),
            href: "/cortex-loop/references/research-proposal.md",
            label: t("研究计划 · Markdown", "Research proposal · Markdown"),
          },
        ].map((r) => (
          <a
            className="cl-resource-card"
            key={r.title}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={25} />
            <h3>{r.title}</h3>
            <p>{r.body}</p>
            <span>
              {r.label}
              <ArrowUpRight size={15} />
            </span>
          </a>
        ))}
      </div>
      <div className="cl-section-label">
        <span>02</span>
        <h2>
          {t(
            "从静态基础，到完整闭环",
            "From static foundations to the full loop",
          )}
        </h2>
      </div>
      <div className="cl-roadmap">
        {[
          [
            "L0",
            "虚拟闭环",
            "Virtual loop",
            "验证状态机、去偏、哨兵与回滚；不作实证结论。",
            "Validate the state machine, debiasing, sentinels and rollback.",
          ],
          [
            "L1",
            "主动选题",
            "Active selection",
            "只改变题目选择，学生冻结，会话后离线训练。",
            "Change selection only; freeze the student and train offline.",
          ],
          [
            "L2",
            "在线适配",
            "Online adaptation",
            "固定题序，仅更新小型适配器，隔离稳定性。",
            "Fix the query order; update a small adapter to isolate stability.",
          ],
          [
            "L3",
            "完整闭环",
            "Full loop",
            "主动选题与在线更新结合，接受独立晋升审计。",
            "Combine selection and updates with independent promotion audits.",
          ],
          [
            "L4",
            "跨人跨会话",
            "Across people & sessions",
            "比较群体优先、个体优先和分层隐私聚合。",
            "Compare population-first, personal-first and private aggregation.",
          ],
          [
            "L5",
            "跨任务迁移",
            "Across tasks",
            "检验认知算子是否在新任务中减少人类试次。",
            "Test whether cognitive operators reduce human trials on new tasks.",
          ],
        ].map(([id, zh, en, zbody, ebody]) => (
          <div key={id}>
            <strong>{id}</strong>
            <h3>{t(zh, en)}</h3>
            <p>{t(zbody, ebody)}</p>
          </div>
        ))}
      </div>
      <section className="cl-contact-strip">
        <div>
          <span className="cl-eyebrow">RESEARCH & CONNECTIONS</span>
          <h2>Renwei Meng / {t("孟任巍", "Research portfolio")}</h2>
          <p>
            {t(
              "对认知蒸馏、可解释 AI 或闭环实验感兴趣，欢迎联系。",
              "Interested in cognitive distillation, explainable AI or closed-loop experiments? Get in touch.",
            )}
          </p>
        </div>
        <div>
          <InlineLink href="https://scholar.google.com/citations?user=kbo7-WcAAAAJ">
            Google Scholar
          </InlineLink>
          <InlineLink href="https://github.com/renweimeng">GitHub</InlineLink>
          <a className="cl-inline-link" href="mailto:R32314095@stu.ahu.edu.cn">
            R32314095@stu.ahu.edu.cn
            <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
      <div className="cl-final-cta">
        <Network size={28} />
        <h2>{t("探索，还可以继续。", "The exploration continues.")}</h2>
        <Action onClick={() => navigate("universe")}>
          {t("寻找下一个实验", "Design the next experiment")}
          <ArrowRight size={16} />
        </Action>
      </div>
    </>
  );
}
