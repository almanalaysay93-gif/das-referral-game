// InputManager.ts — semantic input state for the platformer.
// Keyboard (arrows/WASD/Space) feeds the same state that on-screen touch buttons write to.
// Mission Control style: input is a clean status signal, not raw key noise.

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean; // edge-triggered: true only on the frame pressed
}

export class InputManager {
  state: InputState = { left: false, right: false, jump: false };
  private jumpArmed = false; // track whether a jump press has been consumed

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown(e: KeyboardEvent) {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        this.state.left = true;
        break;
      case "ArrowRight":
      case "KeyD":
        this.state.right = true;
        break;
      case "ArrowUp":
      case "KeyW":
      case "Space":
        if (!this.jumpArmed) {
          this.state.jump = true;
          this.jumpArmed = true;
        }
        e.preventDefault();
        break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        this.state.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        this.state.right = false;
        break;
      case "ArrowUp":
      case "KeyW":
      case "Space":
        this.jumpArmed = false;
        break;
    }
  }

  /** Touch buttons call this; edge-triggered jump semantics. */
  setMove(dir: "left" | "right" | null, pressed: boolean) {
    if (dir === "left") this.state.left = pressed;
    else if (dir === "right") this.state.right = pressed;
  }

  /** Called by the touch jump button on press (edge trigger). */
  pressJump() {
    if (!this.jumpArmed) {
      this.state.jump = true;
      this.jumpArmed = true;
    }
  }

  /** Clear per-frame state at end of each update. */
  endFrame() {
    this.state.jump = false;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
