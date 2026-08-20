import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, DoorOpen, MapPin } from "lucide-react";
import HospitalHubCanvas from "@/components/HospitalHubCanvas";
import type { HubMoveDirection, HubRoom } from "@/game/HospitalHub";

export default function HospitalHub() {
  const [, navigate] = useLocation();
  const [nearRoom, setNearRoom] = useState<HubRoom | null>(null);
  const returnedRoom = (() => {
    const match = window.location.hash.match(/[?&]returnLevel=(\d+)/);
    const levelIndex = match ? Number(match[1]) : null;
    return levelIndex !== null && levelIndex >= 0 && levelIndex < 5 ? levelIndex : undefined;
  })();
  const touch = {
    onMove: (dir: HubMoveDirection, pressed: boolean) => window.dispatchEvent(new CustomEvent("das-hub-move", { detail: { dir, pressed } })),
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#06131a] text-white">
      <HospitalHubCanvas
        onDoorChange={setNearRoom}
        onEnterRoom={(levelIndex) => navigate(`/adventure?level=${levelIndex}`)}
        touchHandlers={touch}
        startRoomIndex={returnedRoom}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-gradient-to-b from-[#041218]/95 to-transparent px-4 py-4 sm:px-7">
        <div>
          <p className="font-telemetry text-[10px] uppercase tracking-[0.28em] text-cyan-300">DAS Hospital · Open Training Wing</p>
          <h1 className="mt-1 font-display text-xl font-bold sm:text-2xl">Explore hospital. Enter room. Train level.</h1>
        </div>
        <button onClick={() => navigate("/")} className="pointer-events-auto flex items-center gap-2 border border-cyan-700/70 bg-slate-950/80 px-3 py-2 font-telemetry text-xs text-cyan-100 hover:bg-cyan-950">
          <ArrowLeft className="h-4 w-4" /> Console
        </button>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#041218]/95 to-transparent px-4 pb-5 pt-16 sm:px-7">
        <div className="mx-auto max-w-xl border border-cyan-700/60 bg-[#08212a]/90 p-3 text-center shadow-2xl sm:p-4">
          {nearRoom ? (
            <>
              <div className="flex items-center justify-center gap-2 font-telemetry text-xs uppercase tracking-[0.18em]" style={{ color: nearRoom.tint }}>
                <MapPin className="h-4 w-4" /> Level {nearRoom.levelIndex + 1} door
              </div>
              <div className="mt-1 font-display text-lg font-bold">{nearRoom.name}</div>
              <div className="mt-1 text-xs text-cyan-100/80">Press <kbd className="border border-amber-300/70 px-1.5 py-0.5 font-bold text-amber-200">E</kbd> or <kbd className="border border-amber-300/70 px-1.5 py-0.5 font-bold text-amber-200">Enter</kbd> to enter.</div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 font-telemetry text-xs uppercase tracking-[0.16em] text-cyan-200"><DoorOpen className="h-4 w-4 text-amber-300" /> {returnedRoom === undefined ? "Use WASD or arrow keys to explore the hospital" : `Returned from Level ${returnedRoom + 1}. Choose next room.`}</div>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-5 z-20 flex items-end justify-between px-5 sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          <span />
          <TouchButton label="▲" onPress={(pressed) => touch.onMove("forward", pressed)} />
          <span />
          <TouchButton label="◀" onPress={(pressed) => touch.onMove("left", pressed)} />
          <TouchButton label="▼" onPress={(pressed) => touch.onMove("backward", pressed)} />
          <TouchButton label="▶" onPress={(pressed) => touch.onMove("right", pressed)} />
        </div>
        <TouchButton label="ENTER" onPress={(pressed) => pressed && window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyE" }))} />
      </div>
    </main>
  );
}

function TouchButton({ label, onPress }: { label: string; onPress: (pressed: boolean) => void }) {
  return (
    <button
      className="flex h-12 min-w-12 items-center justify-center border border-cyan-500/70 bg-slate-950/90 px-3 font-telemetry text-xs font-bold text-cyan-100 active:scale-95"
      onPointerDown={(event) => { event.preventDefault(); onPress(true); }}
      onPointerUp={() => onPress(false)}
      onPointerLeave={() => onPress(false)}
    >
      {label}
    </button>
  );
}
