/**
 * EMR-DAS Referral Game — Game state context
 * Mission Control style: manages progress, scoring, and persistence.
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
}

const STORAGE_KEY = "das-referral-game:v1";

interface GameContextValue extends GameState {
  startLevel: (levelIndex: number) => void;
  submitAnswer: (chosen: string) => { correct: boolean; correctAction: string };
  nextPatient: () => void;
  endLevel: () => void;
  goToHome: () => void;
  resetProgress: () => void;
  currentLevel: (typeof levels)[number];
  currentPatient: (typeof levels)[number]["patients"][number];
  levelScore: number;
  streak: number;
  isLevelUnlocked: (idx: number) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        return { ...parsed, screen: "home" };
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

  const startLevel = useCallback((levelIndex: number) => {
    setState((s) => ({ ...s, screen: "briefing", levelIndex, patientIndex: 0, answers: [] }));
  }, []);

  const submitAnswer = useCallback(
    (chosen: string) => {
      let result = { correct: false, correctAction: "" };
      setState((s) => {
        const level = levels[s.levelIndex];
        const patient = level.patients[s.patientIndex];
        const correct = chosen === patient.action;
        result = { correct, correctAction: patient.action };
        return {
          ...s,
          screen: "game",
          answers: [...s.answers, { patientId: patient.id, correct, chosen }],
        };
      });
      return result;
    },
    [],
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
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
    (idx: number) => {
      if (idx === 0) return true;
      const prev = state.bestScores[idx - 1];
      // Unlock next level when previous level scored at least 6/10
      return !!prev && prev.score >= 6;
    },
    [state.bestScores],
  );

  const value: GameContextValue = {
    ...state,
    startLevel,
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
