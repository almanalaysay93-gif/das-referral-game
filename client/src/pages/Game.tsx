/**
 * EMR-DAS Referral Game — Game screen
 * Asymmetric console: left station rail (progress/telemetry), right work area (case file).
 * Amber beacon = refer-to-SHARE state, teal = data, red = error.
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
  Wind,
  MessageSquareWarning,
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
    <div className="min-h-screen">
      {/* ── Top rail ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center gap-3 py-2.5">
          <div className="font-display font-bold tracking-tight">
            EMR-<span className="text-primary">DAS</span>
          </div>
          <span className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-3">
            Level {currentLevel.id} · {currentLevel.name}
          </span>
          <div className="ml-auto flex items-center gap-5">
            <span className="font-telemetry text-xs text-telemetry">
              SCORE <strong className="text-foreground">{levelScore}</strong>/10
            </span>
            <span className="font-telemetry text-xs text-telemetry">
              STREAK <strong className="text-primary">{streak}</strong>
            </span>
            <span className="font-telemetry text-xs text-muted-foreground">
              CASE {patientIndex + 1}/10
            </span>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { if (window.confirm("Abort this shift? Your progress on this level will be lost.")) { window.location.hash = "#home"; } }}>
            <Home className="h-4 w-4" />
          </Button>
          </div>
        </div>
        {/* progress bar */}
        <div className="h-0.5 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((patientIndex + (answered ? 1 : 0)) / currentLevel.patients.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="container py-6 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] items-start">
          {/* ── Left station rail ── */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-20">
            <div className="panel rounded-lg p-4">
              <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-telemetry">
                Patient Queue
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentLevel.patients.map((p, i) => {
                  const a = answers.find((x) => x.patientId === p.id);
                  return (
                    <span
                      key={p.id}
                      className={`h-7 w-7 rounded text-[10px] font-telemetry font-bold flex items-center justify-center border ${
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
              </div>
            </div>

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

          {/* ── Case file work area ── */}
          <main className="space-y-5">
            <div className={`slide-in ${!answered && chosen ? "" : ""}`}>
              <div className="panel rounded-xl overflow-hidden">
                {/* case header */}
                <div className="border-b border-border px-6 py-4 flex items-center gap-3 bg-card/50">
                  <span
                    className={`font-telemetry text-[10px] px-2.5 py-1 rounded-full border ${
                      currentPatient.brainDeathEval
                        ? "border-primary bg-primary/20 text-primary beacon-pulse"
                        : "border-telemetry/50 bg-telemetry/10 text-telemetry"
                    }`}
                  >
                    {currentPatient.brainDeathEval ? "⚠ BRAIN-DEATH EVAL FLAG" : "CASE FILE"}
                  </span>
                  <div className="font-display text-xl font-bold">
                    {currentPatient.name}
                  </div>
                  <span className="font-telemetry text-xs text-muted-foreground">
                    {currentPatient.age}y · {currentPatient.sex === "M" ? "Male" : "Female"} ·{" "}
                    {currentPatient.unit}
                  </span>
                  <span className="ml-auto font-telemetry text-xs text-telemetry flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Charted {currentPatient.hour}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_200px] p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Primary Diagnosis / Source Term
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-display font-semibold text-lg">
                        <Brain className="h-4.5 w-4.5 text-telemetry shrink-0" />
                        {currentPatient.diagnosis}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="panel rounded-lg p-4">
                        <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-telemetry" /> Glasgow Coma Scale
                        </div>
                        <div className={`font-telemetry text-4xl font-bold mt-1 ${gcsColor}`}>
                          {currentPatient.gcs.score}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-snug">
                          {currentPatient.gcs.note}
                        </div>
                      </div>
                      <div className="panel rounded-lg p-4">
                        <div className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                          <Wind className="h-3 w-3 text-telemetry" /> Mechanical Ventilation
                        </div>
                        <div className={`font-display text-lg font-bold mt-1 ${currentPatient.ventilated.onVent ? "text-telemetry" : "text-muted-foreground"}`}>
                          {currentPatient.ventilated.onVent ? "INVASIVE — ON VENT" : "NOT VENTILATED"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-snug">
                          {currentPatient.ventilated.note}
                        </div>
                      </div>
                    </div>

                    {currentPatient.extra && (
                      <div className="rounded-lg border border-telemetry/30 bg-telemetry/5 px-4 py-3 flex gap-2 items-start">
                        <MessageSquareWarning className="h-4 w-4 text-telemetry shrink-0 mt-0.5" />
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-telemetry uppercase tracking-wider text-telemetry block mb-0.5">
                            HIS Note
                          </span>
                          {currentPatient.extra}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <HeartPulse className="h-3.5 w-3.5" />
                      <span className="font-telemetry">
                        RULE VERSION: EMR-DAS ALERT LOGIC v1.0 · REFERRAL SUPPORT ONLY
                      </span>
                    </div>
                  </div>

                  {/* brain scan visual */}
                  <div className="hidden md:block rounded-lg overflow-hidden border border-border relative">
                    <img src={BRAIN} alt="Neurological telemetry" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute bottom-2 left-2 font-telemetry text-[9px] uppercase tracking-widest text-telemetry bg-background/70 px-1.5 py-0.5 rounded">
                      NEURO MONITOR
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Triage decision row ── */}
            <div className="space-y-4">
              {!answered && (
                <div className="slide-in">
                  <div className="font-telemetry text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Your Disposition — {currentPatient.name}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {actions.map((a) => (
                      <button
                        key={a.value}
                        onClick={() => handleAction(a.value)}
                        className={`group rounded-lg border p-4 text-left transition-all duration-150 active:scale-[0.97] ${
                          a.value === "share"
                            ? "border-primary/50 bg-primary/5 hover:bg-primary/15 hover:border-primary"
                            : a.value === "surv"
                              ? "border-telemetry/40 bg-telemetry/5 hover:bg-telemetry/10 hover:border-telemetry"
                              : "border-border bg-card/40 hover:bg-card hover:border-foreground/40"
                        }`}
                      >
                        <div
                          className={`font-display font-bold text-sm ${
                            a.value === "share"
                              ? "text-primary"
                              : a.value === "surv"
                                ? "text-telemetry"
                                : "text-foreground"
                          }`}
                        >
                          {a.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{a.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Feedback / coordinator debrief ── */}
              {answered && feedback && (
                <div className={`slide-in rounded-xl border p-6 ${feedback.correct ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
                  <div className="flex items-start gap-3">
                    {feedback.correct ? (
                      <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div
                        className={`font-display font-bold ${feedback.correct ? "text-success" : "text-destructive"}`}
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
                        <Button size="sm" className="ml-auto font-display" onClick={nextPatient}>
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />
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
