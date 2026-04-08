# 📋 Sổ Bàn Giao — Brain2 Platform

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc kỹ trước khi làm.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-08 09:35
**Phiên bản hiện tại:** v1.1 — PRODUCTION DEPLOYED nhưng có BUG NGHIÊM TRỌNG
**Tình trạng chung:** 🔴 CRITICAL — App treo/đen xì sau khi login, cần audit toàn diện

### Đã xong (từ v1.0):
- Phase 1-7: Build hoàn tất (112 modules, 220KB main bundle, 0 build errors)
- Phase 8: Deploy lên Cloudflare Pages (`brain2.thongphan.com`)
- 7 Edge Functions deployed trên Supabase
- Google OAuth configured trên Supabase Dashboard
- DB migrations chạy xong (public + system schemas)

### ĐANG LỖI — Triệu chứng:
1. **Trang landing** — đôi khi hiện BLANK (đen xì) thay vì Hero page, chỉ thấy spinner ⏳
2. **Sau khi login** — Google OAuth redirect về OK nhưng trang Onboarding BLANK (đen xì, page height = viewport = 813px, không có content)
3. **Console errors** — `Lock "lock:sb-...auth-token" was released because another request stole it` + `AuthPKCECodeVerifierMissingError`
4. **Localhost references** — Production build vẫn chứa đường dẫn `http://localhost:5173/node_modules/.vite/deps/...`

### Hướng tiếp cận hiện tại:
- Antigravity đã patch no-op lock function + storageKey CỐ ĐỊNH nhưng bản fix CHƯA ĐƯỢC PUSH lên GitHub → Cloudflare Pages chưa deploy bản mới
- Cần Claude Code audit TOÀN DIỆN: auth flow, rendering, schema mismatch, cleanup files thừa, rồi push + deploy

---

## 📚 SKILLS & KNOWLEDGE

### Skills đã cài (auto-load khi cần):
- `~/.claude/skills/` — 16 global skills (Superpowers, Frontend Design, Testing...)

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
**PRD Status:** Approved ✅
**Key sections:** Section 8 (System Design), Section 9 (Design System), Section 11 (Patterns)

---

## ⚡ TASK HIỆN TẠI — FULL AUDIT + FIX PRODUCTION BUGS

### 🔲 AUDIT & FIX — Brain2 Production
**Giao bởi:** Antigravity | **Ngày:** 2026-04-08
**Loại:** Critical Bug Fix + Production Stabilization
**Ưu tiên:** 🔴 CRITICAL — App không sử dụng được

---

### VẤN ĐỀ GỐC (Root Causes) — 6 issues đã xác định:

#### BUG 1: 🔴 CRITICAL — Code fix CHƯA push lên GitHub
**Bằng chứng:** `git log` cho thấy HEAD local ở commit `c813161` nhưng `brain2-origin/main` ở commit `4a999f4` (cũ hơn 2 commits).
**Tác động:** Bản fix Navigator Locks bypass VÀ payment-webhook modernize chưa có trên production.
**Files:** `src/lib/supabase.ts` (lock bypass + storageKey)

#### BUG 2: 🔴 CRITICAL — Multiple useAuth() instances gây duplicate auth listeners
**Bằng chứng:** Trong `App.tsx`:
- `LandingRoute` component gọi `useAuth()` (dòng 61)
- `ProtectedRoute` component gọi `useAuth()` (dòng 22)
- Mỗi lần `useAuth()` tạo một `supabase.auth.onAuthStateChange()` listener MỚI
- Khi navigate giữa routes → listeners chồng chéo → lock conflict
**Lý do sâu:** React mỗi khi mount component sẽ run useEffect, tạo listener mới. Khi unmount → cleanup. Nhưng nếu có multiple instances cùng lúc (LandingRoute check loading TRONG KHI ProtectedRoute cũng check) → race condition trên auth lock.
**Fix đề xuất:** Chuyển auth state lên React Context (AuthProvider) wrapping toàn bộ App. useAuth() chỉ consume context, KHÔNG tạo listener mới.

