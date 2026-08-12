// Adventure.tsx — 2D hospital platformer page. React HUD overlays the Babylon canvas.
// Style: Mission Control — navy panels, hairline rules, mono telemetry, amber primary, cyan data.

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import GameCanvas from "@/components/GameCanvas";
import { Button } from "@/components/ui/button";
import { levels, type Action, type Patient } from "@/lib/patients";
import type { TriageBridge, TriagePayload } from "@/game/types";
import { Heart, Activity, Wind, ShieldCheck, AlertTriangle, Brain, Stethoscope, X } from "lucide-react";

const SCORE_KEY = "das-adv-scores";

interface HUD {
  score: number;
  streak: number;
  bedIndex: number;
  total: number;
}

type Phase = "briefing" | "playing" | "complete";

function loadScores(): number[] {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveScores(scores: number[]) {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores.slice(0, 5)));
}

export default function Adventure() {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();
  const levelIndex = Math.min(
    Math.max(Number(searchParams.get("level") ?? 0), 0),
    levels.length - 1,
  );
  const level = levels[levelIndex];

  const [phase, setPhase] = useState<Phase>("briefing");
  const [hud, setHud] = useState<HUD>({ score: 0, streak: 0, bedIndex: 0, total: 10 });
  const [near, setNear] = useState<TriagePayload | null>(null);
  const [complete, setComplete] = useState<{ score: number; total: number; streak: number } | null>(null);
  const [feedback, setFeedback] = useState<{
    patient: Patient;
    action: Action;
    correct: boolean;
  } | null>(null);
  const dialogOpenRef = useRef(false);
  const worldRef = useRef<import("@/game/GameWorld").GameWorld | null>(null);

  // World handle arrives from the scene via the das-world-ready event
  useEffect(() => {
    const handler = (e: Event) => {
      worldRef.current = (e as CustomEvent<import("@/game/GameWorld").GameWorld>).detail;
    };
    window.addEventListener("das-world-ready", handler);
    // If the scene already dispatched before this listener mounted, read it directly.
    worldRef.current =
      (window as unknown as Record<string, import("@/game/GameWorld").GameWorld | undefined>)
        .__dasWorld ?? null;
    return () => window.removeEventListener("das-world-ready", handler);
  }, []);

  // Touch control handlers are supplied by the game engine via das-touch-ready
  useEffect(() => {
    let onMove: ((dir: "left" | "right", pressed: boolean) => void) | null = null;
    let onJump: (() => void) | null = null;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ onMove?: (dir: "left" | "right", pressed: boolean) => void; onJump?: () => void }>).detail;
      onMove = detail.onMove ?? null;
      onJump = detail.onJump ?? null;
    };
    window.addEventListener("das-touch-ready", handler);
    // keep the bridge refs current so TouchBtn closures always call latest handlers
    const poll = window.setInterval(() => {
      touchBridge.current = onMove;
      touchJump.current = onJump;
    }, 100);
    return () => {
      window.removeEventListener("das-touch-ready", handler);
      window.clearInterval(poll);
    };
  }, []);

  const bridge: TriageBridge = {
    onPatientNear: (p) => {
      dialogOpenRef.current = true;
      setNear(p);
      setFeedback(null);
    },
    onPatientFar: () => {
      dialogOpenRef.current = false;
      setNear(null);
    },
    onAnswer: (a) => {
      setFeedback({ patient: a.patient, action: a.action, correct: a.patient.action === a.action });
    },
    onLevelComplete: (c) => {
      setComplete(c);
      const scores = loadScores();
      scores[levelIndex] = Math.max(scores[levelIndex] ?? 0, c.score);
      saveScores(scores);
    },
    onTelemetry: (t) => setHud(t),
    dialogOpen: () => dialogOpenRef.current,
  };

  const startPlay = useCallback(() => {
    setPhase("playing");
    setNear(null);
    setComplete(null);
    setFeedback(null);
    setHud({ score: 0, streak: 0, bedIndex: 1, total: level.patients.length });
  }, [level.patients.length]);

  const submitAction = useCallback((action: Action) => {
    if (!near) return;
    dialogOpenRef.current = true; // keep frozen until "continue"
    worldRef.current?.submitAnswer(action);
  }, [near]);

  const continueAfterFeedback = useCallback(() => {
    setFeedback(null);
    dialogOpenRef.current = false;
    setNear(null);
  }, []);

  const abort = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Global continue key when feedback shown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (feedback && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        continueAfterFeedback();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, continueAfterFeedback]);

  const scores = loadScores();

  return (
    <div className="fixed inset-0 overflow-hidden bg-[oklch(0.16_0.02_252)]">
      <GameCanvas bridge={bridge} levelIndex={levelIndex} />

      {/* Top rail HUD */}
      {phase === "playing" && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-cyan-900/60 bg-[oklch(0.13_0.02_252/0.85)] px-3 py-2 backdrop-blur-sm sm:px-5">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-amber-400" />
            <span className="font-telemetry text-[10px] uppercase tracking-[0.2em] text-cyan-300 sm:text-xs">
              {level.name}
            </span>
          </div>
          <div className="flex items-center gap-4 font-telemetry text-[10px] sm:text-xs">
            <span className="text-cyan-300">
              SCORE <b className="text-white">{hud.score}</b>/{hud.total}
            </span>
            <span className="text-cyan-300">
              STREAK <b className="text-amber-400">{hud.streak}</b>
            </span>
            <span className="text-cyan-300">
              CASE <b className="text-white">{hud.bedIndex}</b>/{hud.total}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={abort}
            className="pointer-events-auto h-7 border border-red-900/60 px-2 font-telemetry text-[10px] uppercase tracking-wider text-red-300 sm:h-8 sm:px-3 sm:text-xs"
          >
            Abort
          </Button>
        </div>
      )}

      {/* Briefing overlay */}
      {phase === "briefing" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[oklch(0.12_0.02_252/0.92)] p-4 backdrop-blur-md">
          <div className="w-full max-w-md border border-cyan-900/70 bg-[oklch(0.17_0.02_252)] p-6 shadow-2xl">
            <div className="font-telemetry text-[10px] uppercase tracking-[0.25em] text-amber-400">
              Hospital Adventure — Pre-Walk Briefing
            </div>
            <div className="mt-1 font-telemetry text-[10px] text-cyan-400">
              LEVEL {level.id}/5 · BEST {scores[levelIndex] ?? 0}/10
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white">{level.name}</h1>
            <p className="mt-1 text-sm italic text-amber-300/90">"{level.tagline}"</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{level.focus}</p>
            <div className="mt-4 space-y-2 border-t border-cyan-900/50 pt-3 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <kbd className="rounded border border-cyan-800 bg-cyan-950 px-1.5 py-0.5 font-telemetry">A/D</kbd>
                or arrows to walk · jump over gaps
              </p>
              <p>Run down the corridor and reach each patient's bed to assess them.</p>
              <p className="font-telemetry text-amber-300">Score ≥ 6/10 to open the next floor.</p>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={abort} className="flex-1 border-cyan-900 text-cyan-200">
                Back
              </Button>
              <Button
                onClick={startPlay}
                className="flex-1 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
              >
                Begin Walk
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Triage dialog (patient encounter) */}
      {phase === "playing" && near && !feedback && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/55 p-2 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-cyan-900/70 bg-[oklch(0.17_0.02_252)] p-4 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <div className="font-telemetry text-[10px] uppercase tracking-[0.25em] text-amber-400">
                Patient Encounter
              </div>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-xl font-bold text-white">{near.patient.name}</h2>
              <span className="font-telemetry text-xs text-cyan-300">
                {near.patient.age}y · {near.patient.sex === "M" ? "Male" : "Female"} · {near.patient.unit}
              </span>
              <span className="font-telemetry text-xs text-slate-400">Charted {near.patient.hour}</span>
            </div>
            <div className="mt-3 border-t border-cyan-900/50 pt-3">
              <div className="text-[10px] font-telemetry uppercase tracking-widest text-slate-400">
                Primary Diagnosis / Source Term
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                <Heart className="h-4 w-4 text-rose-400" />
                {near.patient.diagnosis}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="border border-cyan-900/60 bg-cyan-950/40 p-3">
                <div className="flex items-center gap-1 text-[10px] font-telemetry uppercase tracking-widest text-cyan-300">
                  <AlertTriangle className="h-3 w-3" /> GCS
                </div>
                <div className="mt-1 text-2xl font-bold text-amber-400">{near.patient.gcs.score}</div>
                <div className="text-[11px] text-slate-400">{near.patient.gcs.note}</div>
              </div>
              <div className="border border-cyan-900/60 bg-cyan-950/40 p-3">
                <div className="flex items-center gap-1 text-[10px] font-telemetry uppercase tracking-widest text-cyan-300">
                  <Wind className="h-3 w-3" /> Ventilation
                </div>
                <div className={`mt-1 text-sm font-bold ${near.patient.ventilated.onVent ? "text-cyan-300" : "text-slate-400"}`}>
                  {near.patient.ventilated.onVent ? "ON VENT" : "NOT VENTILATED"}
                </div>
                <div className="text-[11px] text-slate-400">{near.patient.ventilated.note}</div>
              </div>
            </div>
            {near.patient.brainDeathEval && (
              <div className="mt-3 flex items-center gap-2 border border-amber-500/50 bg-amber-500/10 p-2 text-xs text-amber-300">
                <Brain className="h-4 w-4" />
                High-priority flag: brain-death evaluation in progress
              </div>
            )}
            <div className="mt-4 space-y-2">
              <ActionButton
                color="amber"
                title="REFER TO SHARE TEAM"
                sub="Donor Alert — notify the Donor Coordinator"
                onClick={() => submitAction("share")}
              />
              <ActionButton
                color="cyan"
                title="CONTINUE SURVEILLANCE"
                sub="GCS ≤ 12 cohort — monitor for deterioration"
                onClick={() => submitAction("surv")}
              />
              <ActionButton
                color="slate"
                title="NO ALERT NEEDED"
                sub="Continue routine specialty care"
                onClick={() => submitAction("none")}
              />
            </div>
          </div>
        </div>
      )}

      {/* Coordinator feedback */}
      {phase === "playing" && feedback && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/55 p-2 sm:items-center sm:p-4">
          <div
            className={`w-full max-w-lg border p-4 shadow-2xl sm:p-6 ${
              feedback.correct ? "border-emerald-700/70 bg-[oklch(0.17_0.03_160)]" : "border-rose-700/70 bg-[oklch(0.17_0.03_20)]"
            }`}
          >
            <div className={`flex items-center gap-2 font-telemetry text-sm font-bold ${feedback.correct ? "text-emerald-300" : "text-rose-300"}`}>
              <ShieldCheck className="h-4 w-4" />
              {feedback.correct ? "COORDINATOR VALIDATED ✓" : "COORDINATOR REVIEW ✗"}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{feedback.patient.explanation}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-telemetry text-[10px] uppercase tracking-wider text-cyan-400">
                {feedback.patient.ruleCited}
              </span>
              <Button
                onClick={continueAfterFeedback}
                className="bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
              >
                Next Bed →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Level complete */}
      {phase === "playing" && complete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[oklch(0.12_0.02_252/0.94)] p-4 backdrop-blur-md">
          <div className="w-full max-w-md border border-cyan-900/70 bg-[oklch(0.17_0.02_252)] p-6 text-center shadow-2xl">
            <div className="font-telemetry text-[10px] uppercase tracking-[0.25em] text-amber-400">
              Shift Report
            </div>
            <div className="mt-2 font-display text-5xl font-bold text-white">
              {complete.score}<span className="text-2xl text-cyan-400">/{complete.total}</span>
            </div>
            <p className="mt-2 font-telemetry text-xs text-cyan-300">
              Best streak: {complete.streak} · {complete.score >= 6 ? "FLOOR CLEARED" : "NOT ENOUGH TO ADVANCE"}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={abort} className="flex-1 border-cyan-900 text-cyan-200">
                Back to Console
              </Button>
              {complete.score >= 6 && levelIndex < levels.length - 1 && (
                <Button
                  onClick={() => navigate(`/adventure?level=${levelIndex + 1}`)}
                  className="flex-1 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
                >
                  Next Floor →
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  worldRef.current?.restart();
                  setPhase("briefing");
                  setComplete(null);
                  setNear(null);
                }}
                className="flex-1 border-cyan-900 text-cyan-200"
              >
                Replay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Touch controls for phone */}
      {phase === "playing" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-between px-4 sm:hidden">
          <div className="flex gap-2">
            <TouchBtn label="◀" onPress={(on) => touchBridge.current?.("left", on)} />
            <TouchBtn label="▶" onPress={(on) => touchBridge.current?.("right", on)} />
          </div>
          <TouchBtn label="▲" onPress={(on) => on && touchJump.current?.()} />
        </div>
      )}
      {/* world handle wired via das-world-ready event (see effect above) */}
    </div>
  );
}

