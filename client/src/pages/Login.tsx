/**
 * EMR-DAS Referral Game — Login (Operator Registration)
 * Mission Control style: navy panels, hairline rules, mono telemetry, amber primary, cyan data.
 * Full-screen registration screen: player name + profession + optional Google Sheets webhook.
 * On save, the profile persists to localStorage and every shift score is logged under
 * the registered operator (locally + to the connected Google Sheet if a webhook is set).
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/contexts/GameContext";
import PlayerLoginModal from "@/components/PlayerLoginModal";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserCheck } from "lucide-react";

export default function Login() {
  const { playerInfo, setPlayerInfo } = useGame();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(
    (info: Parameters<ReturnType<typeof useGame>["setPlayerInfo"]>[0]) => {
      setPlayerInfo(info);
      setSaved(true);
      setOpen(false);
      // Brief confirmation, then send the operator back to the console
      setTimeout(() => navigate("/"), 1400);
    },
    [navigate, setPlayerInfo],
  );

  // Keep the dialog open even if something closes it unexpectedly
  useEffect(() => {
    if (!open && !saved) setOpen(true);
  }, [open, saved]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[oklch(0.13_0.02_252)] p-4">
      {/* Decorative console backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.06_230)_0%,transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-700/50 to-transparent" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="font-telemetry text-xs uppercase tracking-[0.25em] text-amber-400">
            EMR-DAS · Operator Console
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/80 to-transparent" />
        </div>

        <div className="border border-cyan-900/70 bg-[oklch(0.17_0.02_252)] p-6 shadow-2xl">
          <div className="flex items-center gap-2 font-telemetry text-[10px] uppercase tracking-[0.2em] text-cyan-300">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            Secure Access — Credentialed Operators Only
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">
            Identify Yourself, Operator
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Every triage shift is logged under your name and role. Register
            before starting so your referral scores and streaks are recorded —
            locally on this device and, if you connect a Google Sheet, directly
            into your training records.
          </p>

          <div className="mt-5 border-t border-cyan-900/50 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-telemetry uppercase tracking-wider">Current profile</span>
              <span className="font-telemetry text-cyan-300">{playerInfo.fullName}</span>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="mt-4 w-full h-11 font-display font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400"
            >
              {playerInfo.fullName && playerInfo.fullName !== "Anonymous Operator"
                ? "Update Credentials"
                : "Register & Begin"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          </div>

          {saved && (
            <div className="mt-3 border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-center font-telemetry text-xs uppercase tracking-wider text-emerald-300">
              Credentials saved — telemetry logging active. Returning to console…
            </div>
          )}
        </div>
      </div>

      <PlayerLoginModal
        open={open}
        onOpenChange={setOpen}
        playerInfo={playerInfo}
        onSave={handleSave}
      />
    </div>
  );
}
