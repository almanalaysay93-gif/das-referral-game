// GameWorld.ts — orchestrates one level of the hospital platformer.
// Owns: orthographic camera, player, level, input, triage state machine.
// Triage flow: player near bed → bridge.onPatientNear → dialog opens (player frozen) →
// bridge.onAnswer → scored → dialog closes → next bed.

import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import type { Level, Action } from "@/lib/patients";
import { Player, PLAYER_W, type Rect } from "./Player";
import { LevelBuilder } from "./LevelBuilder";
import { InputManager } from "./InputManager";
import type { SceneOptions, TriageBridge } from "./types";

const TRIGGER_DIST = 2.1; // must stand beside active patient's rendered bed
const CAMERA_OFFSET_Y = 5.5;

export class GameWorld {
  private camera: FreeCamera;
  private player: Player;
  private level: LevelBuilder;
  private input: InputManager;
  private activeBed = 0; // next unassessed bed index
  private currentNear: number | null = null;
  private score = 0;
  private streak = 0;
  private ended = false;
  private t = 0;
  private bedGlowT = 0;
  private demo: boolean;
  private demoTimer = 0;

  constructor(
    private scene: Scene,
    private bridge: TriageBridge,
    level: Level,
    private opts: Partial<SceneOptions> = {},
  ) {
    this.demo = opts.demo ?? false;
    // Touch bridge hookup (options mutated above with handlers)
    const handlers: NonNullable<SceneOptions["touchHandlers"]> = { onMove: undefined, onJump: undefined };
    opts.touchHandlers = handlers;

    // --- Camera: orthographic side-scroller ---
    // Use engine render dimensions (canvas client size can be 0 at construction),
    // falling back to 16:9.
    this.camera = new FreeCamera("cam", new Vector3(0, CAMERA_OFFSET_Y, -10), scene);
    this.camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
    this.camera.orthoLeft = -10;
    this.camera.orthoRight = 10;
    this.camera.orthoTop = 7;
    this.camera.orthoBottom = -7;
    this.camera.setTarget(new Vector3(0, CAMERA_OFFSET_Y, 0));
    scene.activeCamera = this.camera;
    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, false);
    scene.clearColor = new Color4(0.05, 0.08, 0.12, 1);

    // --- Light ---
    const light = new HemisphericLight("ambientLight", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    // --- Level + player ---
    this.level = new LevelBuilder(scene, level, { tintHue: opts.tintHue, useTextures: true });
    const startX = 2; // before first bed, so Case 1 opens only on approach
    this.player = new Player(scene, this.level.floors, startX, this.level.floorY);

    // --- Input ---
    this.input = new InputManager();
    // Bridge touch buttons (from the React HUD) into the same input state
    if (opts.touchHandlers) {
      opts.touchHandlers.onMove = (dir, pressed) => this.input.setMove(dir, pressed);
      opts.touchHandlers.onJump = () => this.input.pressJump();
    }

    // --- Update loop ---
    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
      this.update(dt);
      // Resize-safe ortho frustum: recompute while render sizes are still zero
      const eng = scene.getEngine();
      const w = eng.getRenderWidth();
      const h = eng.getRenderHeight();
      if (w > 0 && h > 0) {
        const aspect = w / h;
        const halfH = 7;
        const halfW = halfH * aspect;
        this.camera.orthoLeft = -halfW;
        this.camera.orthoRight = halfW;
        this.camera.orthoTop = halfH;
        this.camera.orthoBottom = -halfH;
      }
    });
  }

  private update(dt: number) {
    this.t += dt;
    this.bedGlowT += dt;

    if (this.demo) {
      // AutoPilot: run right, stop at first bed
      this.demoTimer += dt;
      const bed = this.level.beds[0];
      if (bed) {
        this.input.setMove("right", true);
        if (this.player.rect.x + PLAYER_W / 2 >= bed.x - 1) {
          this.input.setMove("right", false);
        }
      }
    }

    this.player.update(dt, this.input.state, this.level.width, this.bridge.dialogOpen);
    this.input.endFrame();

    // Proximity to the active (next unassessed) bed
    const nextBed = this.level.beds.find((_, i) => i === this.activeBed);
    if (nextBed) {
      const dist = Math.abs(this.player.rect.x + PLAYER_W / 2 - nextBed.x); // rect always valid after reset
      if (dist < TRIGGER_DIST && this.currentNear === null) {
        this.currentNear = this.activeBed;
        this.bridge.onPatientNear?.({ patient: nextBed.patient, bedIndex: this.activeBed });
      } else if (dist >= TRIGGER_DIST && this.currentNear !== null && this.bridge.dialogOpen()) {
        // walked away while dialog open — leave it open, player frozen
      }
    }

    // Camera follow
    const targetX = this.player.root.position.x;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.12;
    const left = this.camera.orthoLeft ?? -10;
    const right = this.camera.orthoRight ?? 10;
    const camHalfW = (right - left) / 2;
    const minX = camHalfW;
    const maxX = this.level.width - camHalfW;
    if (this.camera.position.x < minX) this.camera.position.x = minX;
    if (this.camera.position.x > maxX) this.camera.position.x = maxX;

    // Live telemetry
    this.bridge.onTelemetry?.({
      score: this.score,
      streak: this.streak,
      bedIndex: Math.min(this.activeBed + 1, this.level.beds.length),
      total: this.level.beds.length,
    });
  }

  /** Called by HUD when the player submits an action for the near patient. */
  submitAnswer(action: Action) {
    if (this.currentNear === null) return;
    const bed = this.level.beds[this.currentNear];
    if (!bed) return;

    const correct = bed.patient.action === action;
    if (correct) {
      this.score += 1;
      this.streak += 1;
    } else {
      this.streak = 0;
    }
    bed.assessed = true;
    this.bridge.onAnswer?.({ patient: bed.patient, action, bedIndex: this.currentNear });

    this.currentNear = null;
    this.activeBed += 1;

    if (this.activeBed >= this.level.beds.length && !this.ended) {
      this.ended = true;
      // small delay so the last answer's feedback shows first
      setTimeout(() => {
        this.bridge.onLevelComplete?.({
          score: this.score,
          total: this.level.beds.length,
          streak: this.streak,
        });
      }, 1500);
    }
  }

  get nearBedIndex(): number | null {
    return this.currentNear;
  }

  restart() {
    const start = 2;
    this.player.reset(start);
    this.activeBed = 0;
    this.currentNear = null;
    this.score = 0;
    this.streak = 0;
    this.ended = false;
    this.camera.position.x = start;
  }

  dispose() {
    this.input.dispose();
    this.level.dispose();
    this.player.dispose();
  }
}
