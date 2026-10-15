"use client";
import { useEffect, useRef, useState } from "react";
import type { GridPoint } from "@/lib/cortex-loop/tasks";
import { useCortex } from "./CortexContext";

export default function SpatialScene({
  angle,
  occlusion,
  mode,
  blocks,
  path,
}: {
  angle: number;
  occlusion: number;
  mode: string;
  blocks: GridPoint[];
  path: GridPoint[];
}) {
  const mount = useRef<HTMLDivElement>(null),
    config = useRef({ angle, occlusion, mode, blocks, path });
  const [fallback, setFallback] = useState(false);
  const { t, reducedMotion } = useCortex();
  useEffect(() => {
    config.current = { angle, occlusion, mode, blocks, path };
  }, [angle, occlusion, mode, blocks, path]);
  useEffect(() => {
    let stop: (() => void) | undefined,
      cancelled = false;
    import("three")
      .then((T) => {
        if (cancelled || !mount.current) return;
        const el = mount.current;
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          setFallback(true);
          return;
        }
        renderer.setPixelRatio(Math.min(1.7, window.devicePixelRatio));
        el.appendChild(renderer.domElement);
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(7, 7, 9);
        camera.lookAt(0, 0, 0);
        scene.add(new T.AmbientLight("#b0b5d7", 2));
        const light = new T.DirectionalLight("#ffe1b5", 3);
        light.position.set(4, 7, 3);
        scene.add(light);
        const floor = new T.GridHelper(10, 20, "#4a455c", "#242230");
        floor.position.y = -0.55;
        scene.add(floor);
        const group = new T.Group();
        scene.add(group);
        const cubeGeometry = new T.BoxGeometry(0.92, 0.92, 0.92);
        const material = new T.MeshPhysicalMaterial({
          color: "#b2a1df",
          roughness: 0.28,
          metalness: 0.4,
          transparent: true,
          opacity: 0.86,
        });
        for (const [x, y, z] of [
          [0, 0, 0],
          [1, 0, 0],
          [2, 0, 0],
          [0, 1, 0],
          [0, 1, 1],
        ]) {
          const cube = new T.Mesh(cubeGeometry, material);
          cube.position.set(x - 0.9, y, z - 0.3);
          group.add(cube);
          const edges = new T.LineSegments(
            new T.EdgesGeometry(cubeGeometry),
            new T.LineBasicMaterial({
              color: "#d8d0ed",
              transparent: true,
              opacity: 0.6,
            }),
          );
          edges.position.copy(cube.position);
          group.add(edges);
        }
        const screen = new T.Mesh(
          new T.PlaneGeometry(4, 3.5),
          new T.MeshBasicMaterial({
            color: "#12161e",
            transparent: true,
            opacity: 0.95,
            side: T.DoubleSide,
          }),
        );
        screen.position.set(0, 0.5, 1.3);
        scene.add(screen);
        const room = new T.Group();
        scene.add(room);
        const wallMat = new T.MeshStandardMaterial({
          color: "#807097",
          roughness: 0.5,
          metalness: 0.2,
        });
        const tiles: InstanceType<typeof T.Mesh>[] = [];
        for (let x = 0; x < 7; x++)
          for (let y = 0; y < 7; y++) {
            const tile = new T.Mesh(
              new T.BoxGeometry(0.82, 0.07, 0.82),
              new T.MeshStandardMaterial({ color: "#161c27", roughness: 0.6 }),
            );
            tile.position.set(x - 3, -0.5, y - 3);
            room.add(tile);
            tiles.push(tile);
          }
        let signature = "",
          walls: InstanceType<typeof T.Mesh>[] = [],
          routeLine: InstanceType<typeof T.Line> | null = null;
        let frame = 0,
          yaw = 0.65,
          drag = false;
        const down = (e: PointerEvent) => {
          drag = true;
          el.setPointerCapture(e.pointerId);
        };
        const up = () => {
          drag = false;
        };
        const move = (e: PointerEvent) => {
          if (drag) yaw += e.movementX * 0.008;
        };
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointermove", move);
        const resize = new ResizeObserver(() => {
          const b = el.getBoundingClientRect();
          renderer.setSize(b.width, b.height);
          camera.aspect = b.width / Math.max(1, b.height);
          camera.updateProjectionMatrix();
        });
        resize.observe(el);
        let active = true;
        const observer = new IntersectionObserver(([e]) => {
          active = e.isIntersecting;
        });
        observer.observe(el);
        const render = () => {
          frame = requestAnimationFrame(render);
          if (!active || document.hidden) return;
          const c = config.current;
          group.visible = c.mode !== "navigation";
          room.visible = c.mode === "navigation";
          screen.visible = c.mode === "occlusion";
          group.rotation.y = (c.angle * Math.PI) / 180;
          screen.scale.x = c.occlusion * 1.3;
          screen.position.x = 1.8 - c.occlusion * 2;
          camera.position.set(Math.sin(yaw) * 11, 7, Math.cos(yaw) * 11);
          camera.lookAt(0, 0.3, 0);
          const nextSignature = JSON.stringify([c.blocks, c.path]);
          if (nextSignature !== signature) {
            signature = nextSignature;
            walls.forEach((w) => {
              room.remove(w);
              w.geometry.dispose();
            });
            walls = [];
            c.blocks.forEach(([x, y]) => {
              const wall = new T.Mesh(
                new T.BoxGeometry(0.88, 1, 0.88),
                wallMat,
              );
              wall.position.set(x - 3, 0, y - 3);
              room.add(wall);
              walls.push(wall);
            });
            if (routeLine) {
              room.remove(routeLine);
              routeLine.geometry.dispose();
              (routeLine.material as InstanceType<typeof T.Material>).dispose();
            }
            routeLine = new T.Line(
              new T.BufferGeometry().setFromPoints(
                c.path.map(([x, y]) => new T.Vector3(x - 3, -0.38, y - 3)),
              ),
              new T.LineBasicMaterial({ color: "#e8c491" }),
            );
            room.add(routeLine);
            tiles.forEach((tile, i) => {
              const x = Math.floor(i / 7),
                y = i % 7;
              const onPath = c.path.some((p) => p[0] === x && p[1] === y);
              (
                tile.material as InstanceType<typeof T.MeshStandardMaterial>
              ).color.set(onPath ? "#605039" : "#161c27");
            });
          }
          if (!reducedMotion) light.intensity = 2.8;
          renderer.render(scene, camera);
        };
        render();
        stop = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          observer.disconnect();
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointermove", move);
          scene.traverse((o) => {
            const mesh = o as InstanceType<typeof T.Mesh>;
            mesh.geometry?.dispose();
            (Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            ).forEach((m) => m?.dispose());
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [reducedMotion]);
  return (
    <div
      className="cl-spatial-webgl"
      ref={mount}
      role="img"
      aria-label={t(
        "可拖动旋转的空间推理场景",
        "Drag to rotate the spatial reasoning scene",
      )}
    >
      {fallback && (
        <svg viewBox="0 0 500 400">
          <g
            transform={`translate(250 200) rotate(${angle / 4})`}
            stroke="#b3a1db"
            fill="#373047"
          >
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${i * 60 - 120},0 l50,-30 50,30 -50,30z m0,0 v60 l50,30 50,-30 v-60 m-50,30 v60`}
              />
            ))}
          </g>
          <text x="20" y="380" fill="#bdb8cc">
            {t("二维空间降级视图", "2D spatial fallback")}
          </text>
        </svg>
      )}
    </div>
  );
}
