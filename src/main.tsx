import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/App";
import { bindAppViewport } from "@/lib/viewport";
import "@/styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

bindAppViewport();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
