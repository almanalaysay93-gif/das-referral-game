import type { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HospitalHub, type HubRoom, type HubTouchHandlers } from "./HospitalHub";

export interface HubSceneHandle {
  scene: Scene;
  hub: HospitalHub;
  dispose: () => void;
}

export function createHospitalHubScene(
  engine: Engine,
  callbacks: {
    onDoorChange: (room: HubRoom | null) => void;
    onEnterRoom: (levelIndex: number) => void;
    touchHandlers?: HubTouchHandlers;
    startRoomIndex?: number;
  },
): HubSceneHandle {
  const scene = new Scene(engine);
  const hub = new HospitalHub(scene, callbacks.onDoorChange, callbacks.onEnterRoom, callbacks.touchHandlers, callbacks.startRoomIndex);
  return { scene, hub, dispose: () => { hub.dispose(); scene.dispose(); } };
}
