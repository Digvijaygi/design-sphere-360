# Deploy to Vercel

This project is built with TanStack Start. The included `vercel.json` configures Vercel to build with the **Nitro `vercel` preset** (instead of the default Cloudflare target used in Lovable preview).

## One-time setup
1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo.
3. Framework: **Other** (Vercel will read `vercel.json`).
4. Add Environment Variables:
   - `GEMINI_API_KEY` — your Google Gemini API key (Production + Preview).
5. Click **Deploy**.

## How it works
- `NITRO_PRESET=vercel` tells Nitro to emit `.vercel/output` (Vercel Build Output API v3).
- `outputDirectory` is set to `.vercel/output` so Vercel serves it directly.
- Server functions (createServerFn) run as Vercel Edge / Serverless Functions automatically.

## Custom domain
After first deploy → Project Settings → Domains → add your domain.

## Local production build (sanity check)
```bash
NITRO_PRESET=vercel bun run build
```
