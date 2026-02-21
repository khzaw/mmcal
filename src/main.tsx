import "./fonts/misans-myanmar.css";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

registerSW({ immediate: true });

// Auto-reload when a new service worker replaces the current one
// Guard: only listen if a controller already exists (skip first-visit registration)
if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
