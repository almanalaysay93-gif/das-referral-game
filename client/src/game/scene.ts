// scene.ts — Babylon scene entry for the EMR-DAS hospital platformer.
// Style: mission-control navy corridor, orthographic side-scroller.

import type { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/standard.fragment";
import "@babylonjs/core/Shaders/ShadersInclude/clipPlaneVertexDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/clipPlaneVertex";
import "@babylonjs/core/Shaders/ShadersInclude/clipPlaneFragmentDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/clipPlaneFragment";
import "@babylonjs/core/Shaders/ShadersInclude/fogVertexDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/fogVertex";
import "@babylonjs/core/Shaders/ShadersInclude/fogFragmentDeclaration";
import "@babylonjs/core/Shaders/ShadersInclude/fogFragment";
import { levels } from "@/lib/patients";
import { GameWorld } from "./GameWorld";
import type { SceneOptions, TriageBridge } from "./types";

export interface GameHandle {
  scene: Scene;
  world: GameWorld;
  dispose: () => void;
}

export async function createGameScene(
  engine: Engine,
  _canvas: HTMLCanvasElement,
  options: SceneOptions & { levelIndex: number },
): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.05, 0.08, 0.12, 1);

  const levelIdx = Math.min(Math.max(options.levelIndex, 0), levels.length - 1);
  const level = levels[levelIdx];

  const tintHues = [200, 215, 235, 255, 275];
  const world = new GameWorld(scene, options.bridge, level, {
    demo: options.demo,
    tintHue: tintHues[levelIdx % tintHues.length],
    touchHandlers: options.touchHandlers,
  });
  // surface the handlers for the React HUD to attach
  const hudHandlers = { move: options.touchHandlers?.onMove, jump: options.touchHandlers?.onJump };
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("das-touch-ready", { detail: { onMove: hudHandlers.move, onJump: hudHandlers.jump } }),
    );
  }

  // Expose the world to the React HUD layer (Adventure page reads it via the
  // "das-world-ready" custom event). This avoids coupling game code to React.
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__dasWorld = world;
    // Defer the dispatch so the Adventure useEffect listener (mounted after
    // scene creation resolves) can still catch it.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("das-world-ready", { detail: world }));
    }, 0);
  }

  const dispose = () => {
    world.dispose();
    scene.dispose();
  };

  // Debug hook for diagnosing the invisible-texture issue from the browser console.
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__dasDebug = () => {
      const meshes = scene.meshes.map((m) => ({
        name: m.name,
        z: Math.round(m.getAbsolutePosition().z * 10) / 10,
        y: Math.round(m.getAbsolutePosition().y * 10) / 10,
        x: Math.round(m.getAbsolutePosition().x * 10) / 10,
        isEnabled: m.isEnabled(),
        isVisible: m.isVisible,
      }));
      const textures = scene.textures.map((t) => ({
        url: "url" in t ? (t as { url: string }).url : null,
        isReady: t.isReady(),
        hasAlpha: t.hasAlpha,
        size: typeof t.getSize === "function" ? (t as { getSize: () => { width: number; height: number } }).getSize() : null,
      }));
      const cam = scene.activeCamera;
      return {
        meshCount: meshes.length,
        meshes,
        textureCount: textures.length,
        textures,
        camera: cam
          ? {
              mode: (cam as { mode?: number }).mode,
              pos: cam.position.asArray().map((v: number) => Math.round(v * 10) / 10),
              ortho: [cam.orthoLeft, cam.orthoRight, cam.orthoTop, cam.orthoBottom].map(
                (v) => (v === null || v === undefined ? null : Math.round(v * 10) / 10),
              ),
            }
          : null,
        renderWidth: scene.getEngine().getRenderWidth(),
        renderHeight: scene.getEngine().getRenderHeight(),
      };
    };
  }

  return { scene, world, dispose };
}

export type { TriageBridge };
