import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Jibismcore/", // 👈 имя твоего репозитория
  build: {
    outDir: "dist", // 👈 куда билдит Vite (ты уже проверил)
  },
});