#### BUG 3: 🟡 MEDIUM — Schema duplication (public vs system)
**Bằng chứng:** Database có tables trùng nhau ở 2 schemas:
- `public.payments` VÀ (handoff cũ nói tạo ở `system.payments`)
- `public.usage_daily` VÀ `system.usage_daily`
- `public.knowledge_analytics` VÀ `public.recommendations` (ở public)
- `system.recommendations` VÀ `system.usage_daily` (ở system)

**Vấn đề:** Edge functions (payment-webhook dòng 55) query `from('payments')` → Supabase client mặc định dùng schema `public`. Nhưng migration gốc tạo ở `system`. Cần thống nhất — nên dùng `public` cho tất cả vì Supabase client SDK mặc định query `public`.

#### BUG 4: 🟡 MEDIUM — Duplicate LandingPage files
**Bằng chứng:**
- `src/LandingPage.tsx` (15,605 bytes) — imports `./LandingPage.css`
- `src/pages/LandingPage.tsx` (6,630 bytes) — KHÔNG import CSS
- `App.tsx` dòng 9: `import { LandingPage } from './pages/LandingPage'`
- Tức là App sử dụng bản 6.6KB KHÔNG CÓ CSS → landing page styling bị thiếu hoặc phụ thuộc global CSS
- Bản 15KB ở `src/` là orphan (không được import) nhưng vẫn bị bundle

**Fix:** Xóa `src/LandingPage.tsx` + `src/LandingPage.css` (orphans). Verify `src/pages/LandingPage.tsx` có đủ styling từ `index.css`.

#### BUG 5: 🟡 MEDIUM — AuthCallback PKCE fragile
**Bằng chứng:** Console error `AuthPKCECodeVerifierMissingError` khi redirect từ Google về.
**Nguyên nhân:** `code_verifier` trong localStorage bị mất hoặc bị overwrite giữa lúc redirect.
**Fix:** Thêm retry logic + graceful fallback trong `AuthCallback.tsx`. Nếu PKCE fail → clear storage + redirect về landing với thông báo "Vui lòng đăng nhập lại".

#### BUG 6: 🟢 LOW — Onboarding page layout
**Bằng chứng:** browser truy cập `/onboarding` → page height = viewport (813px), tức là content không render hoặc CSS invisible.
**Nguyên nhân có thể:** 
  - CSS class `.onboarding` thiếu styles (check `index.css`)
  - Hoặc thực chất là BUG 2 (useAuth loading vĩnh viễn → ProtectedRoute trả spinner thay vì OnboardingPage)

---

### BUILD ORDER (thứ tự thực hiện — PHẢI có test/verify):

#### Phase A: Fix Auth Architecture (BUG 2 — quan trọng nhất)
1. **Tạo `src/contexts/AuthContext.tsx`** — AuthProvider + useAuth refactor
   - Move toàn bộ logic từ `hooks/useAuth.ts` vào AuthContext
   - `useAuth()` hook chỉ consume context, KHÔNG tạo listener
   - Provider wrap toàn App (trong `App.tsx`)
   - ĐẢMBẢO chỉ có 1 `onAuthStateChange` listener duy nhất
2. **Update `App.tsx`** — Wrap `<AuthProvider>` bọc `<BrowserRouter>`
   - LandingRoute + ProtectedRoute dùng `useAuth()` từ context (không tạo listener mới)
3. **Update `hooks/useAuth.ts`** — Export hook trỏ về context
4. **TEST:** `npm run dev` → mở localhost → F12 Console → KHÔNG có lỗi lock conflict
5. **TEST:** Mở 2 tabs cùng lúc → không crash

#### Phase B: Verify & Harden Supabase Client (BUG 1)
1. **Verify `src/lib/supabase.ts`** — đã có:
   - `lock: async (_name, _acquireTimeout, fn) => await fn()` (no-op lock bypass)
   - `storageKey: 'sb-brain2-auth-token'` (fixed key)
   - `flowType: 'pkce'`
   - `detectSessionInUrl: true`
2. Nếu chưa có → thêm vào (đã được patch trước đó nhưng verify lại)

