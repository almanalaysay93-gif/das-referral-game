# Game Plan: EMR-DAS Hospital Adventure (2D Platformer)

Transform the existing EMR-DAS referral game into a 2D platformer in the same WebDev project.
The doctor character runs through hospital rooms, finds patients in beds, and triages them
using the existing DAS Alert Logic v1.0 data (client/src/lib/patients.ts).

## Art Direction
Generated reference image first (visual target): warm-but-clinical 2.5D side-scroller look,
flattened pixel-style hospital corridor, teal/navy/amber palette matching the existing Mission
Control brand. Doctor sprite: teal scrub-wearing character with stethoscope. Rooms: doors,
beds with patients, monitors. All assets generated via Manus image gen, uploaded, /manus-storage URLs.

## Risk Tasks

### 1. 2D character movement + platform physics (Babylon ortho camera)
- Why isolated: custom kinematic movement with jump/land, AABB vs. platforms; Babylon physics plugins can derail.
- Approach: orthographic camera, Y-up. Manual kinematic physics in update loop: gravity, velocity.x from input,
  velocity.y gravity integration, jump impulse; AABB collision vs. static platform rects (floor segments).
  No physics plugin. Simple "floor is walkable; no vertical obstacles above floor height" to keep it robust.
- Verify: run/jump feels right; no falling through floor; landing on platforms; movement direction matches input.

### 2. Character animation (sprite flip + run cycle)
- Why isolated: sprite animation state transitions stutter/pop on first pass.
- Approach: 2-frame run cycle (generated spritesheet, toggle at ~8 Hz), idle frame, flip via scaleX(-1);
  no multi-direction states needed (horizontal only).
- Verify: run cycle visible, facing flips with direction, idle pose when stopped.

## Main Build
- Menu: home screen offers "2D Adventure" (platformer) and "Classic Console" (existing triage flow) buttons.
- Platformer scene: game/world GameWorld, player Player, level builder LevelBuilder from patients.ts data:
  10 patient beds per level placed across one long corridor (rooms with doors, beds, monitors, wall art).
- Camera follows player, clamped to level bounds, orthographic.
- Patient proximity trigger: when player x within ~60px of a bed, enter triage overlay (DOM HUD) with
  the 3 DAS actions + patient case file (diagnosis, GCS, ventilation, time window) — reuse existing case UI style.
- Answering applies existing grading/explanations, shows coordinator feedback, awards score; next bed unlocks.
- Progress saved with same localStorage keys (best scores, unlocks), 6+/10 unlocks next level.
- Level briefings: short overlay cards per level (reuse themes: Signal Training → Gauntlet), palette shifts per level.
- Touch controls for phone: on-screen left/right/jump buttons (bottom corners), keyboard arrows/WASD for desktop.
- Level complete screen → score + next level / return to menu.
- Assets needed: reference.png, doctor idle+run sprites (transparent), hospital corridor/room background texture,
  door sprite, bed sprite, patient sprites (a few variants), monitor props, HUD icons.
- Verify:
  - Movement/jump/land transitions correct; direction flip works
  - 10 beds per level reachable and triggers triage dialog
  - Triage dialog shows correct case data, grading works, score increments
  - Unlock gate 6+/10 works; localStorage persists
  - Touch buttons visible on mobile viewport
  - No console errors; pnpm check clean; reference.png consistency
  - Presentation: webdev_take_screenshot; ?demo autopilot to move to first bed automatically

## Context files
PLAN.md (this), STRUCTURE.md, MEMORY.md, ASSETS.md at project root.
