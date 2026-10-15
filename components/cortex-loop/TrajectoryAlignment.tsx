"use client";

import { useMemo, useRef, useState } from "react";
import { useCortex } from "./CortexContext";
import { Metric, Panel, Range, Segmented, SourceTag } from "./Primitives";

type Vec3 = [number, number, number];
const dot = (a: Vec3, b: Vec3) => a.reduce((s, v, i) => s + v * b[i], 0);
const rotate = (p: Vec3, angle: number): Vec3 => [
  p[0] * Math.cos(angle) - p[1] * Math.sin(angle),
  p[0] * Math.sin(angle) + p[1] * Math.cos(angle),
  p[2],
];

export function TrajectoryAlignment() {
  const { t } = useCortex();
  const [geometry, setGeometry] = useState("joint"),
    [training, setTraining] = useState(0.8),
    [yaw, setYaw] = useState(0.35);
  const drag = useRef(false);
  const data = useMemo(() => {
    const teacher: Vec3[] = Array.from({ length: 32 }, (_, i) => [
      Math.cos(i * 0.23) * 1.2,
      Math.sin(i * 0.23) * 0.8,
      (i / 31 - 0.5) * 2,
    ]);
    const student = teacher.map((point, i) => {
      const group = Math.floor(i / 8);
      // Per-window rotations preserve each within-window Gram but alter joint temporal geometry.
      const angle =
        geometry === "within"
          ? 0.5 + group * 0.9
          : geometry === "raw"
            ? 1.7 * (1 - training)
            : 0.5 * (1 - training);
      return rotate(point, angle);
    });
    const gram = (filter: boolean) => {
      let error = 0,
        n = 0;
      teacher.forEach((a, i) =>
        teacher.forEach((b, j) => {
          if (filter && Math.floor(i / 8) !== Math.floor(j / 8)) return;
          error += (dot(a, b) - dot(student[i], student[j])) ** 2;
          n++;
        }),
      );
      return error / n;
    };
    return {
      teacher,
      student,
      withinError: gram(true),
      jointError: gram(false),
    };
  }, [geometry, training]);
  const project = (p: Vec3) => {
    const r = rotate([p[0], p[2], p[1]], yaw);
    return [300 + r[0] * 110 + r[1] * 27, 165 - r[2] * 78 + r[1] * 28];
  };
  const points = (ps: Vec3[]) => ps.map((p) => project(p).join(",")).join(" ");
  return (
    <Panel
      title={t(
        "同一时刻相似，不等于变化过程相似",
        "Similar moments need not imply similar dynamics",
      )}
      actions={<SourceTag kind="concept" />}
    >
      <div className="cl-alignment-toolbar">
        <Segmented
          value={geometry}
          onChange={setGeometry}
          label={t("几何对齐对象", "Alignment geometry")}
          options={[
            { value: "raw", label: t("原始坐标", "Raw coordinates") },
            { value: "within", label: t("逐时刻几何", "Within-time geometry") },
            {
              value: "joint",
              label: t("联合轨迹几何", "Joint trajectory geometry"),
            },
          ]}
        />
        <span>{t("拖动旋转投影视角", "Drag to rotate the projection")}</span>
      </div>
      <div className="cl-alignment-workspace">
        <svg
          viewBox="0 0 600 330"
          role="img"
          aria-label={t(
            "人类与 AI 的三维联合轨迹投影",
            "Projected joint trajectories of human and AI states",
          )}
          onPointerDown={(e) => {
            drag.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerUp={() => {
            drag.current = false;
          }}
          onPointerMove={(e) => {
            if (drag.current) setYaw((y) => y + e.movementX * 0.008);
          }}
        >
          <path
            d="M80 255 L310 310 530 220 M310 310 L310 50 M80 255 L300 155 530 220"
            stroke="#7e659333"
            fill="none"
          />
          <polyline
            points={points(data.teacher)}
            fill="none"
            stroke="#d4b28a"
            strokeWidth="1.7"
            strokeOpacity=".8"
          />
          <polyline
            points={points(data.student)}
            fill="none"
            stroke="#a395cc"
            strokeWidth="1.7"
            strokeOpacity=".8"
          />
          {data.teacher.map((point, i) => {
            const [x, y] = project(point);
            const [sx, sy] = project(data.student[i]);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={i % 8 === 0 ? 4 : 1.6}
                  fill="#d4b28a"
                />
                <circle
                  cx={sx}
                  cy={sy}
                  r={i % 8 === 0 ? 4 : 1.6}
                  fill="#a395cc"
                />
                {geometry === "joint" && i % 4 === 0 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={sx}
                    y2={sy}
                    stroke="#d9c4e5"
                    strokeDasharray="2 4"
                    strokeOpacity=".3"
                  />
                )}
                {i % 8 === 0 && (
                  <text x={x + 8} y={y - 9} fill="#ac8b64" fontSize="9">
                    t{i / 8 + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div>
          <Metric
            label={t("逐时刻 Gram 误差", "Within-time Gram error")}
            value={data.withinError.toFixed(5)}
          />
          <Metric
            label={t("联合 Gram 误差", "Joint Gram error")}
            value={data.jointError.toFixed(5)}
            tone="cl-gold"
          />
          <p>
            {geometry === "within"
              ? t(
                  "每个时间窗各自旋转后，逐时刻几何完全不变，但跨时间关系已经改变。",
                  "Independent rotations preserve within-window geometry exactly, while changing temporal correspondence.",
                )
              : t(
                  "一个公共等距变换可以改变原始坐标，却不改变联合关系。这不意味着识别了唯一的神经编码。",
                  "A common isometry changes coordinates without changing joint relations. It does not identify a unique neural code.",
                )}
          </p>
        </div>
      </div>
      <Range
        label={t(
          "训练对齐进度（概念代理）",
          "Training alignment progress (conceptual proxy)",
        )}
        value={training}
        onChange={setTraining}
      />
    </Panel>
  );
}
