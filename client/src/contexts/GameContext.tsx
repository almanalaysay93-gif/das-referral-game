/**
 * EMR-DAS Referral Game — Game state context
 * Mission Control style: manages progress, player registration, scoring, and Google Sheets logging.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { levels } from "@/lib/patients";

export type Screen = "home" | "briefing" | "game" | "result";

export interface PlayerInfo {
  fullName: string;
  profession: string;
  sheetsWebhookUrl?: string;
}

export interface ScoreLogEntry {
  id: string;
  timestamp: string;
  fullName: string;
  profession: string;
  levelIndex: number;
  levelName: string;
  score: number;
  total: number;
  percentage: number;
  streak: number;
  syncedToSheets: boolean;
}

interface AnswerRecord {
  patientId: string;
  correct: boolean;
  chosen: string;
}

interface GameState {
  screen: Screen;
  levelIndex: number;
  patientIndex: number;
  answers: AnswerRecord[];
  bestScores: Record<number, { score: number; total: number }>;
  playerInfo: PlayerInfo;
}

const STORAGE_KEY = "das-referral-game:v1";
const PLAYER_KEY = "das-referral-player:v1";

interface GameContextValue extends GameState {
  startLevel: (levelIndex: number) => void;
  beginShift: () => void;
  submitAnswer: (chosen: string) => { correct: boolean; correctAction: string };
  nextPatient: () => void;
  endLevel: () => void;
  goToHome: () => void;
  resetProgress: () => void;
  setPlayerInfo: (info: PlayerInfo) => void;
  currentLevel: (typeof levels)[number];
  currentPatient: (typeof levels)[number]["patients"][number];
  levelScore: number;
  streak: number;
  isLevelUnlocked: (idx: number) => boolean;
  logShiftScore: (score: number, total: number, streak: number) => Promise<boolean>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerInfo, setPlayerInfoState] = useState<PlayerInfo>(() => {
    try {
      const raw = localStorage.getItem(PLAYER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return {
      fullName: "Clinician Operator",
      profession: "Transplant Coordinator",
      sheetsWebhookUrl: "",
    };
  });

  const [state, setState] = useState<GameState>(() => {
    // Dev deep-link (checked first so it beats the persisted state):
    // ?dev=case:2-1 jumps straight into classic mode at level 2, patient 1 (1-based).
    const devMatch = window.location.search.match(/dev=case:(\d+)-(\d+)/i);
    if (devMatch) {
      return {
        screen: "game",
        levelIndex: Math.min(parseInt(devMatch[1], 10) - 1, levels.length - 1),
        patientIndex: Math.min(parseInt(devMatch[2], 10) - 1, 9),
        answers: [],
        bestScores: {},
        playerInfo,
      };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        return { ...parsed, screen: "home", playerInfo };
      }
    } catch {
      /* ignore */
    }
    return {
      screen: "home",
      levelIndex: 0,
      patientIndex: 0,
      answers: [],
      bestScores: {},
      playerInfo,
    };
  });

  useEffect(() => {
    try {
      const { screen: _s, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setPlayerInfo = useCallback((info: PlayerInfo) => {
    setPlayerInfoState(info);
    setState((s) => ({ ...s, playerInfo: info }));
    try {
      localStorage.setItem(PLAYER_KEY, JSON.stringify(info));
    } catch {
      /* ignore */
    }
  }, []);

  const logShiftScore = useCallback(
    async (score: number, total: number, currentStreak: number): Promise<boolean> => {
      const level = levels[state.levelIndex];
      const percentage = Math.round((score / Math.max(1, total)) * 100);

      const entry: ScoreLogEntry = {
        id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        fullName: playerInfo.fullName || "Clinician Operator",
        profession: playerInfo.profession || "Transplant Coordinator",
        levelIndex: state.levelIndex,
        levelName: level ? level.name : `Level ${state.levelIndex + 1}`,
        score,
        total,
        percentage,
        streak: currentStreak,
        syncedToSheets: false,
      };

      let synced = false;

      // 1. Post to Google Sheets Webhook URL if provided
      if (playerInfo.sheetsWebhookUrl && playerInfo.sheetsWebhookUrl.startsWith("http")) {
        try {
          await fetch(playerInfo.sheetsWebhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timestamp: entry.timestamp,
              fullName: entry.fullName,
              profession: entry.profession,
              levelName: entry.levelName,
              score: entry.score,
              total: entry.total,
              percentage: entry.percentage + "%",
              streak: entry.streak,
            }),
          });
          synced = true;
        } catch (err) {
          console.warn("Google Sheets Webhook log error:", err);
        }
      }

      entry.syncedToSheets = synced;

      // 2. Persist locally to shift log history
      try {
        const rawLogs = localStorage.getItem("das-referral-score-logs");
        const logs: ScoreLogEntry[] = rawLogs ? JSON.parse(rawLogs) : [];
        logs.unshift(entry);
        localStorage.setItem("das-referral-score-logs", JSON.stringify(logs.slice(0, 100)));
      } catch (err) {
        console.warn("Local score log save error:", err);
      }

      return synced;
    },
    [state.levelIndex, playerInfo],
  );

  // Support the abort (home) button in the game header
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#home") {
        setState((s) => ({ ...s, screen: "home", patientIndex: 0, answers: [] }));
        window.location.hash = "";
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const startLevel = useCallback((levelIndex: number) => {
    setState((s) => ({ ...s, screen: "briefing", levelIndex, patientIndex: 0, answers: [] }));
  }, []);

  const beginShift = useCallback(() => {
    setState((s) => ({ ...s, screen: "game", patientIndex: 0, answers: [] }));
  }, []);

  const submitAnswer = useCallback(
    (chosen: string) => {
      const level = levels[state.levelIndex];
      const patient = level.patients[state.patientIndex];
      const correct = chosen === patient.action;
      setState((s) => ({
        ...s,
        screen: "game",
        answers: [...s.answers, { patientId: patient.id, correct, chosen }],
      }));
      return { correct, correctAction: patient.action };
    },
    [state.levelIndex, state.patientIndex],
  );

  const nextPatient = useCallback(() => {
    setState((s) => {
      const level = levels[s.levelIndex];
      if (s.patientIndex + 1 >= level.patients.length) {
        return { ...s, screen: "result", patientIndex: s.patientIndex };
      }
      return { ...s, patientIndex: s.patientIndex + 1 };
    });
  }, []);

  const endLevel = useCallback(() => {
    setState((s) => {
      const level = levels[s.levelIndex];
      const score = s.answers.filter((a) => a.correct).length;
      const prev = s.bestScores[s.levelIndex];
      const best = !prev || score > prev.score ? { score, total: level.patients.length } : prev;
      return { ...s, bestScores: { ...s.bestScores, [s.levelIndex]: best } };
    });
  }, []);

  const goToHome = useCallback(() => {
    setState((s) => ({ ...s, screen: "home" }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({
      screen: "home",
      levelIndex: 0,
      patientIndex: 0,
      answers: [],
      bestScores: {},
      playerInfo,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, [playerInfo]);

  const currentLevel = useMemo(() => levels[state.levelIndex], [state.levelIndex]);
  const currentPatient = useMemo(
    () => currentLevel.patients[state.patientIndex],
    [currentLevel, state.patientIndex],
  );

  const levelScore = useMemo(
    () => state.answers.filter((a) => a.correct).length,
    [state.answers],
  );

  const streak = useMemo(() => {
    let count = 0;
    for (let i = state.answers.length - 1; i >= 0; i--) {
      if (state.answers[i].correct) count++;
      else break;
    }
    return count;
  }, [state.answers]);

  const isLevelUnlocked = useCallback(
    (_idx: number) => true, // All levels unlocked
    [],
  );

  const value: GameContextValue = {
    ...state,
    playerInfo,
    setPlayerInfo,
    startLevel,
    beginShift,
    submitAnswer,
    nextPatient,
    endLevel,
    goToHome,
    resetProgress,
    currentLevel,
    currentPatient,
    levelScore,
    streak,
    isLevelUnlocked,
    logShiftScore,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
