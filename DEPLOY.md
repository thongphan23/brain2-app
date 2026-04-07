# Brain2 — Deploy Guide

## Prerequisites

1. **Supabase account** — project `sauuvyffudkmdbeglspb`
2. **GitHub account** — repo `github.com/thongphan23/brain2-app`
3. **Cloudflare account** — for Pages deployment
4. **GitHub repo secrets** (Settings → Secrets → Actions):
   - `VITE_SUPABASE_URL` = `https://sauuvyffudkmdbeglspb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (from Supabase Dashboard → Project Settings → API)
   - `SUPABASE_ACCESS_TOKEN` = (from supabase.com → Account → Access Tokens → New Token)
   - `CLOUDFLARE_API_TOKEN` = (from Cloudflare → API Tokens → Create Token → Pages Edit)
   - `CLOUDFLARE_ACCOUNT_ID` = (from Cloudflare Dashboard → Workers & Pages → Overview)
   - `VERTEX_KEY` = (from vault: API Keys Registry)
   - `GEMINI_API_KEY` = (from vault: API Keys Registry)
   - `PAYMENT_WEBHOOK_SECRET` = (generate a random 32-char string)
   - `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase Dashboard → Project Settings → API)

---

## Step 1: Run Database Migration (SUPABASE DASHBOARD)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/sauuvyffudkmdbeglspb/sql)
2. Click **SQL Editor** → **New Query**
3. Paste ALL contents from: `supabase/migrations/20260407000000_phase56_system_tables.sql`
4. Click **Run**
5. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'system';
   ```

---

## Step 2: GitHub Secrets Setup

1. Go to `https://github.com/thongphan23/brain2-app/settings/secrets/actions`
2. Add each secret listed in **Prerequisites** above
3. Also add:
   - `CLOUDFLARE_ACCOUNT_ID` — find in Cloudflare Dashboard → Workers & Pages

---

## Step 3: Cloudflare Pages Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create Application
2. Select **Pages** → **Connect to Git**
3. Connect `thongphan23/brain2-app`
4. Set:
   - **Project name:** `brain2`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
5. Add Environment Variables (same as GitHub secrets except CLOUDFLARE ones)
6. Click **Save and Deploy**

Or: Just push to GitHub — GitHub Actions will auto-deploy via `.github/workflows/deploy.yml`

---

## Step 4: DNS Setup (Optional)

- Domain: `brain2.thongphan.com`
- CNAME → `<pages-subdomain>.pages.dev`
- Verify: `dig brain2.thongphan.com`

---

## Step 5: Supabase Auth Config

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set:
   - **Site URL:** `https://brain2.thongphan.com` (or Cloudflare Pages URL if no custom domain)
   - **Redirect URLs:** `https://brain2.thongphan.com/auth/callback`
3. Google OAuth: Authentication → Providers → Google → Add credentials

---

## Step 6: GitHub Actions Trigger

Once secrets are set up, any push to `main` will auto-trigger:
- ✅ Frontend build + Cloudflare Pages deploy
- ✅ Edge Functions deploy to Supabase

Manual trigger: GitHub → Actions → "Deploy Brain2" → Run workflow

---

## Verify Deployment

```
# Frontend
open https://brain2.thongphan.com

# Edge Functions health check
curl "https://sauuvyffudkmdbeglspb.supabase.co/functions/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "ping"}'
```

---

## Troubleshooting

### Edge Functions 500
- Check function logs: Supabase Dashboard → Database → Edge Functions → Logs
- Verify env vars set in Supabase → Edge Functions → each function → Settings

### Supabase Auth not working
- Verify redirect URL: `https://brain2.thongphan.com/auth/callback`

### Payment webhook not working
- Verify `PAYMENT_WEBHOOK_SECRET` matches between GitHub Secrets and Supabase Edge Function env

### Database table not found
- Run migration in Supabase SQL Editor (Step 1 above)
