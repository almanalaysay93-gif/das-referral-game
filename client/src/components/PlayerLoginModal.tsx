/**
 * PlayerLoginModal.tsx — Player Registration & Google Sheets Scoring Modal
 * Allows players to set their Full Name, Profession, and optional Google Sheets Webhook URL.
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
import { UserCheck, FileSpreadsheet, ShieldCheck, Copy, Check } from "lucide-react";
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

const DEFAULT_SCRIPT_TEMPLATE = `function doPost(e) {
  // Target Google Sheet: https://docs.google.com/spreadsheets/d/16d7XR_Rt22sl9xE4GBWTiVdZraNOCbONdTevq6fF7Xk/edit
  var ss = SpreadsheetApp.openById('16d7XR_Rt22sl9xE4GBWTiVdZraNOCbONdTevq6fF7Xk');
  var sheet = ss.getSheets()[0];
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.fullName,
    data.profession,
    data.levelName,
    data.score,
    data.total,
    data.percentage + '%',
    data.streak
  ]);
  return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function PlayerLoginModal({
  open,
  onOpenChange,
  playerInfo,
  onSave,
}: PlayerLoginModalProps) {
  const [fullName, setFullName] = useState(playerInfo.fullName || "");
  const [profession, setProfession] = useState(playerInfo.profession || PROFESSIONS[0]);
  const [customProfession, setCustomProfession] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(playerInfo.sheetsWebhookUrl || "");
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProfession = profession === "Other Specialist" && customProfession.trim()
      ? customProfession.trim()
      : profession;

    onSave({
      fullName: fullName.trim() || "Anonymous Operator",
      profession: finalProfession,
      sheetsWebhookUrl: webhookUrl.trim(),
    });
    onOpenChange(false);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(DEFAULT_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
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

          {/* Google Sheets Webhook URL */}
          <div className="space-y-1.5 border-t border-cyan-900/60 pt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhookUrl" className="flex items-center gap-1.5 font-telemetry text-xs uppercase text-emerald-400">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Google Sheets Webhook URL (Optional)
              </Label>
              <button
                type="button"
                onClick={() => setShowSetupHelp(!showSetupHelp)}
                className="font-telemetry text-[11px] text-amber-400 hover:underline"
              >
                {showSetupHelp ? "Hide Setup" : "Setup Guide"}
              </button>
            </div>
            <Input
              id="webhookUrl"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="border-cyan-800/80 bg-slate-900/90 text-xs font-mono text-emerald-300 placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">
              Score telemetry is automatically saved locally. Adding a Webhook URL logs scores directly to your Google Sheet!
            </p>
          </div>

          {/* Google Apps Script Setup Guide */}
          {showSetupHelp && (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>1-Minute Google Sheet Connection Guide:</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyScript}
                  className="h-6 px-2 text-[10px] border-amber-500/60 text-amber-300 hover:bg-amber-500/20"
                >
                  {copiedScript ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copiedScript ? "Copied Script" : "Copy Apps Script"}
                </Button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Open a new or existing <strong>Google Sheet</strong>.</li>
                <li>Go to <strong>Extensions → Apps Script</strong>.</li>
                <li>Paste the copied Apps Script code into <code className="text-amber-200">Code.gs</code>.</li>
                <li>Click <strong>Deploy → New Deployment</strong> (Select <em>Web App</em>, set <em>Anyone</em> has access).</li>
                <li>Copy the resulting Web App URL and paste it into the input box above!</li>
              </ol>
            </div>
          )}

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
