import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
  registerType: "autoUpdate",

  manifest: {
    name: "Just Recipes",
    short_name: "Just Recipes",
    description: "Discover, create, save, and manage your favorite recipes.",
    start_url: "/",
    display: "standalone",

    theme_color: "#16a34a",
    background_color: "#ffffff",

    icons: [
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
}),
  ],
})