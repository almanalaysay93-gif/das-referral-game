/**
 * PlayerLoginModal.tsx — Player Registration Modal
 * Collects the player's Full Name and Profession. Scores are logged automatically
 * to the fixed EMR-DAS Google Sheet via the built-in webhook (no player setup).
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCheck, FileSpreadsheet, ShieldCheck } from "lucide-react";
import type { PlayerInfo } from "@/contexts/GameContext";

interface PlayerLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerInfo: PlayerInfo;
  onSave: (info: PlayerInfo) => void;
}

const PROFESSIONS = [
  "Transplant Coordinator",
  "ICU Nurse / Staff",
  "Attending Physician",
  "Resident Physician / Fellow",
  "Medical Student",
  "EMR Operator / HIS Specialist",
  "Healthcare Administrator",
  "Other Specialist",
];

export default function PlayerLoginModal({
  open,
  onOpenChange,
  playerInfo,
  onSave,
}: PlayerLoginModalProps) {
  const [fullName, setFullName] = useState(playerInfo.fullName || "");
  const [profession, setProfession] = useState(playerInfo.profession || PROFESSIONS[0]);
  const [customProfession, setCustomProfession] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfession = profession === "Other Specialist" && customProfession.trim()
      ? customProfession.trim()
      : profession;

    onSave({
      fullName: fullName.trim() || "Anonymous Operator",
      profession: finalProfession,
      sheetsWebhookUrl: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-cyan-900/80 bg-[oklch(0.16_0.02_252)] text-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 font-telemetry text-xs uppercase tracking-[0.2em] text-amber-400">
            <UserCheck className="h-4 w-4" /> Operator Credentials & Telemetry
          </div>
          <DialogTitle className="font-display text-2xl font-bold text-white">
            Player Registration & Logging
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-sm">
            Enter your name and professional role. Shift scores and triage metrics will be recorded under your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-telemetry text-xs uppercase text-cyan-300">
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Dr. Alex Mercer / Nurse Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-cyan-800/80 bg-slate-900/90 text-white placeholder:text-slate-500 focus:border-amber-400"
              required
            />
          </div>

          {/* Profession Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="profession" className="font-telemetry text-xs uppercase text-cyan-300">
              Professional Role / Profession *
            </Label>
            <select
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full rounded-md border border-cyan-800/80 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-amber-400 outline-none"
            >
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {profession === "Other Specialist" && (
            <div className="space-y-1.5">
              <Label htmlFor="customProfession" className="font-telemetry text-xs uppercase text-cyan-300">
                Specify Role
              </Label>
              <Input
                id="customProfession"
                placeholder="Specify your clinical specialty..."
                value={customProfession}
                onChange={(e) => setCustomProfession(e.target.value)}
                className="border-cyan-800/80 bg-slate-900/90 text-white"
              />
            </div>
          )}

          <p className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
            <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
            Scores are logged automatically to the EMR-DAS scores sheet — no setup required.
          </p>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-cyan-800 text-cyan-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Save Profile & Logging
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
