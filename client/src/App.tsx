import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router as WouterRouter, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { GameProvider, useGame } from "./contexts/GameContext";
import Briefing from "./pages/Briefing";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Adventure from "./pages/Adventure";
import HospitalHub from "./pages/HospitalHub";
import Result from "./pages/Result";

function Router() {
  const { screen } = useGame();
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path={"/login"} component={Login} />
        <Route path={"/"}>
          {screen === "briefing" ? <Briefing /> :
           screen === "game" ? <Game /> :
           screen === "result" ? <Result /> :
           <Home />}
        </Route>
        <Route path={"/adventure"} component={Adventure} />
        <Route path={"/hospital"} component={HospitalHub} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
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
