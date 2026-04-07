# 📋 Sổ Bàn Giao — Brain2 Platform

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc kỹ trước khi làm.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-07 22:15
**Phiên bản hiện tại:** v1.0 — ALL PHASES ✅ READY FOR DEPLOY
**Tình trạng chung:** ✅ CODE COMPLETE — Chờ deploy (cần credentials từ anh)

### Đã xong:
- **Phase 1 ✅**: Foundation — Design System, Auth (Google OAuth), Router (8 routes), Layout, Landing, Shared components
- **Phase 2 ✅**: Core Chat — `/chat` + `/embed` Edge Functions, useChat + useConversations hooks, 6 chat components
- **Phase 3 ✅**: Vault — VaultBrowser (7 components), useVault + useVaultSearch hooks, `/search-notes` + `/analyze-vault`
- **Phase 4 ✅**: Integration — NoteCreateSuggestion wired, useTier hook, Onboarding auto-send, usage badge, model tier guard
- **Phase 5 ✅**: Import + Payment — FileImport, NotionImport (placeholder), PaymentFlow 3-step, `/payment-webhook` edge, `/import-files` edge
- **Phase 6 ✅**: Dashboard — KnowledgeDashboard, RadarChart (pure SVG), StatsCards, MaturityChart, RecommendationCards, useAnalytics, `/recommend` edge
- **Phase 7 ✅**: ErrorBoundary, Lazy loading (main bundle 220KB), ~600 lines CSS, cleanup

### Current Build Output:
- 112 modules, 7 lazy chunks, main bundle 220KB (gzip 69KB), CSS 56KB (gzip 9KB)
- 7 Edge Functions: `/chat`, `/embed`, `/search-notes`, `/analyze-vault`, `/import-files`, `/payment-webhook`, `/recommend`
- Build: ✅ 0 errors, 0 warnings

---

## 📚 SKILLS & KNOWLEDGE

### Spec files (ĐỌC TRƯỚC):
- `.claude/spec/design-system.md` — Colors, typography, spacing, component styles
- `.claude/prd/PRD_brain2-platform-rebuild.md` — Full PRD 16 sections

### Conventions bắt buộc:
- **Vanilla CSS ONLY** — CSS variables, design tokens system ở `index.css`
- **Dark mode mặc định** — Navy Blue `#2563B8` + Gold `#D4A537`, bg-primary `#111318`
- **Inter font** — body + headings. JetBrains Mono — code blocks
- **Streaming chat** — SSE, không polling
- **Error messages tiếng Việt** — toast notifications
- **RLS enforced** — mọi table Supabase phải có Row Level Security
- **Naming**: Components PascalCase, hooks `use`+CamelCase, CSS `.kebab-case`, DB `snake_case`

---

## 📐 PRD REFERENCE

**PRD file:** `.claude/prd/PRD_brain2-platform-rebuild.md`
**PRD Status:** Approved ✅, Implementation Complete ✅

---

## ⚡ TASK HIỆN TẠI — DEPLOY + PRODUCTION READINESS

### ✅ Phase 1-7: ALL BUILD COMPLETE
### ✅ Phase 8: CODE READY — Deploy credentials needed from anh

**Giao bởi:** Antigravity | **Ngày:** 2026-04-07
**Loại:** Infrastructure + Database Setup + Deploy

---

### ✅ Phase 8 Status:

**8.1 ✅ Done:** Migration file → `supabase/migrations/20260407000000_phase56_system_tables.sql`
- Run in: Supabase Dashboard → SQL Editor → paste file → Run

**8.2 ✅ Done:** GitHub Actions workflow → `.github/workflows/deploy.yml`
- Auto-deploys on push to `main` (Cloudflare Pages + all 7 Edge Functions)

**8.3-8.7 ✅ Done:** `DEPLOY.md` written with all steps + secrets list
- GitHub repo: `github.com/thongphan23/brain2-app`

**8.8 ✅ Done:** `npm run build` → ✅ 0 errors, 0 warnings (112 modules, 220KB main bundle)

---

### CẦN TỪ ANH — Deploy Credentials:

GitHub → Settings → Secrets → Actions → Add:

1. **`SUPABASE_ACCESS_TOKEN`** ← supabase.com → Account → Access Tokens → New Token
2. **`CLOUDFLARE_API_TOKEN`** ← Cloudflare → API Tokens → Create → Pages Edit
3. **`CLOUDFLARE_ACCOUNT_ID`** ← Cloudflare Dashboard → Workers & Pages → Overview
4. **`PAYMENT_WEBHOOK_SECRET`** ← Generate: `openssl rand -base64 32`
5. **`SUPABASE_SERVICE_ROLE_KEY`** ← Supabase → Project Settings → API → "service_role" key
6. **`VERTEX_KEY`** ← Vault: `00-System/api-keys-registry.md`
7. **`GEMINI_API_KEY`** ← Vault: `00-System/api-keys-registry.md`
8. `VITE_SUPABASE_URL` = `https://sauuvyffudkmdbeglspb.supabase.co`
9. `VITE_SUPABASE_ANON_KEY` = (from current .env.local)

