"use client";

import { useEffect, useRef, useState } from "react";
import { useCortex } from "./CortexContext";

export default function BrainScene({
  depth = 2,
  variant = "brain",
  compact = false,
}: {
  depth?: number;
  variant?: "brain" | "loop";
  compact?: boolean;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ depth, variant });
  const { reducedMotion, t } = useCortex();
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    live.current = { depth, variant };
  }, [depth, variant]);

  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    import("three")
      .then((THREE) => {
        if (disposed) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          });
        } catch {
          setFallback(true);
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
        renderer.setClearColor(0x000000, 0);
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.set(0, 0.35, 7.7);
        const group = new THREE.Group();
        scene.add(group);
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [],
          colors: number[] = [];
        const gold = new THREE.Color("#e4b980"),
          lavender = new THREE.Color("#b7a9ed"),
          cyan = new THREE.Color("#91d9df");
        const count = window.innerWidth < 700 ? 8500 : 18500;
        // Two lobed, folded hemispheres; the surface is a concept model, not an anatomical reconstruction.
        for (let i = 0; i < count; i++) {
          const u = (i + 0.5) / count;
          const v = i * 2.399963229728653;
          const phi = Math.acos(1 - 2 * u);
          const sx = Math.sin(phi) * Math.cos(v),
            sy = Math.cos(phi),
            sz = Math.sin(phi) * Math.sin(v);
          const side = sx < 0 ? -1 : 1;
          const fold =
            1 +
            0.042 * Math.sin(phi * 30 + Math.sin(v * 5) * 2.8) +
            0.025 * Math.sin(v * 23 + phi * 9);
          const cleft = Math.abs(sx) < 0.11 ? 0.9 + Math.abs(sx) : 1;
          const x = side * (Math.abs(sx) * 1.67 + 0.045) * fold;
          const y = sy * 1.25 * fold * cleft + Math.max(0, sz) * 0.08;
          const z = sz * 1.46 * fold;
          positions.push(x, y, z);
          const c =
            side < 0
              ? gold.clone().lerp(cyan, (sz + 1) * 0.13)
              : lavender.clone().lerp(cyan, (sy + 1) * 0.18);
          const shade =
            0.55 + (Math.sin(phi * 30 + Math.sin(v * 5) * 2.8) + 1) * 0.2;
          colors.push(c.r * shade, c.g * shade, c.b * shade);
        }
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3),
        );
        const material = new THREE.PointsMaterial({
          size: 0.012,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const cloud = new THREE.Points(geometry, material);
        group.add(cloud);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: "#bb97ed",
          transparent: true,
          opacity: 0.13,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        for (let k = 0; k < 30; k++) {
          const pts = [];
          const phi = 0.15 + (k / 30) * 2.85;
          for (let j = 0; j <= 200; j++) {
            const v = (j / 200) * Math.PI * 2;
            const sx = Math.sin(phi) * Math.cos(v),
              sz = Math.sin(phi) * Math.sin(v);
            const fold =
              1 +
              0.042 * Math.sin(phi * 30 + Math.sin(v * 5) * 2.8) +
              0.025 * Math.sin(v * 23 + phi * 9);
            pts.push(
              new THREE.Vector3(
                Math.sign(sx) * (Math.abs(sx) * 1.67 + 0.045) * fold,
                Math.cos(phi) * 1.25 * fold,
                sz * 1.46 * fold,
              ),
            );
          }
          group.add(
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(pts),
              lineMaterial,
            ),
          );
        }
        const orbit = new THREE.Group();
        scene.add(orbit);
        const ringMaterials: InstanceType<typeof THREE.LineBasicMaterial>[] =
          [];
        for (let i = 0; i < 3; i++) {
          const pts = Array.from({ length: 181 }, (_, k) => {
            const a = (k / 180) * Math.PI * 2;
            return new THREE.Vector3(
              Math.cos(a) * (2.5 + i * 0.15),
              Math.sin(a) * (0.64 + i * 0.14),
              Math.sin(a) * 1.15,
            );
          });
          const mat = new THREE.LineBasicMaterial({
            color: i === 0 ? "#ddb281" : "#8c90c4",
            transparent: true,
            opacity: i === 0 ? 0.27 : 0.12,
          });
          ringMaterials.push(mat);
          orbit.add(
            new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat),
          );
        }
        const starGeometry = new THREE.BufferGeometry();
        const stars = [];
        for (let i = 0; i < 450; i++)
          stars.push(
            Math.sin(i * 32.1) * 6,
            Math.cos(i * 12.9) * 4,
            -2 - (i % 9) * 0.5,
          );
        starGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(stars, 3),
        );
        scene.add(
          new THREE.Points(
            starGeometry,
            new THREE.PointsMaterial({
              color: "#9aa5bf",
              size: 0.012,
              transparent: true,
              opacity: 0.45,
            }),
          ),
        );
        group.rotation.set(0.05, -0.48, -0.12);
        let frame = 0,
          active = true,
          pointer = { x: 0, y: 0 },
          dragging = false;
        const move = (event: PointerEvent) => {
          const box = element.getBoundingClientRect();
          pointer = {
            x: (event.clientX - box.left) / box.width - 0.5,
            y: (event.clientY - box.top) / box.height - 0.5,
          };
          if (dragging) group.rotation.y += event.movementX * 0.008;
        };
        const down = (event: PointerEvent) => {
          dragging = true;
          element.setPointerCapture(event.pointerId);
        };
        const up = () => {
          dragging = false;
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerdown", down);
        element.addEventListener("pointerup", up);
        const resize = new ResizeObserver(() => {
          const { width, height } = element.getBoundingClientRect();
          renderer.setSize(width, height);
          camera.aspect = width / Math.max(1, height);
          camera.updateProjectionMatrix();
        });
        resize.observe(element);
        const observer = new IntersectionObserver(([entry]) => {
          active = entry.isIntersecting;
        });
        observer.observe(element);
        const render = (time: number) => {
          frame = requestAnimationFrame(render);
          if (!active || document.hidden) return;
          if (!reducedMotion && !dragging) {
            group.rotation.y +=
              (-0.35 +
                pointer.x * 0.32 +
                Math.sin(time * 0.00012) * 0.16 -
                group.rotation.y) *
              0.018;
            group.rotation.x += (pointer.y * 0.13 - group.rotation.x) * 0.02;
            orbit.rotation.z = Math.sin(time * 0.00016) * 0.13;
          }
          cloud.rotation.y =
            live.current.variant === "loop"
              ? Math.sin(time * 0.0002) * 0.12
              : 0;
          material.opacity = 0.55 + live.current.depth * 0.08;
          ringMaterials[0].opacity = live.current.depth === 4 ? 0.65 : 0.27;
          renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(render);
        cleanup = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          observer.disconnect();
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerdown", down);
          element.removeEventListener("pointerup", up);
          scene.traverse((object) => {
            const mesh = object as InstanceType<typeof THREE.Mesh>;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            materials.forEach((mat) => mat?.dispose());
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return (
    <div className={`cl-brain-scene ${compact ? "cl-brain-compact" : ""}`}>
      <div
        ref={mount}
        className="cl-webgl"
        role="img"
        aria-label={t(
          "人类认知与 AI 状态的概念点云；拖动旋转",
          "Concept point cloud of human cognition and AI states; drag to rotate",
        )}
      />
      {fallback && (
        <svg
          className="cl-brain-fallback"
          viewBox="0 0 600 440"
          role="img"
          aria-label={t("认知轨迹二维降级图", "Cognitive trajectory fallback")}
        >
          <defs>
            <linearGradient id="cl-brain-g">
              <stop stopColor="#e4b980" />
              <stop offset="1" stopColor="#b7a9ed" />
            </linearGradient>
          </defs>
          {Array.from({ length: 38 }, (_, i) => (
            <ellipse
              key={i}
              cx={300 + Math.sin(i * 2.4) * 48}
              cy={215 + Math.cos(i * 1.7) * 20}
              rx={60 + i * 3}
              ry={25 + i * 2.5}
              transform={`rotate(${i * 4} 300 215)`}
              stroke="url(#cl-brain-g)"
              strokeOpacity=".45"
              fill="none"
              strokeDasharray="1 4"
            />
          ))}
          <ellipse
            cx="300"
            cy="235"
            rx="245"
            ry="75"
            fill="none"
            stroke="#b9a9d4"
            strokeOpacity=".3"
          />
        </svg>
      )}
      <div className="cl-brain-coordinate cl-mono">
        x 0.284 &nbsp; y 0.816 &nbsp; z 0.492
      </div>
    </div>
  );
}
