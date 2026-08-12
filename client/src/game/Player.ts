// Player.ts — kinematic doctor character for the 2D hospital platformer.
// Style: flat mission-control sprites (teal scrubs), chibi proportions.
// Physics: manual kinematic (gravity, AABB vs. floor segments), no physics plugin.

import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { InputState } from "./InputManager";
import { ASSETS } from "./assets";

export const PLAYER_W = 1.4; // world units
export const PLAYER_H = 2.6;

const SPEED = 6.2;
const GRAVITY = -26;
const JUMP_V = 11.5;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Player {
  root: TransformNode;
  private spriteFrame: TransformNode;
  private facing = 1; // 1 = right, -1 = left
  private vx = 0;
  private vy = 0;
  private onGround = false;
  private plane: import("@babylonjs/core/Meshes").Mesh;
  private cycleT = 0;
  private spriteOn = true; // toggled each cycle for run animation
  private frameIdx = 0;
  readonly yFloor: number;

  constructor(
    scene: Scene,
    private floors: Rect[],
    startX: number,
    yFloor: number,
  ) {
    this.yFloor = yFloor;
    this.root = new TransformNode("playerRoot", scene);
    this.root.position.set(startX, yFloor + PLAYER_H / 2, 5);

    // Idle frame — a child plane so we can swap textures without recreating meshes.
    this.spriteFrame = new TransformNode("playerSprite", scene);
    this.spriteFrame.parent = this.root;

    const idleMat = new StandardMaterial("playerIdleMat", scene);
    const idleTex = new Texture(ASSETS.doctorIdle, scene);
    idleTex.hasAlpha = true;
    idleMat.diffuseTexture = idleTex;
    idleMat.emissiveTexture = idleTex;
    idleMat.emissiveColor.setAll(1);
    idleMat.specularColor.setAll(0);
    idleMat.disableLighting = true;
    idleMat.backFaceCulling = false;
    const idle = CreatePlane("playerPlane", { size: 1, updatable: true }, scene);
    idle.scaling.set(PLAYER_W * 1.6, PLAYER_H, 1);
    idle.material = idleMat;
    idle.parent = this.spriteFrame;
    idle.position.z = -0.1;
    this.plane = idle;
  }

  get rect(): Rect {
    return {
      x: this.root.position.x - PLAYER_W / 2,
      y: this.root.position.y - PLAYER_H / 2,
      w: PLAYER_W,
      h: PLAYER_H,
    };
  }

  reset(x: number) {
    this.root.position.x = x;
    this.root.position.y = this.yFloor + PLAYER_H / 2;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
  }

  update(dt: number, input: InputState, worldMaxX: number, dialogOpen: () => boolean) {
    if (dialogOpen()) {
      this.vx = 0;
      return;
    }

    const moving = input.left !== input.right;

    // Horizontal
    if (input.left) {
      this.vx = -SPEED;
      this.facing = -1;
    } else if (input.right) {
      this.vx = SPEED;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // Jump
    if (input.jump && this.onGround) {
      this.vy = JUMP_V;
      this.onGround = false;
    }

    // Gravity
    this.vy += GRAVITY * dt;
    if (this.vy < -20) this.vy = -20;

    // Integrate
    let nx = this.root.position.x + this.vx * dt;
    const ny = this.root.position.y + this.vy * dt;

    // AABB vs floor segments
    this.root.position.x = nx;
    this.root.position.y = ny;
    this.onGround = false;

    const r = this.rect;
    for (const f of this.floors) {
      // horizontal overlap?
      if (r.x + r.w > f.x && r.x < f.x + f.w) {
        // landing on top
        if (this.vy <= 0 && r.y + r.h >= f.y && r.y + r.h <= f.y + f.h + this.vy * dt + 0.4) {
          this.root.position.y = f.y + r.h / 2;
          this.vy = 0;
          this.onGround = true;
        }
      }
    }

    // World bounds
    const maxX = worldMaxX - PLAYER_W / 2;
    if (this.root.position.x < PLAYER_W / 2) this.root.position.x = PLAYER_W / 2;
    if (this.root.position.x > maxX) this.root.position.x = maxX;

    // Run animation: toggle sprite at ~8Hz when moving on ground
    if (moving && this.onGround) {
      this.cycleT += dt;
      if (this.cycleT > 0.125) {
        this.cycleT = 0;
        this.spriteOn = !this.spriteOn;
        this.frameIdx = this.spriteOn ? 0 : 1;
      }
    } else {
      this.spriteOn = true;
      this.frameIdx = 0;
    }

    // Facing flip
    this.spriteFrame.scaling.x = -this.facing;
  }

  /** Set sprite to idle or run frame (call after scene textures loaded). */
  setFrame(frame: "idle" | "run") {
    // Swap the texture on the existing plane.
    if (!this.plane || !this.plane.material) return;
    const mat = this.plane.material as StandardMaterial;
    const newTex = new Texture(frame === "idle" ? ASSETS.doctorIdle : ASSETS.doctorRun, this.spriteFrame.getScene());
    newTex.hasAlpha = true;
    mat.diffuseTexture = newTex;
    mat.emissiveTexture = newTex;
  }

  dispose() {
    this.spriteFrame.dispose(false, true);
    this.root.dispose(false, true);
  }
}
