// Player.ts — kinematic doctor character for the 2D hospital platformer.
// Style: flat mission-control sprites (teal scrubs), chibi proportions.
// Physics: manual kinematic (gravity, AABB vs. floor segments), no physics plugin.
// Animation: idle sprite when standing; alternates idle/run frames at ~8Hz when
// walking, with a subtle vertical bob for life. Textures are pre-created once
// and swapped on the material — never recreated per frame.

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

const ANIM_FRAME_TIME = 0.11; // seconds per walk frame (≈9fps cycle)
const BOB_AMP = 0.09; // world units of vertical bob while walking

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
  private idleTex: Texture;
  private runTex: Texture;
  private animT = 0;
  private showingRun = false;
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

    // Pre-create both textures ONCE (no Texture allocation during gameplay).
    this.idleTex = new Texture(ASSETS.doctorIdle, scene);
    this.idleTex.hasAlpha = true;
    this.runTex = new Texture(ASSETS.doctorRun, scene);
    this.runTex.hasAlpha = true;

    const mat = new StandardMaterial("playerMat", scene);
    mat.diffuseTexture = this.idleTex;
    mat.emissiveTexture = this.idleTex;
    mat.emissiveColor.setAll(1);
    mat.specularColor.setAll(0);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    const plane = CreatePlane("playerPlane", { size: 1, updatable: true }, scene);
    plane.scaling.set(PLAYER_W * 1.6, PLAYER_H, 1);
    plane.material = mat;
    plane.parent = this.spriteFrame;
    plane.position.z = -0.1;
    this.plane = plane;
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
    this.animT = 0;
    this.showingRun = false;
  }

  update(dt: number, input: InputState, worldMaxX: number, dialogOpen: () => boolean) {
    if (dialogOpen()) {
      this.vx = 0;
      this.setFrame(false); // idle while talking
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
    const ny = this.root.position.y + this.vy * dt;

    // AABB vs floor segments
    this.root.position.x += this.vx * dt;
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

    // Walk animation: alternate idle/run frames at ~9fps while walking on ground
    if (moving && this.onGround) {
      this.animT += dt;
      if (this.animT >= ANIM_FRAME_TIME) {
        this.animT = 0;
        this.showingRun = !this.showingRun;
      }
      // Subtle stride bob at twice the frame rate
      this.spriteFrame.position.y = BOB_AMP * Math.sin((this.animT / ANIM_FRAME_TIME + (this.showingRun ? 0.5 : 0)) * Math.PI * 2);
    } else {
      this.showingRun = false;
      this.spriteFrame.position.y = 0;
    }
    this.setFrame(this.showingRun);

    // Facing: both sprites are drawn facing right (+x), so scale.x = +facing
    // (+1 = right, -1 = mirrored left). No negation — the texture's natural
    // orientation is the +x direction.
    this.spriteFrame.scaling.x = this.facing;
  }

  /** Swap the material texture between idle and run. Textures are pre-created. */
  private setFrame(run: boolean) {
    if (!this.plane || !this.plane.material) return;
    const mat = this.plane.material as StandardMaterial;
    const tex = run ? this.runTex : this.idleTex;
    if (mat.diffuseTexture === tex) return;
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
  }

  dispose() {
    this.spriteFrame.dispose(false, true);
    this.root.dispose(false, true);
  }
}
