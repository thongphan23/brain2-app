# 📋 Sổ Bàn Giao v2.0 — Brain2 Platform

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc KỸ trước khi làm.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-08 13:40
**Phiên bản:** v2.0 — Onboarding hiện OK nhưng ĐỨNG khi nhấn Lưu
**Tình trạng chung:** 🟡 CRITICAL — Landing page OK, Onboarding hiện OK, nhưng FREEZE khi submit

### Đã fix (qua 2 phiên audit, 10 bugs):
1. ✅ BUG 1: Code chưa push → đã push tất cả commits
2. ✅ BUG 2: Multiple auth listeners → AuthContext single listener
3. ✅ BUG 3: Schema duplication → migration file tạo (CHƯA CHẠY)
4. ✅ BUG 4: Orphan LandingPage files → xóa 29KB
5. ✅ BUG 5: PKCE fragile → 15s timeout + error recovery
6. ✅ BUG 6: Onboarding blank → hệ quả Bug 2+7+8, đã fix
7. ✅ BUG 7: Infinite redirect loop → `/onboarding` dùng AuthRoute thay ProtectedRoute
8. ✅ BUG 8: Infinite profile fetch → track currentUserIdRef, skip TOKEN_REFRESHED
9. ✅ BUG 9: Loading spinner vĩnh viễn → 5s safety timeout
10. ✅ BUG 10: Cloudflare Pages = Direct Upload, không auto-deploy → dùng wrangler

### ĐANG LỖI — BUG 11 (MỚI):
**Triệu chứng:** Onboarding hiện form OK (3 steps: tên, goals, first prompt). Khi nhấn nút **"Bắt đầu Brain2 🚀"** ở Step 3 → **giao diện ĐỨNG** (freeze, không navigate tới /chat).

**Root cause khả năng nhất:**
1. `handleComplete()` → `refreshProfile()` → gọi `fetchProfile()` → `fetchingRef.current` vẫn `true` (bị khóa từ lần init trước) → SKIP → profile không refresh → `ProtectedRoute` thấy `onboarding_completed: false` → redirect lại /onboarding → LOOP
2. Hoặc `supabase.from('profiles').update(...)` fail do RLS policy chưa cho phép user UPDATE chính mình
3. Hoặc `refreshProfile()` update profile state → `onAuthStateChange` không fire → profile context vẫn cũ → navigation tới /chat bị ProtectedRoute block → redirect vòng

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

---

## ⚡ TASK HIỆN TẠI — AUDIT TOÀN DIỆN + FIX BUG 11

### 🔲 FULL AUDIT + FIX — Brain2 Production
**Giao bởi:** Antigravity | **Ngày:** 2026-04-08 13:40
**Loại:** Critical Bug Fix + Full Code Audit
**Ưu tiên:** 🔴 CRITICAL — App đứng khi submit onboarding, không dùng được

---

### 🔴 BUG 11: Onboarding Freeze khi nhấn "Bắt đầu Brain2 🚀"

**Triệu chứng:**
- Onboarding form hiện OK (3 steps: tên, goals, first prompt)
- Khi nhấn nút cuối cùng "Bắt đầu Brain2 🚀" → giao diện ĐỨNG
- Không navigate tới /chat, không có error visible trên UI
- Button có thể stuck ở trạng thái "Đang lưu..."

**Code liên quan:**

```tsx
// src/pages/OnboardingPage.tsx dòng 28-55
const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Update profile — CÓ THỂ FAIL do RLS?
      await supabase.from('profiles').update({
          display_name: displayName || ...,
          usage_goals: selectedGoals,
          onboarding_completed: true,
        }).eq('id', user.id)

      // 2. Refresh profile — CÓ THỂ HANG do fetchingRef lock?
      await refreshProfile()

      // 3. Navigate — CÓ THỂ BỊ BLOCK bởi ProtectedRoute?
      navigate('/chat', { replace: true })
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
    }
  }
```

**Giả thuyết (kiểm tra theo thứ tự):**