const touchBridge = { current: null as ((dir: "left" | "right", on: boolean) => void) | null };
const touchJump = { current: null as (() => void) | null };

function TouchBtn({ label, onPress }: { label: string; onPress: (pressed: boolean) => void }) {
  return (
    <button
      className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-700/70 bg-[oklch(0.2_0.02_252/0.8)] text-xl font-bold text-cyan-200 active:scale-95 active:bg-cyan-800/60"
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(true);
      }}
      onPointerUp={() => onPress(false)}
      onPointerLeave={() => onPress(false)}
    >
      {label}
    </button>
  );
}

function ActionButton({
  color,
  title,
  sub,
  onClick,
}: {
  color: "amber" | "cyan" | "slate";
  title: string;
  sub: string;
  onClick: () => void;
}) {
  const styles = {
    amber: "border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200",
    cyan: "border-cyan-700/60 bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-200",
    slate: "border-slate-600/50 bg-slate-800/40 hover:bg-slate-700/50 text-slate-200",
  }[color];
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-transform active:scale-[0.98] ${styles}`}
    >
      <div>
        <div className="font-display text-sm font-bold">{title}</div>
        <div className="text-xs opacity-70">{sub}</div>
      </div>
      <X className="ml-auto mt-1 h-4 w-4 shrink-0 opacity-40" />
    </button>
  );
}

