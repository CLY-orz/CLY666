import { cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(appDir, "../source/draw");

export default defineConfig({
  // 站点通过 /draw/ 访问，资源也使用 /draw/ 前缀。
  base: "/draw/",
  plugins: [
    react(),
    {
      name: "copy-excalidraw-fonts",
      apply: "build",
      async closeBundle() {
        // Excalidraw 默认从 CDN 拉字体；这里复制到静态目录并自托管。
        await cp(
          path.resolve(
            appDir,
            "node_modules/@excalidraw/excalidraw/dist/prod/fonts"
          ),
          path.resolve(outDir, "fonts"),
          { recursive: true, force: true }
        );
      }
    }
  ],
  build: {
    outDir,
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 2500
  }
});