1. **RLS chặn UPDATE** — table `profiles` có RLS policy cho phép user UPDATE row của chính mình không? Kiểm tra:
   ```sql
   SELECT polname, polcmd, qual, with_check 
   FROM pg_policies WHERE tablename = 'profiles';
   ```
   → Nếu thiếu UPDATE policy → user KHÔNG THỂ update `onboarding_completed` → supabase.update() fail im lặng → `refreshProfile()` lấy data cũ → `ProtectedRoute` block `/chat`

2. **fetchingRef deadlock** — `fetchProfile` có `fetchingRef.current` guard. Nếu `fetchingRef.current = true` từ lần init trước (chưa reset do error) → `refreshProfile()` skip fetch → profile context cũ → app freeze
   → Fix: Reset `fetchingRef.current = false` trước khi fetch trong `refreshProfile`

3. **ProtectedRoute redirect loop** — Sau `refreshProfile()`, profile state update, navigate tới `/chat`. Nhưng `/chat` bọc trong `ProtectedRoute` check `profile?.onboarding_completed`. Nếu React chưa re-render với profile mới → `onboarding_completed` vẫn `false` → redirect về `/onboarding` → loop vô hình

4. **Error swallowed** — `supabase.update()` trả `{ error }` nhưng code KHÔNG check `error` → fail im lặng

---

### BUILD ORDER (thứ tự thực hiện — BẮT BUỘC test/verify từng bước):

#### Phase A: Audit RLS Policies (15 phút)
1. **Kiểm tra RLS policies cho `profiles`:**
   ```sql
   SELECT polname, polcmd, qual::text, with_check::text
   FROM pg_policies WHERE tablename = 'profiles';
   ```
2. **Nếu THIẾU UPDATE policy** → tạo:
   ```sql
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id)
     WITH CHECK (auth.uid() = id);
   ```
3. **Kiểm tra tương tự cho mọi table user cần write:** `conversations`, `messages`, `vault_items`, `usage_daily`, `payments`
4. **TEST:** Mở Supabase SQL Editor, login thủ công, thử UPDATE profiles set onboarding_completed = true → phải thành công

#### Phase B: Fix OnboardingPage Error Handling (10 phút)
1. **Check Supabase update result:**
   ```tsx
   const { error: updateError } = await supabase
     .from('profiles').update({...}).eq('id', user.id)
   
   if (updateError) {
     console.error('[Onboarding] Update failed:', updateError)
     // Show toast error
     return
   }
   ```
2. **Reset fetchingRef trước refreshProfile:**
   ```tsx
   // Trong refreshProfile hoặc trước khi gọi:
   fetchingRef.current = false
   await refreshProfile()
   ```
3. **Thêm try-catch rõ ràng** với error message tiếng Việt trên UI

#### Phase C: Full Audit — Rà soát toàn bộ flow (30 phút)
**Em PHẢI rà soát từng file theo checklist này:**

| # | File | Kiểm tra gì | Kết quả |
|---|------|-------------|---------|
| 1 | `src/lib/supabase.ts` | Lock bypass, storageKey, flowType pkce | ☐ |
| 2 | `src/contexts/AuthContext.tsx` | Single listener, currentUserIdRef, safety timeout, fetchingRef deadlock | ☐ |
| 3 | `src/hooks/useAuth.ts` | Chỉ re-export từ AuthContext, KHÔNG có listener riêng | ☐ |
| 4 | `src/App.tsx` | AuthProvider wrap đúng, AuthRoute cho /onboarding, ProtectedRoute cho /chat | ☐ |
| 5 | `src/pages/AuthCallback.tsx` | PKCE recovery, 15s timeout, mounted guard | ☐ |
| 6 | `src/pages/OnboardingPage.tsx` | Error handling, RLS check, fetchingRef reset | ☐ |
| 7 | `src/pages/ChatPage.tsx` | Profile/user check, edge function calls | ☐ |
| 8 | `src/pages/LandingPage.tsx` | Render đúng, không duplicate | ☐ |
| 9 | `src/index.css` | `.onboarding-*`, `.chat-*`, `.landing-*` classes đầy đủ | ☐ |
| 10 | `supabase/functions/*/index.ts` | Schema references (public NOT system), error handling | ☐ |

