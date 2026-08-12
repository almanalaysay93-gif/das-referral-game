/**
 * EMR-DAS Referral Game — Shift Report (level result)
 * Mission Control debrief: score telemetry, per-case review, next mission.
 */
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { actions, levels } from "@/lib/patients";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Lock,
  Star,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";

export default function Result() {
  const {
    levelIndex,
    levelScore,
    answers,
    isLevelUnlocked,
    bestScores,
    startLevel,
    goToHome,
    endLevel,
  } = useGame();

  useEffect(() => {
    endLevel();
  }, [endLevel]);

  const level = levels[levelIndex];
  const score = answers.filter((a) => a.correct).length;
  const unlockedNext = isLevelUnlocked(levelIndex + 1);
  const isLast = levelIndex === levels.length - 1;
  const allBeaten = levels.every((_, i) => isLevelUnlocked(i + 1) || i === levels.length - 1 && levelScore >= 6);

  const grade =
    score === 10
      ? { label: "PERFECT CAPTURE — ZERO MISSED REFERRALS", color: "text-primary" }
      : score >= 8
        ? { label: "STRONG PERFORMANCE", color: "text-success" }
        : score >= 6
          ? { label: "MINIMUM STANDARD MET", color: "text-telemetry" }
          : { label: "BELOW THRESHOLD — RETRIANAGE REQUIRED", color: "text-destructive" };

  const passed = score >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="slide-in max-w-2xl w-full space-y-5">
        <div className="panel rounded-xl p-8 border-t-2 border-t-primary">
          <div className="font-telemetry text-xs uppercase tracking-[0.25em] text-telemetry">
            Shift Report — Level {level.id}
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{level.name}</div>

          <div className="mt-6 flex items-end gap-4">
            <div className="font-telemetry text-6xl font-bold text-primary">{score}</div>
            <div className="font-telemetry text-xl text-muted-foreground pb-1">/ {level.patients.length}</div>
            <div className={`ml-auto font-display font-bold text-sm ${grade.color}`}>{grade.label}</div>
          </div>

          <div className="mt-6 h-px bg-border" />

          <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1">
            {level.patients.map((p, i) => {
              const a = answers.find((x) => x.patientId === p.id);
              const correct = a?.correct ?? false;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                    correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  {correct ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="font-telemetry text-[10px] text-muted-foreground w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium flex-1">{p.name}</span>
                  <span
                    className={`font-telemetry text-[10px] uppercase tracking-wider ${
                      correct ? "text-success" : "text-destructive"
                    }`}
                  >
                    {correct
                      ? p.action === "share"
                        ? "REFERRED ✓"
                        : "CORRECT ✓"
                      : `→ ${actions.find((x) => x.value === p.action)?.label}`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={goToHome} className="flex-1 bg-card/40">
              <Home className="mr-1 h-4 w-4" /> Return to Console
            </Button>
            {!passed && (
              <Button className="flex-1 font-display" onClick={() => startLevel(levelIndex)}>
                Retrain — Retry Level {level.id}
              </Button>
            )}
            {passed && !isLast && (
              <Button className="flex-1 font-display" onClick={() => startLevel(levelIndex + 1)}>
                Next Mission — Level {levelIndex + 2} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {passed && isLast && (
              <Button className="flex-1 font-display" onClick={goToHome}>
                <Star className="mr-1 h-4 w-4 text-primary" /> Complete — Back to Console
              </Button>
            )}
          </div>
        </div>

        {/* All levels beaten celebration */}
        {passed && isLast && (
          <div className="panel rounded-xl p-6 border border-primary/40 text-center">
            <div className="font-display text-xl font-bold text-primary">
              ALL FIVE MISSIONS COMPLETE — CERTIFIED OPERATOR
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Best scores: {levels.map((l, i) => {
                const b = bestScores[i];
                return `L${l.id}: ${b ? `${b.score}/${b.total}` : "—"}`;
              }).join(" · ")}
            </p>
          </div>
        )}

        {!passed && !unlockedNext && !isLast && (
          <div className="panel rounded-xl p-5 flex items-center gap-3">
            <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Level {levelIndex + 2} stays locked until you score at least 6/10 on this
              shift. Review the explanations and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
