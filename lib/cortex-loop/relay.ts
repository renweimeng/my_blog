import { normal, seededRandom } from "./simulation";

export const relayResults = [
  { method: "ERM", accuracy: 62.75, sd: 2.69, nll: 1.049 },
  { method: "Anchor-fixed", accuracy: 63.0, sd: 3.6, nll: 1.049 },
  { method: "Anchor-selected", accuracy: 63.38, sd: 4.21, nll: 1.035 },
  { method: "Raw-EEG", accuracy: 64.5, sd: 4.02, nll: 1.008 },
  { method: "Static", accuracy: 64.62, sd: 3.93, nll: 0.992 },
  { method: "Time-wise", accuracy: 65.72, sd: 5.05, nll: 0.979 },
  { method: "Constant-rho", accuracy: 66.55, sd: 3.28, nll: 0.952 },
  { method: "Full-space", accuracy: 70.85, sd: 3.87, nll: 0.851 },
  { method: "RELAY", accuracy: 71.47, sd: 3.18, nll: 0.827 },
];

export function makeKernel(
  donors: number,
  noise: number,
  cross: boolean,
  channels = 32,
) {
  const random = seededRandom(20261015);
  const features = Array.from({ length: donors }, () =>
    Array.from({ length: 8 }, (_, i) =>
      Array.from(
        { length: channels },
        (_, k) =>
          Math.sin(i * 0.55 + k * 0.23) * 0.55 +
          Math.cos(i * 0.3 - k * 0.34) * 0.25 +
          normal(random) * noise,
      ),
    ),
  );
  const sum = Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: channels }, (_, k) =>
      features.reduce((n, donor) => n + donor[i][k], 0),
    ),
  );
  const kernel = Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => {
      const dot = sum[i].reduce((n, value, k) => n + value * sum[j][k], 0);
      const self = features.reduce(
        (n, donor) =>
          n +
          donor[i].reduce((total, value, k) => total + value * donor[j][k], 0),
        0,
      );
      return (
        (cross
          ? (dot - self) / (donors * (donors - 1))
          : dot / (donors * donors)) / channels
      );
    }),
  );
  return {
    raw: kernel,
    display: kernel.map((row) =>
      row.map((v) => Math.max(0, Math.min(1, v + 0.45))),
    ),
    traces: features.slice(0, 20).map((donor) => donor.map((row) => row[0])),
  };
}

export function enumeratePaths() {
  const paths: number[][] = [];
  const visit = (path: number[]) => {
    if (path.length === 8) {
      if (path[7] === 4) paths.push(path);
      return;
    }
    const previous = path.at(-1) ?? 1;
    for (const next of [previous, previous + 1])
      if (next <= 4) visit([...path, next]);
  };
  visit([1]);
  return paths;
}

export function scorePath(path: number[]) {
  const target = Array.from({ length: 8 }, (_, i) =>
    Array.from({ length: 8 }, (_, j) => Math.cos((i - j) * 0.5) * 0.3 + 0.5),
  );
  const projected = target.map((_, i) =>
    target.map((__, j) => {
      let total = 0,
        count = 0;
      target.forEach((row, a) =>
        row.forEach((v, b) => {
          if (path[a] === path[i] && path[b] === path[j]) {
            total += v;
            count++;
          }
        }),
      );
      return total / count;
    }),
  );
  const floor =
    target.reduce(
      (sum, row, i) =>
        sum + row.reduce((s, v, j) => s + (v - projected[i][j]) ** 2, 0),
      0,
    ) / 64;
  const learnable =
    projected.reduce(
      (sum, row, i) =>
        sum +
        row.reduce(
          (s, v, j) =>
            s + (v - (0.55 + 0.22 * Math.cos((path[i] - path[j]) * 0.8))) ** 2,
          0,
        ),
      0,
    ) / 64;
  return {
    floor,
    learnable,
    score: floor + (learnable * 0.05) / (learnable + 0.05),
    projected,
  };
}
