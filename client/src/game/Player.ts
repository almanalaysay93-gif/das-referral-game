// Player.ts — kinematic doctor character for the 2D hospital platformer.
// Features a smooth 7-frame walking animation cycle using Dr. Luna sprite frames.

import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { InputState } from "./InputManager";
import { ASSETS } from "./assets";

export const PLAYER_W = 2.4; // world units
export const PLAYER_H = 4.2;

const SPEED = 6.8;
const GRAVITY = -26;
const JUMP_V = 12.0;

const FRAME_DURATION = 0.09; // authored pixel-art cadence: ~11fps

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
  private walkTextures: Texture[] = [];
  private frameIndex = 0;
  private animTimer = 0;
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

    // Idle & walking frame root
    this.spriteFrame = new TransformNode("playerSprite", scene);
    this.spriteFrame.parent = this.root;

    // Pre-create all 7 walk cycle textures ONCE for high-performance frame swapping
    this.walkTextures = ASSETS.doctorWalkFrames.map((url) => {
      const tex = new Texture(url, scene);
      tex.hasAlpha = true;
      tex.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
      return tex;
    });

    const mat = new StandardMaterial("playerMat", scene);
    const initialTex = this.walkTextures[0];
    mat.diffuseTexture = initialTex;
    mat.emissiveTexture = initialTex;
    mat.useAlphaFromDiffuseTexture = true;
    mat.emissiveColor.setAll(1);
    mat.specularColor.setAll(0);
    mat.disableLighting = true;
    mat.backFaceCulling = false;

    const plane = CreatePlane("playerPlane", { size: 1, updatable: true }, scene);
    // Scaled for crisp proportion matching the hospital beds & nightstands
    plane.scaling.set(5.2, 6.6, 1);
    plane.material = mat;
    plane.parent = this.spriteFrame;
    // Align visual feet to physics floor
    plane.position.set(0, 1.2, -0.1);
    this.plane = plane;
  }

  /** Changes rendered sprite scale only. Collision body and walk behavior stay unchanged. */
  setVisualScale(scale: number) {
    const safeScale = Math.min(Math.max(scale, 0.5), 1.25);
    const visualHeight = 6.6 * safeScale;
    this.plane.scaling.set(5.2 * safeScale, visualHeight, 1);
    // Keep shoes on the authored physics floor after visual-only resizing.
    this.plane.position.y = visualHeight / 2 - PLAYER_H / 2;
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
    this.onGround = true;
    this.animTimer = 0;
    this.frameIndex = 0;
    this.spriteFrame.rotation.z = 0;
    this.setWalkFrame(0);
  }

  update(dt: number, input: InputState, worldMaxX: number, dialogOpen: () => boolean) {
    if (dialogOpen()) {
      this.vx = 0;
      this.resetAnimationPose();
      return;
    }

    const moving = input.left !== input.right;

    // Horizontal movement
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

    // Integration
    const ny = this.root.position.y + this.vy * dt;
    this.root.position.x += this.vx * dt;
    this.root.position.y = ny;
    this.onGround = false;

    const feetY = this.root.position.y - PLAYER_H / 2;
    const r = this.rect;

    // Check collision with floors
    for (const f of this.floors) {
      if (r.x + r.w > f.x && r.x < f.x + f.w) {
        const floorTop = f.y;
        if (this.vy <= 0 && feetY <= floorTop + 0.4) {
          this.root.position.y = floorTop + PLAYER_H / 2;
          this.vy = 0;
          this.onGround = true;
          break;
        }
      }
    }

    // Safety Floor Clamp: Character can NEVER drop below the hospital floor level
    const minCenterY = this.yFloor + PLAYER_H / 2;
    if (this.root.position.y < minCenterY) {
      this.root.position.y = minCenterY;
      this.vy = 0;
      this.onGround = true;
    }

    // World bounds
    const maxX = worldMaxX - PLAYER_W / 2;
    if (this.root.position.x < PLAYER_W / 2) this.root.position.x = PLAYER_W / 2;
    if (this.root.position.x > maxX) this.root.position.x = maxX;

    // Sprite frames already contain foot lift, body rise, and stride. Keep the
    // plane foot-locked instead of adding a second procedural bob/tilt.
    if (moving && this.onGround) {
      this.animTimer += dt;
      while (this.animTimer >= FRAME_DURATION) {
        this.animTimer -= FRAME_DURATION;
        this.frameIndex = (this.frameIndex + 1) % this.walkTextures.length;
      }
      this.setWalkFrame(this.frameIndex);
    } else {
      this.resetAnimationPose();
    }

    this.spriteFrame.scaling.x = this.facing;
  }

  /** Swap the material texture across the 7 walk cycle frames */
  private setWalkFrame(index: number) {
    if (!this.plane || !this.plane.material || !this.walkTextures[index]) return;
    const mat = this.plane.material as StandardMaterial;
    const tex = this.walkTextures[index];
    if (mat.diffuseTexture === tex) return;
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
  }

  private resetAnimationPose() {
    this.animTimer = 0;
    this.frameIndex = 0;
    this.spriteFrame.position.y = 0;
    this.spriteFrame.rotation.z = 0;
    this.setWalkFrame(0);
  }

  dispose() {
    this.spriteFrame.dispose(false, true);
    this.root.dispose(false, true);
  }
}
