/**
 * LeaderboardModal.tsx — Displays Shift Logs and Telemetry Scores recorded locally and on Google Sheets.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, FileSpreadsheet, CheckCircle2, Shield, Trash2 } from "lucide-react";
import type { ScoreLogEntry } from "@/contexts/GameContext";

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LeaderboardModal({ open, onOpenChange }: LeaderboardModalProps) {
  const [logs, setLogs] = useState<ScoreLogEntry[]>([]);

  const loadLogs = () => {
    try {
      const raw = localStorage.getItem("das-referral-score-logs");
      if (raw) {
        setLogs(JSON.parse(raw));
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open]);

  const clearLogs = () => {
    if (confirm("Clear all stored shift log records?")) {
      localStorage.removeItem("das-referral-score-logs");
      setLogs([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-cyan-900/80 bg-[oklch(0.16_0.02_252)] text-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-telemetry text-xs uppercase tracking-[0.2em] text-amber-400">
              <Trophy className="h-4 w-4" /> Shift Audit & Google Sheets Telemetry
            </div>
            {logs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Logs
              </Button>
            )}
          </div>
          <DialogTitle className="font-display text-2xl font-bold text-white">
            Operator Leaderboard & Shift Logs
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm">
            Recorded scores, clinician triage evaluations, and Google Sheets sync logs.
          </DialogDescription>
        </DialogHeader>

        {logs.length === 0 ? (
          <div className="my-8 text-center p-8 border border-dashed border-cyan-900/60 bg-cyan-950/20 rounded-lg">
            <Shield className="mx-auto h-8 w-8 text-cyan-400 opacity-60 mb-2" />
            <div className="font-display text-lg font-semibold text-white">No Shift Records Found</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Complete a hospital ward shift in the 2D platformer to log your triage performance and telemetry scores!
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-3 py-2 font-telemetry text-[10px] uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 rounded">
              <span>Operator & Role</span>
              <span>Floor / Mission</span>
              <span className="text-center">Score</span>
              <span className="text-right">Logged Date</span>
            </div>
            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-3 py-2.5 text-xs bg-slate-900/70 border border-cyan-900/40 rounded hover:border-cyan-700/60 transition-colors"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {log.fullName}
                    {log.syncedToSheets && (
                      <span title="Synced to Google Sheets">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-telemetry">{log.profession}</div>
                </div>

                <div className="font-telemetry text-slate-300 truncate">
                  {log.levelName}
                </div>

                <div className="text-center font-telemetry">
                  <span className="font-bold text-amber-400">{log.score}</span>
                  <span className="text-slate-400">/{log.total}</span>
                  <div className="text-[10px] text-emerald-400">{log.percentage}%</div>
                </div>

                <div className="text-right font-telemetry text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleDateString()}
                  <br />
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center border-t border-cyan-900/60 pt-3 gap-2">
          <div className="flex items-center gap-2">
            <a
              href="https://docs.google.com/spreadsheets/d/16d7XR_Rt22sl9xE4GBWTiVdZraNOCbONdTevq6fF7Xk/edit#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-emerald-500/60 bg-emerald-950/40 px-2.5 py-1 text-xs font-telemetry text-emerald-300 hover:bg-emerald-900/60"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              Google Sheet Backend ↗
            </a>
            <a
              href="/api/scores/csv"
              download
              className="inline-flex items-center gap-1 rounded border border-cyan-800 bg-slate-900 px-2.5 py-1 text-xs font-telemetry text-cyan-300 hover:bg-slate-800"
            >
              Download CSV
            </a>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400 h-9"
          >
            Close Logs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
