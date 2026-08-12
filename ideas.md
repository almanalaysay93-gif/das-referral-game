# EMR-DAS Referral Game — Design Brainstorm

## Three Candidate Styles

**1. "Mission Control"**
A calm, clinical command-center aesthetic inspired by hospital telemetry dashboards and NASA mission control: deep slate blues, monospaced data readouts, glowing status chips. Emotional intent: the player feels like an operator of a critical early-warning system.
Probability: 0.04

**2. "Paper Chart"**
Warm editorial design mimicking an organized paper medical chart: cream paper textures, serif headings, ruled lines, rubber-stamp verdicts ("REFER / CLEAR"). Emotional intent: the tactile warmth of a hospital teaching file.
Probability: 0.06

**3. "Arcade ER"**
Playful retro-arcade take on the emergency room: neon signs, pixel accents, buzzer sounds, bold saturated colors. Emotional intent: high-energy quiz-show fun.
Probability: 0.03

## CHOSEN: "Mission Control"

**Design Movement:** Clinical telemetry / aerospace operations console — think NASA Mission Control meets modern hospital command dashboards (Epic Command / Philips IntelliSpace). Precision, calm authority, and data clarity.

**Core Principles:**
1. Data clarity first — every screen reads like a live operations console with status chips, timestamps, and clear signal hierarchy.
2. Calm urgency — alert states are vivid but disciplined; the interface never screams, it *alerts*.
3. Instrument-panel depth — layered translucent panels, subtle glass blur, thin hairline borders, no flat cards floating in white space.
4. Versioned authenticity — the game teaches the actual EMR-DAS Alert Logic v1.0, so the UI borrows real system language (Rule Version, Qualifying Time, Disposition).

**Color Philosophy:** A deep near-black telemetry blue base (oklch ~0.16 hue 250) evokes the control-room darkness where screens matter. The signature accent is an **amber alert gold** (the color of a hospital alarm beacon) used only for referral actions and critical states. Green signals "cleared/no alert", red signals "missed/wrong", teal-cyan is used for data readouts. Emotional intent: the player should feel the weight of a real early-warning system — amber means "this patient needs the SHARE team now."

**Layout Paradigm:** Asymmetric console layout — a fixed left "station rail" (level progress, rule reference card, score telemetry) and a wide right patient work area. No centered hero cards. Charts slide in like instruments powering on.

**Signature Elements:**
1. Amber "ALERT" beacon chip with pulsing glow for referral-trigger patients.
2. Monospaced "telemetry" readouts for GCS, timestamps, rule version tags (e.g., `ALERT v1.0 · GCS 5 · T-00:04:12`).
3. Hairline-ruled status bars with dot-matrix style separators (like the doc's own diagrams: ER TRIAGE → FILTER → DASHBOARD → COORDINATOR).

**Interaction Philosophy:** Each patient is a "case file" the operator must triage. Decisions are decisive button commits (REFER TO SHARE / NO ALERT NEEDED / CONTINUE SURVEILLANCE) with a brief "coordinator response" debrief — like mission control acknowledging a call: "COORDINATOR VALIDATED ✓".

**Animation:** Instruments power-on with 200–300ms ease-out slides/fades; alert chips pulse at 2s intervals; wrong answers shake at 400ms; score tickers count up. Nothing bouncy or playful; everything snaps with precision. Respect prefers-reduced-motion.

**Typography System:** Display: "Space Grotesk" (geometric, technical, slightly futuristic). Data: "JetBrains Mono" for GCS scores, timestamps, rule tags. Body: "Inter"-free zone — use "Manrope" for readable UI text. Hierarchy: mono data chips smallest, Manrope body, Space Grotesk headings large with tight tracking.

**Brand Essence:** A mission-control training simulator for the EMR-DAS referral system — built for medical trainees and SPMC staff who must learn to spot potential organ donors before they slip through the cracks. Personality: precise, vigilant, quietly heroic.

**Brand Voice:** Operator-to-operator briefing language. Example headline: "Every missed referral is a life a family never got to save." Example CTA: "Begin Triage — Level 1". No "Welcome to our website" filler.

**Wordmark & Logo:** A radar-style glyph — a circle with a sweeping scan line and an amber beacon dot — paired with the wordmark "EMR-DAS" in Space Grotesk with a mono subtitle "DONOR ALERT SIMULATOR".

**Signature Brand Color:** Amber beacon gold `oklch(0.78 0.17 75)` — the alert color that belongs to this brand alone in this UI.
