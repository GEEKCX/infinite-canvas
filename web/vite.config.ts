import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { parseChangelog } from "./src/lib/release";

const webDir = dirname(fileURLToPath(import.meta.url));
const localVersion = readFileSync(resolve(webDir, "../VERSION"), "utf8").trim() || "dev";
const localChangelog = readFileSync(resolve(webDir, "../CHANGELOG.md"), "utf8");

export default defineConfig({
    base: process.env.VITE_BASE || "/",
    plugins: [react()],
    resolve: {
        alias: {
            "@": resolve(webDir, "src"),
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(localVersion),
        __APP_RELEASES__: JSON.stringify(parseChangelog(localChangelog)),
    },
    // 本机 Magpie 网关代理：Base URL 填 http://localhost:3000/magpie/v1 即可，
    // 同源转发绕开网关没有 CORS 的问题（网关 127.0.0.1:3425 只服务本机 CLI）
    server: {
        proxy: {
            "/magpie": {
                target: "http://127.0.0.1:3425",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/magpie/, ""),
            },
        },
    },
});
