import type { CortexPage } from "./types";

export const pageInfo: {
  id: CortexPage;
  zh: string;
  en: string;
  short: string;
  group: "main" | "more";
}[] = [
  { id: "home", zh: "概览", en: "Overview", short: "00", group: "main" },
  { id: "relay", zh: "RELAY", en: "RELAY", short: "01", group: "main" },
  { id: "loop", zh: "闭环实验室", en: "Loop Lab", short: "02", group: "main" },
  { id: "aesthetic", zh: "审美", en: "Aesthetics", short: "03", group: "main" },
  { id: "space", zh: "空间", en: "Spatial", short: "04", group: "main" },
  {
    id: "agent-world",
    zh: "智能体",
    en: "Agent World",
    short: "05",
    group: "main",
  },
  {
    id: "universe",
    zh: "范式宇宙",
    en: "Universe",
    short: "06",
    group: "more",
  },
  { id: "theory", zh: "交互理论", en: "Theory", short: "07", group: "more" },
  { id: "audit", zh: "数据审计", en: "Audit", short: "08", group: "more" },
  {
    id: "about",
    zh: "研究与资源",
    en: "Resources",
    short: "09",
    group: "more",
  },
];

export const concepts = [
  ["关系推理", "Relational reasoning"],
  ["遮挡补全", "Occlusion completion"],
  ["证据整合", "Evidence integration"],
  ["空间旋转", "Mental rotation"],
  ["冲突检测", "Conflict detection"],
  ["计划与验证", "Planning & verification"],
] as const;

export const phaseCopy = {
  select: [
    "选择下一题",
    "Select a query",
    "根据当前能力盲点和人类成本，从候选池采样，并记录每个候选的选择概率。",
    "Sample from the candidate pool using skill gaps and human cost. Log every selection probability.",
  ],
  human: [
    "观察人类过程",
    "Observe cognition",
    "虚拟参与者作答。注意、证据、冲突与决策生成彼此对齐的神经和行为轨迹。",
    "A virtual participant responds. Attention, evidence, conflict and decision generate aligned neural and behavioral trajectories.",
  ],
  segment: [
    "流式分段",
    "Segment the stream",
    "定位刺激、注意转移与决策边界；边界变化会影响有效教师质量。",
    "Locate stimulus, attention and decision boundaries. Boundary changes affect the effective quality of the teacher.",
  ],
  teacher: [
    "构造认知教师",
    "Build the teacher",
    "先估计跨被试公共结构，再投影到学生可表达空间，并按方差与漂移收缩。",
    "Estimate shared cross-donor structure, project into the student-compatible space, then shrink by variance and drift.",
  ],
  shadow: [
    "更新影子模型",
    "Update a shadow model",
    "只更新小参数适配器，使用信任域限制更新幅度，并通过回放保护旧能力。",
    "Update a small adapter within a trust region. Replay protects previously learned skills.",
  ],
  audit: [
    "独立哨兵审计",
    "Independent audit",
    "在固定、均衡的哨兵分布上检查性能、校准、遗忘和能力差异。",
    "Check performance, calibration, forgetting and skill disparity on a fixed, balanced sentinel distribution.",
  ],
  decision: [
    "晋升或回滚",
    "Promote or roll back",
    "证据充分时晋升；性能下降时回滚；证据不足时仅缓存数据。",
    "Promote with sufficient evidence, roll back on degradation, or cache when evidence is insufficient.",
  ],
  next: [
    "闭环，再次提问",
    "Close the loop",
    "本轮改变的模型能力决定下一次最值得向人类学习的内容。",
    "The updated skill map determines what is worth learning from humans next.",
  ],
} as const;

export const researchBoundaries = [
  [
    "几何对齐不等于读心",
    "Geometry is not mind reading",
    "核匹配识别的是任务相关结构的等价类，不是唯一神经编码或具体思想。",
    "Kernel matching identifies equivalence classes of task-relevant structure, not unique neural codes or private thoughts.",
  ],
  [
    "相关性不是因果使用",
    "Correlation is not causal use",
    "只有匹配秩与能量的干预对照，才能进一步检验对齐方向是否进入决策通路。",
    "Rank- and energy-matched interventions are needed to test whether aligned directions enter the decision pathway.",
  ],
  [
    "没有普遍的审美真值",
    "No universal aesthetic truth",
    "群体共性与个体偏好必须分别保留，不能用群体均值覆盖个人判断。",
    "Shared structure and personal preferences must remain distinct; a population mean cannot replace an individual's judgment.",
  ],
  [
    "允许拒绝更新",
    "Abstention is a valid outcome",
    "教师没有条件创新、漂移过强或独立证据不足时，权重可以为零。",
    "Teacher weight may be zero when conditional innovation is absent, drift is excessive, or evidence is insufficient.",
  ],
] as const;
