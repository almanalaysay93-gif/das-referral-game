/**
 * EMR-DAS Referral Game — Home (Mission Control console)
 * Dark telemetry base, amber beacon accents, asymmetric console layout.
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useGame } from "@/contexts/GameContext";
import { levels } from "@/lib/patients";
import {
  Activity,
  ArrowRight,
  Lock,
  Radar,
  Trophy,
  Undo2,
} from "lucide-react";

const HERO = "/manus-storage/hero-console_30ccc789.png";
const LOGO = "/manus-storage/das-logo_13aa1dbe.png";

/** Small telemetry status-strip row shared across the console sections */
function StatusStrip() {
  return (
    <div className="flex items-center gap-4 border-y border-border bg-card/30 px-4 py-2 font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> HIS LINK: OK
      </span>
      <span className="hidden sm:flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> ALERT FILTER: ACTIVE
      </span>
      <span className="hidden md:flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" /> COORDINATOR QUEUE: STANDBY
      </span>
      <span className="ml-auto text-muted-foreground/60">RULE SET: EMR-DAS v1.0 · 2026-08-12 06:00 GMT+8</span>
    </div>
  );
}

/** Section header with console station numbering */
function ConsoleHeading({ n, label, title }: { n: string; label: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="font-telemetry text-xs text-telemetry border border-telemetry/30 rounded px-2 py-1 bg-telemetry/5">
        {n} / {label}
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
      <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

export default function Home() {
  const { goToHome, startLevel, isLevelUnlocked, bestScores, resetProgress } = useGame();
  void goToHome;
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top rail ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center gap-3 py-2.5">
          <img src={LOGO} alt="EMR-DAS radar emblem" className="h-9 w-9 md:h-10 md:w-10" />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight">
              EMR-<span className="text-primary">DAS</span>
            </div>
            <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Donor Alert Simulator · SPMC
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetProgress}
              className="text-muted-foreground hover:text-foreground h-9"
            >
              <Undo2 className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero console ── */}
      <section className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="container relative py-14 md:py-28 max-w-5xl">
          <div className="slide-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-telemetry text-[10px] uppercase tracking-[0.2em] text-telemetry">
              <span className="h-1.5 w-1.5 rounded-full bg-telemetry animate-pulse" />
              Triage Console — Live Simulation
            </div>
            <h1 className="font-display text-[2.25rem] md:text-6xl font-bold leading-[1.05] tracking-tight">
              Every missed referral is a life
              <br />
              a family never got to <span className="text-primary">save</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-lg text-muted-foreground leading-relaxed">
              You are the operator of the Electronic Medical Record–Donor Alert
              System. Review each patient's chart, apply <strong className="text-foreground">Alert Logic v1.0</strong> —
              severe neurologic injury plus GCS ≤ 7 within 6 hours (or 24 hours
              if ventilated) — and route every qualifying patient to the
              <strong className="text-primary"> SHARE donor coordinator team</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button size="lg" className="font-display text-base w-full md:w-auto md:px-8 h-12" onClick={() => startLevel(0)}>
                Begin Triage — Level 1 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-display text-base w-full md:w-auto md:px-8 bg-card/40 h-12 border-telemetry/50 text-telemetry"
                onClick={() => navigate("/adventure")}
              >
                🏥 2D Hospital Adventure — Walk the Ward <Activity className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="font-display text-sm w-full md:w-auto md:px-8 h-10 text-muted-foreground"
                onClick={() => document.getElementById("levels")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Missions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hospital Adventure banner ── */}
      <section className="relative border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url(/manus-storage/platformer-reference_f291154e.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
        <div className="container relative py-10">
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-telemetry text-[10px] uppercase tracking-[0.2em] text-telemetry">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                New Mode — Platformer Training
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold">
                Walk the ward yourself. <span className="text-primary">Room to room.</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
                The same EMR-DAS rules, a different posture: you are now the
                doctor on the night shift, running the corridor, knocking on
                doors, and finding every patient the alert filter flagged —
                then classifying each one correctly to advance to the next
                floor.
              </p>
              <div className="mt-5 flex gap-3">
                <Button size="lg" className="font-display h-11" onClick={() => navigate("/adventure?level=0")}>
                  Enter the Ward <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="hidden md:block panel rounded-lg overflow-hidden border border-border">
              <img
                src="/manus-storage/platformer-reference_f291154e.png"
                alt="Hospital corridor at night, the setting of the adventure mode"
                className="w-full h-44 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <StatusStrip />
      {/* ── Triage flow console band (workflow strip from the doc's Figure 1) ── */}
      <section className="border-b border-border bg-card/40">
        <div className="container py-12">
          <ConsoleHeading n="SYS-01" label="Triage Flow" title="The Referral Pathway" />
          <div className="grid gap-4 md:grid-cols-4 items-stretch">
            {[
              { step: "01", title: "ER Triage & Admission", desc: "Patient assessed; GCS charted in the HIS.", status: "ENCODED" },
              { step: "02", title: "EMR-DAS Filter", desc: "Alert Logic v1.0 scans for neurologic injury + GCS ≤ 7.", status: "SCANNING" },
              { step: "03", title: "Coordinator Dashboard", desc: "Possible-donor queue with timestamps & rule version.", status: "QUEUED" },
              { step: "04", title: "SHARE Validation", desc: "Donor coordinator validates for organ donation possibility.", status: "VALIDATE" },
            ].map((s, i) => (
              <div key={s.step} className="panel rounded-lg p-5 relative">
                <div className="flex items-center justify-between">
                  <span className="font-telemetry text-xs text-telemetry">{s.step}</span>
                  <span className="font-telemetry text-[9px] uppercase tracking-[0.2em] text-success/80 border border-success/30 rounded px-1.5 py-0.5">
                    {s.status}
                  </span>
                </div>
                <div className="font-display font-semibold mt-1.5">{s.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                {i < 3 && (
                  <div className="hidden md:flex absolute right-[-1.1rem] top-1/2 -translate-y-1/2 z-10 items-center text-telemetry/60">
                    ▸
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ER → FILTER (GCS ≤ 7) → DASHBOARD → DONOR COORDINATOR → VALIDATION
          </div>
        </div>
      </section>

      {/* ── Level select ── */}
      <section id="levels" className="container py-14 max-w-5xl">
        <ConsoleHeading n="SYS-02" label="Mission Roster" title="Five Levels of Increasing Difficulty" />
        <div className="mb-8 flex items-center gap-2 font-telemetry text-xs text-muted-foreground">
          <Trophy className="h-4 w-4 text-primary" /> UNLOCK GATE: SCORE ≥ 6/10 TO OPEN THE NEXT MISSION
          <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {levels.map((level, idx) => {
            const unlocked = isLevelUnlocked(idx);
            const best = bestScores[idx];
            return (
              <button
                key={level.id}
                onClick={() => unlocked && startLevel(idx)}
                disabled={!unlocked}
                className={`group panel rounded-xl p-5 text-left transition-all duration-200 active:scale-[0.98] touch-manipulation ${
                  unlocked
                    ? "hover:border-primary/60 hover:bg-card"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-telemetry text-xs px-2.5 py-1 rounded-full border ${
                        unlocked
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      LEVEL {level.id}
                    </span>
                    <span className="font-display font-bold text-lg">{level.name}</span>
                  </div>
                  {unlocked ? (
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">{level.focus}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="font-telemetry text-[11px] text-telemetry">
                    <span className="text-muted-foreground">PATIENTS:</span> 10 · <span className="text-muted-foreground">DIFF:</span> {"◆".repeat(level.id)}{"◇".repeat(5 - level.id)}
                  </span>
                  {best ? (
                    <span className="font-telemetry text-[11px] text-primary flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> BEST {best.score}/{best.total}
                    </span>
                  ) : unlocked ? (
                    <span className="font-telemetry text-[11px] text-muted-foreground">NOT ATTEMPTED</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Rules reference ── */}
      <section className="border-t border-border bg-card/40">
        <div className="container py-12 max-w-5xl">
          <ConsoleHeading n="SYS-03" label="Rule Book" title="Alert Logic v1.0 — Rules of Engagement" />
          <p className="text-sm text-muted-foreground -mt-3">
            Based on the EMR-DAS technical protocol (SPMC). All alerts require
            transplant-coordinator validation — the system supports referral
            review only.
          </p>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="panel rounded-lg p-5 border-l-2 border-l-primary">
              <div className="flex items-center gap-2 font-display font-semibold text-primary">
                <Activity className="h-4 w-4" /> TRIGGER (Refer to SHARE)
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Severe acute neurologic injury diagnosis (hemorrhage, massive
                stroke, TBI, hypoxic injury…) <strong className="text-foreground">PLUS</strong> GCS ≤ 7
                documented within 6 h — or within 24 h if invasively
                ventilated.
              </p>
            </div>
            <div className="panel rounded-lg p-5 border-l-2 border-l-telemetry">
              <div className="font-display font-semibold text-telemetry">SURVEILLANCE</div>
              <p className="text-sm text-muted-foreground mt-2">
                GCS 8–12, or depressed consciousness without a qualifying
                neurologic source term: monitor the patient — a drop to GCS ≤ 7
                fires the alert.
              </p>
            </div>
            <div className="panel rounded-lg p-5 border-l-2 border-l-destructive">
              <div className="font-display font-semibold text-destructive">NO ALERT</div>
              <p className="text-sm text-muted-foreground mt-2">
                No neurologic injury, GCS &gt; 7 and not qualifying, sedation-driven
                coma, stale/improved data, or a duplicate with coordinator
                disposition in the last 24 h.
              </p>
            </div>
          </div>
          <p className="font-telemetry text-[11px] text-muted-foreground mt-6">
            HIGH-PRIORITY FLAG: a documented brain-death evaluation or
            declaration creates an urgent referral-review flag, subject to
            coordinator confirmation.
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            EMR-DAS Referral Simulator · Training tool — not for clinical use
          </span>
          <span className="font-telemetry text-[10px] text-muted-foreground">
            Based on the SPMC EMR-DAS Technical Packet v3 · Alert Logic v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
