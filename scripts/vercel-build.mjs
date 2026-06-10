#!/usr/bin/env node
/**
 * Vercel build wrapper.
 * Runs `vite build` with NITRO_PRESET=vercel, then re-arranges the Nitro
 * `dist/` output into the Vercel Build Output API v3 layout under
 * `.vercel/output/`, which is what Vercel actually serves.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync, cpSync, mkdirSync, renameSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".vercel", "output");

console.log("[vercel-build] Building with NITRO_PRESET=vercel...");
execSync("vite build", { stdio: "inherit", env: { ...process.env, NITRO_PRESET: "vercel" } });

if (!existsSync(dist)) {
  console.error("[vercel-build] dist/ missing after build");
  process.exit(1);
}

console.log("[vercel-build] Restructuring -> .vercel/output");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// 1. config.json
cpSync(join(dist, "config.json"), join(out, "config.json"));

// 2. static/  (client assets)
cpSync(join(dist, "client"), join(out, "static"), { recursive: true });

// 3. functions/__server.func/  (SSR entry)
const funcDir = join(out, "functions", "__server.func");
mkdirSync(funcDir, { recursive: true });
cpSync(join(dist, "server"), funcDir, { recursive: true });

// .vc-config.json must live at the root of the function dir
const vc = join(funcDir, ".vc-config.json");
if (!existsSync(vc)) {
  writeFileSync(vc, JSON.stringify({
    handler: "index.mjs",
    launcherType: "Nodejs",
    shouldAddHelpers: false,
    supportsResponseStreaming: true,
    runtime: "nodejs22.x",
  }, null, 2));
}

// Ensure package.json with type:module for ESM handler
writeFileSync(join(funcDir, "package.json"), JSON.stringify({ type: "module" }, null, 2));

console.log("[vercel-build] Done. Output at .vercel/output");
