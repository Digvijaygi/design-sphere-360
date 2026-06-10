#!/usr/bin/env node
/**
 * Vercel build wrapper.
 *
 * On Vercel, Nitro's `vercel` preset writes directly to `.vercel/output/`
 * with the correct Build Output API v3 layout — no restructuring needed.
 *
 * If Nitro instead emits to `dist/` (e.g. because the host pinned a
 * different preset such as `cloudflare-module`), we fall back to
 * assembling `.vercel/output/` from `dist/client` + `dist/server`.
 */
import { execSync } from "node:child_process";
import {
  existsSync,
  rmSync,
  cpSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const out = join(root, ".vercel", "output");

console.log("[vercel-build] vite build (NITRO_PRESET=vercel)");
const viteBin = join(root, "node_modules", ".bin", "vite");
const viteCmd = existsSync(viteBin) ? `"${viteBin}" build` : "npx vite build";
execSync(viteCmd, {
  stdio: "inherit",
  env: { ...process.env, NITRO_PRESET: "vercel" },
});

// Case 1: Nitro's vercel preset already produced .vercel/output — done.
if (existsSync(join(out, "config.json"))) {
  console.log("[vercel-build] .vercel/output already produced by Nitro. Done.");
  process.exit(0);
}

// Case 2: Fallback — Nitro emitted to dist/ (likely cloudflare-module preset).
// Build the Vercel Build Output API v3 layout manually.
if (!existsSync(dist)) {
  console.error(
    "[vercel-build] Neither .vercel/output nor dist/ exists after build."
  );
  process.exit(1);
}

console.log("[vercel-build] Restructuring dist/ -> .vercel/output");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Static assets
if (existsSync(join(dist, "client"))) {
  cpSync(join(dist, "client"), join(out, "static"), { recursive: true });
} else {
  console.error("[vercel-build] dist/client missing");
  process.exit(1);
}

// SSR function
const funcDir = join(out, "functions", "__server.func");
mkdirSync(funcDir, { recursive: true });
if (existsSync(join(dist, "server"))) {
  cpSync(join(dist, "server"), funcDir, { recursive: true });
} else {
  console.error("[vercel-build] dist/server missing");
  process.exit(1);
}

writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
      runtime: "nodejs22.x",
    },
    null,
    2
  )
);
writeFileSync(
  join(funcDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2)
);

// Minimal config.json routing all non-static paths to the SSR function.
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/__server" },
      ],
    },
    null,
    2
  )
);

console.log("[vercel-build] Fallback restructure complete.");
