import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The /api proxy forwards frontend requests to the Express server in
// dev, so we don't hit CORS issues while developing. In production,
// VITE_API_URL points at the deployed backend (see src/lib/api.js).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
