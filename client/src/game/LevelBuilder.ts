// LevelBuilder.ts — builds one long hospital-corridor level from DAS patient data.
// Style: mission-control navy/teal corridor with amber door lights and cyan monitors.
// Safety: continuous walkable floor across the entire corridor length.

import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
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
const FLOOR_Y = -1.2;
const BG_TILE_WIDTH = 60;
// Preserve generated 1774 × 887 background ratio.
const BG_HEIGHT = BG_TILE_WIDTH * (887 / 1774);
// Frame lower ward section: full beds, wheels, and walkable platform stay visible.
const BG_CENTER_Y = 7.8;
const BED_X_IN_TILE = [7.4, 18.4, 29.15, 40.05, 51.1] as const;

export class LevelBuilder {
  private disposables: { dispose: () => void }[] = [];
  readonly beds: BuiltBed[] = [];
  readonly floors: Rect[];
  readonly width: number;
  readonly floorY = FLOOR_Y;

  private useTextures: boolean;
  constructor(
    private scene: Scene,
    level: Level,
    opts: { tintHue?: number; useTextures?: boolean } = {},
  ) {
    this.useTextures = opts.useTextures ?? true;
    this.width = level.patients.length * UNIT + 14;

    // --- Background corridor (tiled, full length) ---
    const bgMat = new StandardMaterial("bgMat", scene);
    if (opts.useTextures) {
      const backgroundIndex = Math.min(Math.max(level.id - 1, 0), ASSETS.levelBackgrounds.length - 1);
      const bgTex = new Texture(ASSETS.levelBackgrounds[backgroundIndex], scene);
      bgTex.wrapU = Texture.WRAP_ADDRESSMODE;
      // Ward source has five visible beds. One bay maps to one 12-unit case.
      bgTex.uScale = Math.max(1, this.width / BG_TILE_WIDTH);
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
    bg.position.set(this.width / 2, BG_CENTER_Y, 40);
    bg.material = bgMat;
    // Generated backgrounds carry their own level-specific palettes.
    bgMat.emissiveColor.setAll(1);

    // Solid continuous walkable hospital floor across the entire corridor length
    this.floors = [{ x: 0, y: FLOOR_Y, w: this.width, h: 4 }];

    // --- Doors + beds ---
    for (let i = 0; i < level.patients.length; i++) {
      const p = level.patients[i];
      const tile = Math.floor(i / BED_X_IN_TILE.length);
      const x = tile * BG_TILE_WIDTH + BED_X_IN_TILE[i % BED_X_IN_TILE.length];
      this.beds.push(this.placeBed(p, x, i));
    }

    // --- End wall with amber exit beacon ---
    const endMat = new StandardMaterial("endMat", this.scene);
    endMat.emissiveColor.set(0.45, 0.3, 0.05);
    endMat.backFaceCulling = false;

    const endWall = CreatePlane("endWall", { width: 2, height: BG_HEIGHT }, scene);
    endWall.position.set(this.width - 2, BG_CENTER_Y, 30);
    endWall.material = endMat;
  }

  private placeDoor(_x: number, _flip: boolean) {
    // Doors are rendered naturally as part of the hospital-ward-v1 background artwork
  }

  private placeBed(patient: Patient, x: number, index: number): BuiltBed {
    const root = new TransformNode(`bed${index}`, this.scene);
    root.position.set(x, FLOOR_Y, 10);

    // Patients are baked into background, eliminating floating overlay seams.
    // Root remains exact interaction/question anchor for this visible bed.
    this.disposables.push(root);
    return { patient, x, root, assessed: false };
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
