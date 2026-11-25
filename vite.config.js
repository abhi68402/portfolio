import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite = the dev server + bundler. These two plugins add React (JSX) and Tailwind.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