#### Phase C: Fix AuthCallback (BUG 5)
1. **Update `src/pages/AuthCallback.tsx`** — harden PKCE:
   ```tsx
   // Nếu exchangeCodeForSession fail → clear stale storage
   // Redirect về landing với message
   if (sessionError?.message?.includes('code verifier')) {
     localStorage.removeItem('sb-brain2-auth-token')
     setError('Phiên đăng nhập hết hạn. Đang chuyển về trang chủ...')
     setTimeout(() => navigate('/', { replace: true }), 2000)
     return
   }
   ```
2. **Thêm timeout** 15s cho callback process → nếu quá lâu → redirect về landing
3. **TEST:** Truy cập `/auth/callback` trực tiếp (không có code param) → redirect về `/` (OK theo code hiện tại)

#### Phase D: Cleanup Files + Schema (BUG 3, 4)
1. **Xóa** `src/LandingPage.tsx` + `src/LandingPage.css` (orphan files)
2. **Verify** `src/pages/LandingPage.tsx` render đúng với CSS từ `index.css` (search cho `.landing-*` classes)
3. **Schema audit:** Kiểm tra mỗi Edge Function query schema nào:
   - `chat/index.ts` → tables gì?
   - `payment-webhook/index.ts` → `from('payments')` → dùng `public.payments` ✅
   - `recommend/index.ts` → tables gì?
   - Nếu Edge Function nào query `system.*` mà table thực tế ở `public.*` → fix
4. **Xóa duplicate tables** nếu cả 2 schemas đều có cùng 1 table (giữ `public`, xóa `system` duplicate)

#### Phase E: Verify Build + Deploy
1. **Build:** `npm run build` → PHẢI 0 errors
2. **Verify:** Grep dist/ output cho "localhost" → PHẢI không còn localhost references
   ```bash
   grep -r "localhost" dist/ || echo "✅ Clean"
   ```
3. **Local test:** `npm run preview` → mở browser → verify:
   - Landing page hiện đầy đủ (Hero + Features + Pricing)
   - Click "Bắt đầu miễn phí" → redirect Google OAuth
   - Console KHÔNG có lock errors
4. **Push:**
   ```bash
   git add -A
   git commit -m "fix: auth context refactor + PKCE hardening + cleanup"
   git push brain2-origin main
   ```
5. **Verify Cloudflare build** — chờ Cloudflare Pages auto-build từ GitHub push

#### Phase F: E2E Production Smoke Test (SAU KHI DEPLOY)
1. Mở `https://brain2.thongphan.com/` → landing page hiện đẹp
2. Click "Bắt đầu miễn phí" → Google login → redirect về callback → auto-redirect tới onboarding
3. Onboarding 3 steps → submit → redirect tới `/chat`
4. Chat page — type message → nhận streaming response từ AI
5. Tất cả KHÔNG có console errors

---

### FILES LIÊN QUAN (đọc/sửa):

| File | Vai trò | Hành động |
|------|---------|-----------|
| `src/lib/supabase.ts` | Supabase client init | VERIFY lock bypass config |
| `src/hooks/useAuth.ts` | Auth hook (CŨ) | REFACTOR → context consumer |
| `src/contexts/AuthContext.tsx` | Auth context (MỚI) | CREATE — single listener |
| `src/App.tsx` | Router + guards | UPDATE — wrap AuthProvider |
| `src/pages/AuthCallback.tsx` | OAuth callback | UPDATE — PKCE hardening |
| `src/pages/OnboardingPage.tsx` | Onboarding flow | VERIFY rendering |
| `src/pages/LandingPage.tsx` (pages/) | Landing page | VERIFY CSS |
| `src/LandingPage.tsx` (root) | ORPHAN | DELETE |
| `src/LandingPage.css` | ORPHAN | DELETE |
| `src/index.css` | Global styles | VERIFY `.onboarding-*` classes exist |
| `supabase/functions/*/index.ts` | Edge Functions | VERIFY schema references |

---

### CONTEXT & CONSTRAINTS:

