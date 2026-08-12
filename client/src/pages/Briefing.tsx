/**
 * EMR-DAS Referral Game — Level Briefing screen
 * Mission Control: instrument power-on, operator briefing before each shift.
 */
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { levels } from "@/lib/patients";
import { ArrowRight, ArrowLeft, Target } from "lucide-react";

export default function Briefing() {
  const { levelIndex, beginShift, goToHome } = useGame();
  const level = levels[levelIndex];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="slide-in max-w-2xl w-full">
        <div className="panel rounded-xl p-8 md:p-10 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 font-telemetry text-xs uppercase tracking-[0.25em] text-telemetry">
            <Target className="h-3.5 w-3.5" /> Pre-Shift Briefing
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-telemetry text-sm text-primary">LEVEL {level.id}/5</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{level.name}</h1>
          </div>
          <p className="mt-2 font-display text-lg text-primary/90 italic">“{level.tagline}”</p>
          <p className="mt-4 text-muted-foreground leading-relaxed">{level.focus}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
            <div>
              <div className="font-telemetry text-2xl font-bold text-telemetry">10</div>
              <div className="text-xs text-muted-foreground mt-0.5">Patients to triage</div>
            </div>
            <div>
              <div className="font-telemetry text-2xl font-bold text-primary">6+</div>
              <div className="text-xs text-muted-foreground mt-0.5">Correct to unlock next level</div>
            </div>
            <div>
              <div className="font-telemetry text-2xl font-bold text-foreground">v1.0</div>
              <div className="text-xs text-muted-foreground mt-0.5">Alert rule in force</div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={goToHome} className="flex-1 bg-card/40">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Console
            </Button>
            <Button
              size="lg"
              className="flex-[2] font-display"
              onClick={() => beginShift()}
            >
              Begin Shift — Patient 1 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
