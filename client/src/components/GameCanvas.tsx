// GameCanvas.tsx — Babylon-in-React integration contract.
// Style: Mission Control (deep navy/teal/amber, mission-console feel). This canvas is the game paint.
//
// Safety: engine created exactly once (StrictMode guard), disposed on unmount, resize handled.

import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle, type TriageBridge } from "@/game/scene";

export interface GameCanvasProps {
  bridge: TriageBridge;
  levelIndex: number;
  demo?: boolean;
}

export default function GameCanvas({ bridge, levelIndex, demo }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  // Keep the latest bridge in a ref so HUD re-renders never recreate the engine.
  const bridgeRef = useRef(bridge);
  bridgeRef.current = bridge;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    // Guarantee non-zero render sizes before any scene math runs.
    engine.resize();

    let handle: GameHandle | null = null;
    createGameScene(engine, canvas, { bridge: bridgeRef.current, levelIndex, demo }).then((h) => {
      handle = h;
      engine.resize();
      engine.runRenderLoop(() => h.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return () => {
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, [levelIndex, demo]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full outline-none"
      style={{ touchAction: "none" }}
    />
  );
}
