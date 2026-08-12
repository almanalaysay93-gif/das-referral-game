import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { GameProvider, useGame } from "./contexts/GameContext";
import Briefing from "./pages/Briefing";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Adventure from "./pages/Adventure";
import Result from "./pages/Result";

function Router() {
  const { screen } = useGame();
  return (
    <Switch>
      <Route path={"/"}>
        {screen === "briefing" ? <Briefing /> :
         screen === "game" ? <Game /> :
         screen === "result" ? <Result /> :
         <Home />}
      </Route>
      <Route path={"/adventure"} component={Adventure} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
