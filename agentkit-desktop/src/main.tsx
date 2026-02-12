import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./i18n"; // Initialize i18n
import "./index.css";

const enableStrictMode = import.meta.env.VITE_ENABLE_STRICT_MODE === "true";

const appTree = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  enableStrictMode ? <React.StrictMode>{appTree}</React.StrictMode> : appTree
);
