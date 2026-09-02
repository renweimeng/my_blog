export type PublicationStatus = "accepted" | "under-review" | "preprint";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  status: PublicationStatus;
  href?: string;
  contribution?: {
    zh: string;
    en: string;
  };
}

export const publications: Publication[] = [
  {
    id: "normal-frechet-drift",
    title:
      "Normal Fréchet Drift: A Geometric Measure for Detecting Off-Manifold Deviation in Generative Models",
    authors: "Renwei Meng*, Yansen Han*, Tao Lin",
    venue: "International Conference on Learning Representations (ICLR)",
    year: 2027,
    status: "under-review",
    contribution: {
      zh: "共同一作，贡献相同",
      en: "Co-first authors; equal contribution",
    },
  },
  {
    id: "morph",
    title:
      "MORPH: Bi-Temporal Online Reinforcement Learning for Structure-Aware Music Flow Matching",
    authors: "Renwei Meng",
    venue: "AAAI Conference on Artificial Intelligence (AAAI)",
    year: 2027,
    status: "under-review",
  },
  {
    id: "know2guess",
    title:
      "Know2Guess: A Contamination-Aware Multi-Zone Benchmark for Knowledge-Boundary Evaluation in Large Language Models",
    authors: "Renwei Meng, Bowen Zhang, Jian Wang, et al.",
    venue: "International Conference on Neural Information Processing (ICONIP)",
    year: 2026,
    status: "accepted",
    href: "https://arxiv.org/abs/2606.26101",
  },
  {
    id: "craft",
    title:
      "Conditional Riemannian Adaptive Flow Transport for Cross-Subject EEG Decoding",
    authors: "Renwei Meng, Hongyi Zhang",
    venue:
      "23rd Pacific Rim International Conference on Artificial Intelligence (PRICAI)",
    year: 2026,
    status: "accepted",
  },
  {
    id: "group-resonance-network",
    title:
      "Group Resonance Network (GRN) for Cross-Subject EEG Emotion Recognition",
    authors: "Renwei Meng",
    venue: "International Conference on Artificial Neural Networks (ICANN)",
    year: 2026,
    status: "accepted",
    href: "https://arxiv.org/abs/2603.11119",
  },
  {
    id: "s-aodp-plus-plus",
    title:
      "S-AODP++: Structure-Aware AOI-Guided Scanpath Attention for AI-Generated Image Identification",
    authors: "Jingming Wang*, Renwei Meng*, Yunjie Si*",
    venue: "28th ACM International Conference on Multimodal Interaction (ICMI)",
    year: 2026,
    status: "accepted",
    href: "https://doi.org/10.1145/3776574.3831124",
    contribution: {
      zh: "共同一作，贡献相同",
      en: "Co-first authors; equal contribution",
    },
  },
  {
    id: "explainable-innovation-engine",
    title:
      "Explainable Innovation Engine: Dual-Tree Agent-RAG with Methods-as-Nodes and Verifiable Write-Back",
    authors: "Renwei Meng",
    venue: "arXiv preprint",
    year: 2026,
    status: "preprint",
    href: "https://arxiv.org/abs/2603.09192",
  },
  {
    id: "support-barrier-rlvr",
    title:
      "Breaking the Support Barrier in RLVR: A Fork-Conditional Reachability Criterion for Reliable Boundary Expansion",
    authors: "Renwei Meng",
    venue: "18th Asian Conference on Machine Learning (ACML)",
    year: 2026,
    status: "under-review",
  },
  {
    id: "vulnagent-r2",
    title:
      "VulnAgent-R2: Evidence-Calibrated Multi-Agent Auditing for Repository-Level Vulnerability Detection",
    authors: "Renwei Meng*, Haoyi Wu*, Jingming Wang*",
    venue: "18th Asian Conference on Machine Learning (ACML)",
    year: 2026,
    status: "under-review",
    href: "https://arxiv.org/abs/2603.13384",
    contribution: {
      zh: "共同一作，贡献相同",
      en: "Co-first authors; equal contribution",
    },
  },
];