- **Supabase project:** `sauuvyffudkmdbeglspb` (FREE tier)
- **Custom domain:** `brain2.thongphan.com` (Cloudflare Pages)
- **Pages project:** `brain2-platform` (Cloudflare)
- **Git remote:** `brain2-origin` → `github.com/thongphan23/brain2-app.git`
- **Deploy:** Push to `brain2-origin main` → Cloudflare auto-build
- **Build command:** `npm run build` (= `tsc -b && vite build`)
- **Edge Functions:** Already deployed via Supabase MCP, KHÔNG cần redeploy (trừ khi sửa code)
- **Google OAuth:** ĐÃ configured (Site URL + Redirect URLs + Provider enabled)
- **Secrets Edge Functions:** 7 secrets đã set (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, DB_URL, VERTEX_KEY_URL, VERTEX_KEY_API_KEY, PAYMENT_WEBHOOK_SECRET)

---

### ACCEPTANCE CRITERIA:

- [ ] AC-1: Landing page `brain2.thongphan.com` hiện đầy đủ Hero + Features + Pricing (KHÔNG blank)
- [ ] AC-2: Click "Bắt đầu miễn phí" → Google OAuth flow hoàn tất → redirect onboarding
- [ ] AC-3: Onboarding page hiện 3 steps (tên, goals, first prompt) → submit thành công
- [ ] AC-4: `/chat` page load + AI streaming response hoạt động
- [ ] AC-5: Console browser KHÔNG có `Lock was released` hoặc `PKCE` errors
- [ ] AC-6: `npm run build` → 0 errors, `grep -r "localhost" dist/` trả rỗng
- [ ] AC-7: Orphan files đã xóa (src/LandingPage.tsx, src/LandingPage.css)
- [ ] AC-8: Auth state dùng React Context — chỉ 1 `onAuthStateChange` listener

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
| Payment | Chuyển khoản VIB → webhook auto-match | VIB account: PHAN MINH THÔNG — 002031988 |
| Giá | Pro 499K, VIP 999K VNĐ/tháng | Anh chốt |
| Dark mode | Mặc định, no light toggle | Anh chốt |
| Radar Chart | Pure SVG (no Chart.js) | Bundle size nhỏ |
| Transaction code | B2-{user_id_prefix_8char} | Auto-match payment |
| Lazy Loading | Dashboard, Import, Settings, Vault lazy | Chat + Landing eager |
| Lock bypass | No-op lock function | Fix Navigator Locks deadlock |
| Schema | `public` schema for all user-facing tables | Supabase client default |

---

## 📝 KẾT QUẢ PHIÊN

### 2026-04-08 09:35 — AUDIT: 6 bugs identified, handoff created
**Ai ghi:** Antigravity
**Status:** 🔴 Giao Claude Code audit + fix toàn diện

**Bugs xác định:**
1. 🔴 Code fix chưa push (2 commits local-only)
2. 🔴 Multiple useAuth() instances → duplicate auth listeners → lock conflict
3. 🟡 Schema duplication (public vs system)
4. 🟡 Duplicate LandingPage files (orphan 15KB ở src/)
5. 🟡 AuthCallback PKCE fragile (no retry/timeout)
6. 🟢 Onboarding blank page (likely caused by Bug 2)

**Evidence:**
- Screenshot: trang chủ blank (spinner ⏳ giữa màn đen)
- Screenshot: trang onboarding blank (đen xì, height = viewport)
- Console: Lock conflict errors + PKCE verifier missing
- Git: brain2-origin/main 2 commits behind HEAD

---

### 2026-04-07 22:15 — Phase 8: Deploy Prep ✅ Hoàn thành (code ready)
**Ai ghi:** Claude Code
**Status:** ✅ Code hoàn tất, deployed

---

### 2026-04-07 21:00 — Phase 4+5+6+7 MEGA BUILD ✅ Hoàn thành
**Ai ghi:** Claude Code | **Verified by:** Antigravity ✅

---

### 2026-04-07 19:30 — Phase 3: Vault ✅
### 2026-04-07 19:00 — Phase 2: Core Chat ✅
### 2026-04-07 17:00 — Phase 1: Foundation ✅ (7/7 ACs pass)

---
