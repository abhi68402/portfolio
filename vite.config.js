import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite = the dev server + bundler. These two plugins add React (JSX) and Tailwind.
// BASE_PATH: where the site lives. "/" for Vercel or a custom domain (default);
// the GitHub Pages workflow sets "/portfolio/" (abhi68402.github.io/portfolio/).
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
});