**Với MỖI file báo cáo:**
- ✅ Pass — không có issue
- ⚠️ Warning — có issue minor, mô tả
- 🔴 Critical — có bug, mô tả + fix plan

#### Phase D: Fix tất cả issues tìm được từ Phase C
- Fix theo thứ tự ưu tiên: 🔴 trước, ⚠️ sau
- Mỗi fix phải verify ngay (không batch fix rồi verify cuối cùng)

#### Phase E: Build + Deploy (BẮT BUỘC đọc kỹ!)
1. **Build:**
   ```bash
   npm run build
   ```
   → PHẢI 0 errors, 0 warnings

2. **⚠️ DEPLOY QUA WRANGLER — KHÔNG PHẢI GIT PUSH:**
   ```bash
   npx wrangler pages deploy dist/ --project-name brain2-platform
   ```
   > **QUAN TRỌNG:** Cloudflare Pages project `brain2-platform` dùng **Direct Upload** (Git Provider = "No"). 
   > Push code lên GitHub KHÔNG tự động trigger build trên Cloudflare.
   > Em PHẢI chạy `wrangler pages deploy` sau khi build.

3. **Verify bundle mới lên production:**
   ```bash
   curl -s "https://brain2.thongphan.com/" | grep -o 'index-[A-Za-z0-9_]*\.js'
   ```
   → Hash phải KHÁC với production hiện tại

#### Phase F: E2E Smoke Test (SAU KHI DEPLOY — BẮT BUỘC)
1. **Landing page:** `brain2.thongphan.com` → Hero + Features + Pricing hiện đầy đủ
2. **Google Login:** Click "Bắt đầu miễn phí" → Google OAuth → redirect callback
3. **Auth Callback:** Auto-redirect tới /onboarding (new user) hoặc /chat (existing user)
4. **Onboarding 3 steps:**
   - Step 1: Nhập tên → "Tiếp tục" ✅
   - Step 2: Chọn goals → "Tiếp tục" ✅
   - Step 3: Nhập prompt (optional) → **"Bắt đầu Brain2 🚀"** → PHẢI navigate tới /chat ✅
5. **Chat page:** Gửi 1 tin nhắn → nhận streaming response từ AI
6. **Console:** KHÔNG có errors (warnings OK)
7. **Network:** KHÔNG có infinite request loops

**Nếu BẤT CỨ STEP NÀO fail → FIX ngay, redeploy, test lại. KHÔNG báo "done" khi chưa pass hết.**

---

### CONTEXT & CONSTRAINTS:

- **Supabase project:** `sauuvyffudkmdbeglspb` (FREE tier)
- **Custom domain:** `brain2.thongphan.com` (Cloudflare Pages)
- **Cloudflare Pages project:** `brain2-platform` (⚠️ Direct Upload, KHÔNG auto-deploy từ Git)
- **Git remote:** `brain2-origin` → `github.com/thongphan23/brain2-app.git`
- **Deploy command:** `npx wrangler pages deploy dist/ --project-name brain2-platform`
- **Build command:** `npm run build` (= `tsc -b && vite build`)
- **Edge Functions:** Already deployed via Supabase, KHÔNG cần redeploy (trừ khi sửa code)
- **Google OAuth:** ĐÃ configured đầy đủ trên Supabase Dashboard
- **Secrets Edge Functions:** 7 secrets đã set

---

### ACCEPTANCE CRITERIA:

- [ ] AC-1: Landing page hiện đầy đủ Hero + Features + Pricing
- [ ] AC-2: Google OAuth flow hoàn tất → redirect onboarding/chat
- [ ] AC-3: Onboarding 3 steps → nhấn "Bắt đầu Brain2 🚀" → navigate tới /chat (KHÔNG ĐỨNG)
- [ ] AC-4: /chat page load + AI streaming response hoạt động
- [ ] AC-5: Console KHÔNG có Lock/PKCE/infinite errors
- [ ] AC-6: `npm run build` → 0 errors
- [ ] AC-7: Full audit checklist Phase C — TẤT CẢ files pass ✅
- [ ] AC-8: Deploy qua wrangler → bundle hash mới trên production
- [ ] AC-9: RLS policies đủ cho mọi table user cần access

