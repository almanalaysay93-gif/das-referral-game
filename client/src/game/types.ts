// types.ts — shared platformer/triage types bridging Babylon world and React HUD.

import type { Action, Patient, Level } from "@/lib/patients";

export interface BedInfo {
  index: number; // patient index within level
  x: number; // world x of the bed
  assessed: boolean;
}

export interface TriagePayload {
  patient: Patient;
  bedIndex: number;
}

/** Bridge the game world calls into the React HUD. */
export interface TriageBridge {
  /** A patient bed is within interaction range. */
  onPatientNear?: (payload: TriagePayload) => void;
  /** Left interaction range without answering. */
  onPatientFar?: () => void;
  /** Player answered an action for the current case. */
  onAnswer?: (payload: { patient: Patient; action: Action; bedIndex: number }) => void;
  /** Level finished. */
  onLevelComplete?: (payload: { score: number; total: number; streak: number }) => void;
  /** Live HUD telemetry (score/streak/progress). */
  onTelemetry?: (payload: { score: number; streak: number; bedIndex: number; total: number }) => void;
  /** Is a dialog currently blocking movement? */
  dialogOpen: () => boolean;
}

export interface SceneOptions {
  bridge: TriageBridge;
  /** Deterministic demo run for screenshot verification. */
  demo?: boolean;
  /** Touch controls call this to move (direction, pressed) and jump (on press). */
  touchHandlers?: {
    onMove?: (dir: "left" | "right", pressed: boolean) => void;
    onJump?: () => void;
  };
  /** Level palette tint hue (0-360). */
  tintHue?: number;
}

export { Action, Patient, Level };
