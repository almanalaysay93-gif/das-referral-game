// LevelBuilder.ts — builds one long hospital-corridor level from DAS patient data.
// Style: mission-control navy/teal corridor with amber door lights and cyan monitors.

import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Level, Patient } from "@/lib/patients";
import { ASSETS } from "./assets";
import type { Rect } from "./Player";

export interface BuiltBed {
  patient: Patient;
  x: number;
  root: import("@babylonjs/core/Meshes/transformNode").TransformNode;
  assessed: boolean;
}

const UNIT = 12; // world units per patient room
const FLOOR_Y = 0;
const BG_HEIGHT = 14;

export class LevelBuilder {
  private disposables: { dispose: () => void }[] = [];
  readonly beds: BuiltBed[] = [];
  readonly floors: Rect[];
  readonly width: number;

  private useTextures: boolean;
  private tintHue?: number;

  constructor(
    private scene: Scene,
    level: Level,
    opts: { tintHue?: number; useTextures?: boolean } = {},
  ) {
    this.useTextures = opts.useTextures ?? true;
    this.tintHue = opts.tintHue;
    this.width = level.patients.length * UNIT + 14;

    // --- Background corridor (tiled, full length) ---
    const bgMat = new StandardMaterial("bgMat", scene);
    if (opts.useTextures) {
      const bgTex = new Texture(ASSETS.corridor, scene);
      bgTex.uScale = Math.max(1, this.width / 24);
      bgTex.vScale = 1;
      bgMat.diffuseTexture = bgTex;
      bgMat.emissiveTexture = bgTex;
    } else {
      bgMat.diffuseColor.set(0.25, 0.32, 0.42);
    }
    bgMat.emissiveColor.setAll(1);
    bgMat.specularColor.setAll(0);
    bgMat.disableLighting = true;
    bgMat.backFaceCulling = false;
    const bg = CreatePlane("bg", { width: this.width, height: BG_HEIGHT }, scene);
    bg.position.set(this.width / 2, FLOOR_Y + BG_HEIGHT / 2, 40);
    bg.material = bgMat;
    // Per-level palette tint: slight tint at full brightness (textures are already bright)
    if (this.tintHue !== undefined) {
      const tint = Color3.FromHSV(this.tintHue / 360, 0.12, 1);
      bgMat.emissiveColor = tint;
    } else {
      bgMat.emissiveColor.setAll(1);
    }

    // --- Floor band ---
    const floorMat = new StandardMaterial("floorMat", scene);
    if (opts.useTextures) {
      const floorTex = new Texture(ASSETS.floor, scene);
      floorTex.uScale = Math.max(1, this.width / 30);
      floorMat.diffuseTexture = floorTex;
      floorMat.emissiveTexture = floorTex;
    } else {
      floorMat.diffuseColor.set(0.45, 0.48, 0.55);
    }
    floorMat.emissiveColor.setAll(1);
    floorMat.specularColor.setAll(0);
    floorMat.disableLighting = true;
    floorMat.backFaceCulling = false;
    const floor = CreatePlane("floor", { width: this.width, height: 3.2 }, scene);
    floor.position.set(this.width / 2, FLOOR_Y - 1.6, 20);
    floor.material = floorMat;

    // Walkable floor segments (one per room, with small gaps for rhythm)
    const segments: Rect[] = [];
    for (let i = 0; i < level.patients.length; i++) {
      const cx = (i + 0.5) * UNIT + 7;
      segments.push({ x: cx - UNIT / 2 + 0.5, y: FLOOR_Y, w: UNIT - 1, h: 4 });
    }
    this.floors = segments;

    // --- Doors + beds ---
    for (let i = 0; i < level.patients.length; i++) {
      const p = level.patients[i];
      const cx = (i + 0.5) * UNIT + 7;
      this.placeDoor(cx - 2.6, i % 2 === 0);
      this.beds.push(this.placeBed(p, cx + 2.4, i)); // opts captured via class fields
    }

    // --- End wall with amber exit beacon ---
    const endMat = new StandardMaterial("endMat", this.scene);
    endMat.emissiveColor.set(0.45, 0.3, 0.05);
    endMat.backFaceCulling = false;

    const endWall = CreatePlane("endWall", { width: 2, height: BG_HEIGHT }, scene);
    endWall.position.set(this.width - 2, FLOOR_Y + BG_HEIGHT / 2, 30);
    endWall.material = endMat;
  }

  private placeDoor(x: number, flip: boolean) { // uses this.useTextures
    const doorMat = new StandardMaterial("doorMat", this.scene);
    if (this.useTextures) {
      const doorTex = new Texture(ASSETS.door, this.scene);
      doorTex.hasAlpha = true;
      doorMat.diffuseTexture = doorTex;
      doorMat.emissiveTexture = doorTex;
      doorMat.transparencyMode = 1; // Material.MATERIAL_ALPHATEST — cuts the sprite bg
    } else {
      doorMat.diffuseColor.set(0.15, 0.45, 0.5);
    }
    doorMat.emissiveColor.setAll(1);
    doorMat.specularColor.setAll(0);
    doorMat.disableLighting = true;
    doorMat.backFaceCulling = false;
    const door = CreatePlane("door", { width: 3.4, height: 5 }, this.scene);
    door.position.set(x, FLOOR_Y + 2.5, 8);
    door.material = doorMat;
    if (flip) door.scaling.x = -1;
  }

  private placeBed(patient: Patient, x: number, index: number): BuiltBed { // uses this.useTextures
    const root = new TransformNode(`bed${index}`, this.scene);
    root.position.set(x, FLOOR_Y, 10);

    const mat = new StandardMaterial(`bedMat${index}`, this.scene);
    if (this.useTextures) {
      const texUrl = index % 2 === 0 ? ASSETS.bedA : ASSETS.bedB;
      const tex = new Texture(texUrl, this.scene);
      tex.hasAlpha = true;
      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;
    } else {
      mat.diffuseColor.set(0.75, 0.78, 0.82);
    }
    mat.emissiveColor.setAll(1);
    mat.specularColor.setAll(0);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    const plane = CreatePlane(`bedPlane${index}`, { width: 4.6, height: 3.4 }, this.scene);
    plane.material = mat;
    plane.parent = root;
    plane.position.set(0, 1.8, -0.1);

    // Bed index marker (small amber plaque over the bed)
    const plaqueMat = new StandardMaterial(`plaqueMat${index}`, this.scene);
    plaqueMat.emissiveColor.set(0.9, 0.65, 0.1);
    plaqueMat.specularColor.setAll(0);
    plaqueMat.backFaceCulling = false;
    const plaque = CreatePlane(`plaque${index}`, { width: 1.1, height: 0.55 }, this.scene);
    plaque.position.set(0, 4.1, -0.2);
    plaque.material = plaqueMat;
    plaque.parent = root;

    this.disposables.push(root, mat, plane, plaqueMat, plaque);
    return { patient, x, root, assessed: false };
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
