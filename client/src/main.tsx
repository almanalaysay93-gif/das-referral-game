import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (err) {
  console.error("Failed to mount app:", err);
}

// Dismiss the loading overlay once the app has mounted (index.html shows a
// visible spinner + retry button if this never fires, avoiding a blank page)
try {
  (window as any).__dasReady?.();
} catch {
  /* overlay not present */
}
