# Deploying to Vercel

The Next.js app lives in the `web/` subdirectory. To deploy correctly:

## Option 1: Set Root Directory (recommended)

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **General**
3. Under **Build and Development Settings**, find **Root Directory**
4. Click **Edit** and set it to `web`
5. Save and redeploy

## Option 2: Root directory not set

If you cannot set Root Directory in the dashboard, add a root `package.json` (already present) and set `installCommand` and `buildCommand` in Vercel project settings to run from `web/`. Prefer Option 1.

## Environment variables

Add these in Vercel → Settings → Environment Variables:

- `AUTH_USERNAME` – login username
- `AUTH_PASSWORD_HASH` – base64-encoded bcrypt hash (see `.env.example` in `web/`)
- `SESSION_SECRET` – at least 32 characters (e.g. `openssl rand -base64 32`)
- `NEXT_PUBLIC_SUPABASE_URL` – optional, for workspace persistence
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – optional, for workspace persistence
