// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      warmup: {
        clientFiles: ["./src/routes/__root.tsx", "./src/routes/index.tsx", "./src/styles.css"],
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "lucide-react",
        "motion/react",
        "@supabase/supabase-js",
        "recharts",
        "date-fns",
        "clsx",
        "tailwind-merge",
        "zod",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
      ],
    },
    build: {
      target: "esnext",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/@tanstack")) {
              return "vendor-tanstack";
            }
            if (id.includes("node_modules/@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("node_modules/motion")) {
              return "vendor-motion";
            }
          },

        },
      },
    },
  },
});

