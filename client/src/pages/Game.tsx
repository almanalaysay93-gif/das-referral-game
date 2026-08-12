/**
 * EMR-DAS Referral Game — Game screen (mobile-first)
 * Phone-optimized: single-column stack, compact top rail, horizontal queue
 * strip, big full-width thumb action buttons pinned near the bottom.
 * Desktop keeps the wide console layout as a secondary enhancement.
 * Style: Mission Control — dark telemetry base, amber beacon accents.
 */
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { actions, type Action } from "@/lib/patients";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  HeartPulse,
  Home,
  MessageSquareWarning,
  Wind,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const COORDINATOR = "/manus-storage/coordinator-avatar_c117fbab.png";
const BRAIN = "/manus-storage/brain-scan_4f1a24eb.png";

export default function Game() {
  const {
    levelIndex,
    patientIndex,
    currentLevel,
    currentPatient,
    levelScore,
    streak,
    answers,
    submitAnswer,
    nextPatient,
  } = useGame();

  const lastAnswer = answers[answers.length - 1];
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAction: Action;
  } | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const answered = !!lastAnswer && lastAnswer.patientId === currentPatient.id;

  const handleAction = (value: string) => {
    if (answered) return;
    setChosen(value);
    const result = submitAnswer(value);
    setFeedback({ correct: result.correct, correctAction: result.correctAction as Action });
  };

  const gcsColor =
    currentPatient.gcs.score <= 7
      ? "text-primary"
      : currentPatient.gcs.score <= 12
        ? "text-telemetry"
        : "text-success";

  return (
    <div className="min-h-screen pb-4">
      {/* ── Compact top rail (phone-optimized) ── */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center gap-2 py-2 max-w-6xl">
          <div className="font-display font-bold tracking-tight text-sm">
            EMR-<span className="text-primary">DAS</span>
          </div>
          <span className="hidden sm:inline font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-3">
            Level {currentLevel.id} · {currentLevel.name}
          </span>
          <span className="sm:hidden font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-3">
            L{currentLevel.id} · {currentLevel.name}
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="font-telemetry text-[11px] text-telemetry">
              SCORE <strong className="text-foreground">{levelScore}</strong>/10
            </span>
            <span className="hidden sm:inline font-telemetry text-[11px] text-telemetry">
              STREAK <strong className="text-primary">{streak}</strong>
            </span>
            <Button variant="ghost" size="sm" className="text-muted-foreground -my-1" onClick={() => { if (window.confirm("Abort this shift? Your progress on this level will be lost.")) { window.location.hash = "#home"; } }}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Abort</span>
            </Button>
          </div>
        </div>
        {/* progress bar */}
        <div className="h-1 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((patientIndex + (answered ? 1 : 0)) / currentLevel.patients.length) * 100}%` }}
          />
        </div>
      </header>

      {/* ── Queue strip: horizontal scroll of case chips (compact on phone) ── */}
      <div className="border-b border-border bg-card/30">
        <div className="container max-w-6xl flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-hide">
          {currentLevel.patients.map((p, i) => {
            const a = answers.find((x) => x.patientId === p.id);
            return (
              <span
                key={p.id}
                className={`shrink-0 h-6 min-w-6 px-1.5 rounded text-[10px] font-telemetry font-bold flex items-center justify-center border ${
                  i === patientIndex
                    ? "border-primary bg-primary/20 text-primary beacon-pulse"
                    : a
                      ? a.correct
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-destructive/50 bg-destructive/15 text-destructive"
                      : "border-border text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
            );
          })}
          <span className="ml-auto shrink-0 font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            CASE {patientIndex + 1}/10
          </span>
        </div>
      </div>

      <div className="container py-4 max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr] items-start">
          {/* ── Left station rail (desktop only) ── */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-20">
            <div className="panel rounded-lg p-4">
              <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-telemetry">
                Alert Logic v1.0
              </div>
              <div className="mt-2 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                <p>
                  <strong className="text-foreground">REFER TO SHARE</strong> when: neurologic
                  injury + GCS ≤ 7 within <strong className="text-foreground">6 h</strong>
                </p>
                <p>
                  or ventilated + GCS ≤ 7 within <strong className="text-foreground">24 h</strong>
                </p>
                <p>
                  <strong className="text-telemetry">SURVEILLANCE</strong>: GCS 8–12 cohort
                </p>
                <p>
                  <strong className="text-destructive">NO ALERT</strong>: no trigger criteria
                </p>
              </div>
              <div className="mt-3 border-t border-border pt-3 font-telemetry text-[10px] text-muted-foreground">
                Brain-death evaluation = high-priority flag
              </div>
            </div>
          </aside>

          {/* ── Mobile rule reminder chip ── */}
          <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-telemetry uppercase tracking-[0.12em] text-muted-foreground rounded-md border border-border bg-card/40 px-2.5 py-1.5">
            <span className="text-primary font-bold">REFER</span> neuro injury + GCS ≤ 7 / 6 h (vent 24 h) ·{" "}
            <span className="text-telemetry font-bold">SURV</span> GCS 8–12 ·{" "}
            <span className="text-destructive font-bold">NONE</span> no criteria
          </div>

          {/* ── Case file ── */}
          <main className="space-y-4">
            <div className="panel rounded-xl overflow-hidden">
              {/* case header */}
              <div className="border-b border-border px-4 py-3 flex items-center gap-2 bg-card/50 flex-wrap">
                <span
                  className={`font-telemetry text-[10px] px-2 py-0.5 rounded-full border ${
                    currentPatient.brainDeathEval
                      ? "border-primary bg-primary/20 text-primary beacon-pulse"
                      : "border-telemetry/50 bg-telemetry/10 text-telemetry"
                  }`}
                >
                  {currentPatient.brainDeathEval ? "⚠ BRAIN-DEATH EVAL FLAG" : "CASE FILE"}
                </span>
                <div className="font-display text-lg font-bold">
                  {currentPatient.name}
                </div>
                <span className="font-telemetry text-[11px] text-muted-foreground">
                  {currentPatient.age}y · {currentPatient.sex === "M" ? "Male" : "Female"} ·{" "}
                  {currentPatient.unit}
                </span>
                <span className="w-full sm:w-auto sm:ml-auto font-telemetry text-[11px] text-telemetry flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Charted {currentPatient.hour}
                </span>
              </div>

              {/* phone-first stacked content */}
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Primary Diagnosis / Source Term
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-display font-semibold text-base md:text-lg">
                    <Brain className="h-4 w-4 text-telemetry shrink-0" />
                    {currentPatient.diagnosis}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="panel rounded-lg p-3">
                    <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <Activity className="h-3 w-3 text-telemetry" /> GCS
                    </div>
                    <div className={`font-telemetry text-4xl font-bold mt-1 ${gcsColor}`}>
                      {currentPatient.gcs.score}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {currentPatient.gcs.note}
                    </div>
                  </div>
                  <div className="panel rounded-lg p-3">
                    <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <Wind className="h-3 w-3 text-telemetry" /> Ventilation
                    </div>
                    <div className={`font-display text-sm font-bold mt-1 leading-snug ${currentPatient.ventilated.onVent ? "text-telemetry" : "text-muted-foreground"}`}>
                      {currentPatient.ventilated.onVent ? "ON VENT" : "NOT VENTILATED"}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {currentPatient.ventilated.note}
                    </div>
                  </div>
                </div>

                {currentPatient.extra && (
                  <div className="rounded-lg border border-telemetry/30 bg-telemetry/5 px-3.5 py-3 flex gap-2 items-start">
                    <MessageSquareWarning className="h-4 w-4 text-telemetry shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-telemetry uppercase tracking-wider text-telemetry block mb-0.5">
                        HIS Note
                      </span>
                      {currentPatient.extra}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <HeartPulse className="h-3 w-3" />
                  <span className="font-telemetry">
                    RULE VERSION: EMR-DAS ALERT LOGIC v1.0 · REFERRAL SUPPORT ONLY
                  </span>
                </div>

                {/* brain scan visual — visible on desktop only */}
                <div className="hidden md:block rounded-lg overflow-hidden border border-border relative h-44">
                  <img src={BRAIN} alt="Neurological telemetry" className="w-full h-full object-cover opacity-70" />
                  <div className="absolute bottom-2 left-2 font-telemetry text-[9px] uppercase tracking-widest text-telemetry bg-background/70 px-1.5 py-0.5 rounded">
                    NEURO MONITOR
                  </div>
                </div>
              </div>
            </div>

            {/* ── Triage decision (phone: big full-width buttons) ── */}
            <div className="space-y-3">
              {!answered && (
                <div className="slide-in">
                  <div className="font-telemetry text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 px-0.5">
                    Your Disposition — {currentPatient.name}
                  </div>
                  <div className="grid gap-2.5">
                    {actions.map((a) => (
                      <button
                        key={a.value}
                        onClick={() => handleAction(a.value)}
                        className={`group rounded-lg border px-4 py-4 text-left transition-all duration-150 active:scale-[0.98] touch-manipulation ${
                          a.value === "share"
                            ? "border-primary/50 bg-primary/5 hover:bg-primary/15 hover:border-primary"
                            : a.value === "surv"
                              ? "border-telemetry/40 bg-telemetry/5 hover:bg-telemetry/10 hover:border-telemetry"
                              : "border-border bg-card/40 hover:bg-card hover:border-foreground/40"
                        }`}
                      >
                        <div
                          className={`font-display font-bold ${
                            a.value === "share"
                              ? "text-primary"
                              : a.value === "surv"
                                ? "text-telemetry"
                                : "text-foreground"
                          }`}
                        >
                          {a.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{a.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Feedback / coordinator debrief ── */}
              {answered && feedback && (
                <div className={`slide-in rounded-xl border p-4 md:p-6 ${feedback.correct ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
                  <div className="flex items-start gap-3">
                    {feedback.correct ? (
                      <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-display font-bold text-sm md:text-base ${feedback.correct ? "text-success" : "text-destructive"}`}
                      >
                        {feedback.correct
                          ? currentPatient.action === "share"
                            ? "COORDINATOR VALIDATED ✓ REFERRAL ACCEPTED"
                            : "CORRECT DISPOSITION ✓"
                          : `DISPOSITION OVERRIDDEN — CORRECT ACTION: ${actions.find((a) => a.value === feedback.correctAction)?.label}`}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {feedback.correct
                          ? currentPatient.explanation
                          : `You chose ${actions.find((a) => a.value === chosen)?.label}. ${currentPatient.explanation}`}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="font-telemetry text-[10px] uppercase tracking-[0.15em] text-telemetry border border-telemetry/40 rounded px-2 py-1">
                          {currentPatient.ruleCited}
                        </span>
                        <Button size="sm" className="ml-auto sm:ml-0 font-display w-full sm:w-auto mt-1 sm:mt-0" onClick={nextPatient}>
                          {patientIndex + 1 >= currentLevel.patients.length
                            ? "View Shift Report"
                            : `Next Patient (${patientIndex + 2}/10)`}
                        </Button>
                      </div>
                    </div>
                    <img
                      src={COORDINATOR}
                      alt="SHARE donor coordinator"
                      className="hidden sm:block h-16 w-16 rounded-full border-2 border-border object-cover shrink-0"
                    />
                  </div>
                </div>
              )}

              {!answered && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-0.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Choose carefully — every case requires human judgment backed by Alert Logic v1.0.</span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
