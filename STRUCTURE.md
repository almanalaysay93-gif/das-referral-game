# Structure — EMR-DAS Hospital Adventure

## New files

`client/src/components/GameCanvas.tsx` — Babylon-in-React contract (engine guard, resize, dispose). Mounted only when mode=adventure.

`client/src/game/assets.ts` — asset URL constants (/manus-storage/...).

`client/src/game/types.ts` — shared platformer types (GameState, triage event payload).

`client/src/game/scene.ts` — exports createGameScene(engine, canvas): Promise<GameHandle>.
Builds the world, wires HUD overlay, returns dispose handle.

`client/src/game/GameWorld.ts` — owns scene, camera, level, player, input manager, triage state machine.
Update loop delegates: input → player → proximity checks → camera.

`client/src/game/Player.ts` — kinematic character: gravity, run/jump, AABB vs floor/obstacles, sprite flip,
run-cycle toggle. Methods: update(dt, input), getRect(), reset().

`client/src/game/LevelBuilder.ts` — builds one long corridor level from a Level (patients.ts):
background planes, floor, doors, 10 patient beds (alternating bed sprites), position mapping bedIndex → x.

`client/src/game/InputManager.ts` — keyboard (Arrow/WASD + Space) + exposes semantic state;
no pointer lock; touch buttons feed same state via a global bridge.

`client/src/game/touchControls.ts` — DOM touch buttons (left/right/jump) rendered over canvas when adventure mode active.

## HUD (React DOM)

`client/src/pages/Adventure.tsx` — page wrapping GameCanvas + HUD overlays:
- triage dialog (reuses DAS case-file layout: diagnosis, GCS, ventilation, 3 action buttons)
- level briefing overlay, level-complete overlay, score/streak rail, pause (Abort)
- touch control buttons via touchControls bridge

State bridge: Adventure page holds React state; GameWorld calls callbacks (onPatientFound, onSubmitAnswer, onLevelComplete)
via a TriageBridge object passed into createGameScene options. GameWorld pauses player movement while a dialog is open.

## Routing

`/` — Home page now has two CTAs: "2D Hospital Adventure" (navigate /adventure) and "Begin Triage — Level 1" (classic console flow, unchanged routes).
Classic console routes unchanged: GameContext, Briefing, Game, Result keep working.

## Persistence

Reuses localStorage keys from GameContext (best scores, unlocks, reset via same Reset control on Home).

## ?demo mode

AutoPilot: moves player right at constant speed, answers first patient with the correct action, stops. Used only for screenshots.