**Add secrets + push commit → GitHub Actions auto-deploy!**

---

a) Tạo `system` schema nếu chưa có:
```sql
CREATE SCHEMA IF NOT EXISTS system;
```

b) Tạo table `system.payments`:
```sql
CREATE TABLE IF NOT EXISTS system.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  tier_target TEXT NOT NULL CHECK (tier_target IN ('pro', 'vip')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'VND',
  transaction_code TEXT UNIQUE,
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  email_raw TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

c) Tạo table `system.knowledge_analytics`:
```sql
CREATE TABLE IF NOT EXISTS system.knowledge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_notes INTEGER DEFAULT 0,
  total_connections INTEGER DEFAULT 0,
  domain_scores JSONB DEFAULT '{}',
  maturity_distribution JSONB DEFAULT '{}',
  note_type_distribution JSONB DEFAULT '{}',
  overall_score FLOAT DEFAULT 0,
  suggested_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);
```

d) Tạo table `system.recommendations`:
```sql
CREATE TABLE IF NOT EXISTS system.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('study_topic', 'connect_notes', 'review_note', 'create_note')),
  title TEXT NOT NULL,
  description TEXT,
  related_note_ids UUID[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

e) Tạo table `system.usage_daily` (nếu chưa có):
```sql
CREATE TABLE IF NOT EXISTS system.usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_used INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  ai_cost_usd FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
```

f) RLS policies cho TOÀN BỘ system tables:
```sql
-- payments
ALTER TABLE system.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own payments" ON system.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payments" ON system.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- knowledge_analytics
ALTER TABLE system.knowledge_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own analytics" ON system.knowledge_analytics FOR SELECT USING (auth.uid() = user_id);

-- recommendations
ALTER TABLE system.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own recommendations" ON system.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own recommendations" ON system.recommendations FOR UPDATE USING (auth.uid() = user_id);

-- usage_daily
ALTER TABLE system.usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users select own usage" ON system.usage_daily FOR SELECT USING (auth.uid() = user_id);
```

g) Verify: check tables + policies + query test

**8.2. Deploy Edge Functions**
```bash
cd /Users/rio/brain2-app
supabase functions deploy chat --project-ref sauuvyffudkmdbeglspb
supabase functions deploy embed --project-ref sauuvyffudkmdbeglspb
supabase functions deploy search-notes --project-ref sauuvyffudkmdbeglspb
supabase functions deploy analyze-vault --project-ref sauuvyffudkmdbeglspb
supabase functions deploy import-files --project-ref sauuvyffudkmdbeglspb
supabase functions deploy payment-webhook --project-ref sauuvyffudkmdbeglspb
supabase functions deploy recommend --project-ref sauuvyffudkmdbeglspb
```

Verify: `supabase functions list --project-ref sauuvyffudkmdbeglspb`

**8.3. Environment Variables cho Edge Functions**
Đã có (verify):
- `VERTEX_KEY` — API key cho vertex-key.com proxy
- `GEMINI_API_KEY` — cho embedding

Cần thêm (nếu chưa có):
- `PAYMENT_WEBHOOK_SECRET` — secret cho payment webhook auth
- `SUPABASE_SERVICE_ROLE_KEY` — cho payment webhook internal access

**8.4. Cloudflare Pages Deploy**
```bash
cd /Users/rio/brain2-app
npm run build

# Option 1: Wrangler CLI
npx wrangler pages deploy dist --project-name brain2

# Option 2: Git integration
# Connect Github repo → auto deploy on push
```

**8.5. DNS Setup**
- Domain: `brain2.thongphan.com`
- CNAME → Cloudflare Pages URL
- Verify SSL + redirect

**8.6. Supabase Auth Config**
- Google OAuth redirect URL: `https://brain2.thongphan.com/auth/callback`
- Site URL: `https://brain2.thongphan.com`
- Check Auth → URL Configuration in Supabase Dashboard

