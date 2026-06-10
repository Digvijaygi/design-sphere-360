# Deploy to Vercel

This project ships with a one-command Vercel build that produces a valid
[Build Output API v3](https://vercel.com/docs/build-output-api/v3) bundle.

## One-time setup
1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo.
3. **Framework Preset:** `Other` (Vercel reads `vercel.json`).
4. **Environment Variables** (Production + Preview):
   - `GEMINI_API_KEY` — your Google Gemini API key.
5. Click **Deploy**.

That's it. The build command runs `node scripts/vercel-build.mjs`, which:
1. Runs `vite build` with `NITRO_PRESET=vercel`.
2. Re-arranges the Nitro output from `dist/` into `.vercel/output/` so it
   matches Vercel's Build Output API exactly (`config.json`, `static/`,
   `functions/__server.func/`).

## Local sanity check
```bash
node scripts/vercel-build.mjs
ls .vercel/output
```

You should see `config.json`, `static/`, and `functions/__server.func/`.

## Custom domain
After first deploy → Project Settings → Domains → add your domain.
