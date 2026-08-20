import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createHospitalHubScene, type HubSceneHandle } from "@/game/hubScene";
import type { HubRoom, HubTouchHandlers } from "@/game/HospitalHub";

export default function HospitalHubCanvas({
  onDoorChange,
  onEnterRoom,
  touchHandlers,
  startRoomIndex,
}: {
  onDoorChange: (room: HubRoom | null) => void;
  onEnterRoom: (levelIndex: number) => void;
  touchHandlers: HubTouchHandlers;
  startRoomIndex?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onDoorChange, onEnterRoom, touchHandlers, startRoomIndex });
  callbacksRef.current = { onDoorChange, onEnterRoom, touchHandlers, startRoomIndex };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    engine.resize();
    let handle: HubSceneHandle | null = null;
    try {
      handle = createHospitalHubScene(engine, callbacksRef.current);
      engine.runRenderLoop(() => handle?.scene.render());
    } catch (error) {
      console.error("[HospitalHubCanvas] scene creation failed", error);
    }
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full outline-none" style={{ touchAction: "none" }} />;
}