**8.7. Production .env**
```
VITE_SUPABASE_URL=https://sauuvyffudkmdbeglspb.supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

**8.8. TEST Production:**
- Landing page loads
- Google OAuth → Onboarding → Chat
- Chat streaming works
- Vault CRUD + search
- Dashboard radar chart
- Import file upload
- Settings + Payment flow
- All pages responsive

---

## ACCEPTANCE CRITERIA — Phase 8:

- [ ] AC-DEPLOY-01: Database tables created (system.payments, knowledge_analytics, recommendations, usage_daily)
- [ ] AC-DEPLOY-02: RLS enabled on ALL system tables
- [ ] AC-DEPLOY-03: 7 Edge Functions deployed and responding
- [ ] AC-DEPLOY-04: Frontend deployed to Cloudflare Pages
- [ ] AC-DEPLOY-05: brain2.thongphan.com resolves + loads app
- [ ] AC-DEPLOY-06: Google OAuth works on production domain
- [ ] AC-DEPLOY-07: Chat streaming works end-to-end on production
- [ ] AC-DEPLOY-08: `npm run build` → 0 errors local

---

## 📌 QUYẾT ĐỊNH ĐÃ CHỐT

| Quyết định | Giá trị | Lý do |
|-----------|---------|-------|
| Tên sản phẩm | Brain2 | Anh chốt giữ nguyên |
| Framework | Vite + React 19 + TypeScript | Nhanh, SPA, Cloudflare Pages compatible |
| Styling | Vanilla CSS + CSS variables | Full control, no Tailwind |
| Auth | Google OAuth only | Single provider, fast onboarding |
| Database | Supabase `sauuvyffudkmdbeglspb` | Giữ nguyên, đã có schema |
| AI Routing | Vertex-key proxy | Đã operational |
| Hosting | Cloudflare Pages | Static SPA, no SSR |
| Payment | Chuyển khoản VIB → Gmail parse | Anh chốt ngân hàng VIB |
| Giá | Pro 499K, VIP 999K VNĐ/tháng | Anh chốt |
| Dark mode | Mặc định | Không có light mode toggle |
| Radar Chart | Pure SVG (no Chart.js) | Bundle size nhỏ |
| VIB Account | PHAN MINH THÔNG — 002031988 | Anh chốt TK nhận |
| Transaction code | B2-{user_id_prefix_8char} | Auto-match payment |
| Lazy Loading | Dashboard, Import, Settings, Vault lazy | Chat + Landing eager |

---

## 📝 KẾT QUẢ PHIÊN


### 2026-04-07 22:15 — Phase 8: Deploy Prep ✅ Hoàn thành (code ready)
**Ai ghi:** Claude Code
**Status:** ✅ Code hoàn tất, chờ deploy credentials từ anh

**Đã làm:**
- GitHub repo mới: `github.com/thongphan23/brain2-app` — git init + push (3 commits)
- Migration SQL: `supabase/migrations/20260407000000_phase56_system_tables.sql`
  - Tables: system.payments, system.knowledge_analytics, system.recommendations, system.usage_daily
  - RLS policies: select/insert/update/delete per user
  - Indexes on foreign keys
- GitHub Actions: `.github/workflows/deploy.yml`
  - Job 1: Build + deploy Cloudflare Pages
  - Job 2: Deploy all 7 Edge Functions via Supabase CLI
- `DEPLOY.md`: hướng dẫn chi tiết từng bước deploy
- `.env.example`: template cho public env vars
- `.gitignore`: thêm .env, .env.local

**Cần từ anh:**
- SUPABASE_ACCESS_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- PAYMENT_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
- VERTEX_KEY, GEMINI_API_KEY

**GitHub → Settings → Secrets → Actions → Add secrets → auto deploy!**

---

<!-- Claude Code: ghi kết quả ở ĐẦU mục này -->

### 2026-04-07 21:00 — Phase 4+5+6+7 MEGA BUILD ✅ Hoàn thành
**Ai ghi:** Claude Code
**Verified by:** Antigravity ✅
**Status:** ✅ Tất cả phases hoàn tất, build 0 errors

**Summary:**
- Phase 4: useTier hook, NoteCreateSuggestion wired, tier enforcement, onboarding auto-send
- Phase 5: FileImport (drag-drop), NotionImport (placeholder), PaymentFlow (3-step VIB), `/import-files` + `/payment-webhook` edge functions
- Phase 6: KnowledgeDashboard, RadarChart (pure SVG), StatsCards, MaturityChart, RecommendationCards, UsageStats, useAnalytics, `/recommend` edge function
- Phase 7: ErrorBoundary, React.lazy code splitting (220KB vs 472KB), 600+ lines CSS animations
- **Build:** 112 modules, 8 chunks, 220KB main + 56KB CSS, 0 errors

---

### 2026-04-07 19:30 — Phase 3: Vault ✅
**Ai ghi:** Claude Code | **Verified:** ✅

### 2026-04-07 19:00 — Phase 2: Core Chat ✅
**Ai ghi:** Claude Code | **Verified:** ✅

### 2026-04-07 17:00 — Phase 1: Foundation ✅
**Ai ghi:** Claude Code | **Verified:** ✅ (7/7 ACs pass)

---
