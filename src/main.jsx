// Entry point: loads fonts + styles, then mounts <App /> into <div id="root">.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/bungee/latin-400.css";
import "./index.css";
import App from "./App.jsx";
import { initChaos } from "./hooks/useChaos";

initChaos();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