---

## 📌 QUYẾT ĐỊNH ĐÃ CHỐT

| Quyết định | Giá trị | Lý do |
|-----------|---------|-------|
| Framework | Vite + React 19 + TypeScript | Nhanh, SPA, Cloudflare Pages |
| Styling | Vanilla CSS + CSS variables | Full control, no Tailwind |
| Auth | Google OAuth only (PKCE flow) | Single provider |
| Database | Supabase `sauuvyffudkmdbeglspb` | FREE tier |
| AI Routing | Vertex-key proxy | Đã operational |
| Hosting | Cloudflare Pages (Direct Upload) | Static SPA |
| Payment | Chuyển khoản VIB → webhook | VIB: PHAN MINH THÔNG — 002031988 |
| Giá | Pro 499K, VIP 999K VNĐ/tháng | Chốt |
| Dark mode | Mặc định, no light toggle | Chốt |
| Lock bypass | No-op lock function | Fix Navigator Locks deadlock |
| Schema | `public` schema for all tables | Supabase client default |
| Deploy | `wrangler pages deploy` | Direct Upload project |

---

## 📝 KẾT QUẢ PHIÊN

### 2026-04-08 13:40 — BUG 11: Onboarding freeze khi submit
**Ai ghi:** Antigravity
**Status:** 🔴 Giao Claude Code audit + fix

**Mô tả:** Onboarding form hiện đúng (Step 1: tên, Step 2: goals, Step 3: prompt). Nhưng khi nhấn "Bắt đầu Brain2 🚀" → UI đứng, không navigate tới /chat.

**Tạo handoff v2.0** yêu cầu:
1. Fix BUG 11 (onboarding freeze)
2. FULL AUDIT 10 files core
3. E2E test pass tất cả 7 steps
4. Deploy qua wrangler (KHÔNG git push)

---

### 2026-04-08 11:40 — Wrangler deploy thành công + Onboarding hiện OK
**Ai ghi:** Antigravity (trực tiếp fix + deploy)
**Status:** 🟢 Onboarding form HIỆN — nhưng freeze khi submit

**Fixes:**
- BUG 7: Tạo `AuthRoute` cho `/onboarding` (commit `29b8fbb`)
- BUG 8: Track `currentUserIdRef`, skip TOKEN_REFRESHED events (commit `68367d9`)
- BUG 9: 5s safety timeout cho auth init (commit `7c56d36`)
- BUG 10: Deploy qua `npx wrangler pages deploy dist/ --project-name brain2-platform`

**Verification:**
- ✅ Landing page render đầy đủ (Firecrawl + browser confirm)
- ✅ Onboarding form hiện (screenshot: 🧠 "Chào mừng đến Brain2!", input, button)
- ✅ Bundle mới `index-CuyJJnrq.js` trên production
- ❌ Submit onboarding → FREEZE

---

### 2026-04-08 10:15 — AUDIT FIX: Bugs 1-6 resolved
**Ai ghi:** Claude Code
**Status:** ✅ 6 bugs fixed, push lên GitHub

**Fixes:**
1. ✅ `src/contexts/AuthContext.tsx` — Tạo: single `onAuthStateChange` listener
2. ✅ `src/hooks/useAuth.ts` — Refactor: re-export từ context
3. ✅ `src/App.tsx` — Wrap `<AuthProvider>` bọc `<AppRoutes>`
4. ✅ `src/pages/AuthCallback.tsx` — 15s timeout + PKCE recovery
5. ✅ `src/LandingPage.tsx` (orphan) — Xóa
6. ✅ `src/LandingPage.css` (orphan) — Xóa
7. ✅ Migration file tạo (chưa chạy)
8. ✅ Build 0 errors

**Commit:** `b72e5ec` — "fix: auth context refactor + PKCE hardening + schema fix"
