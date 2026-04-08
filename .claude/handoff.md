# 📋 Sổ Bàn Giao v3.0 — Brain2 Platform: FULL STABILIZATION

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc KỸ trước khi làm.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-08 15:40
**Phiên bản:** v3.0 — FULL PRODUCTION STABILIZATION
**Tình trạng chung:** 🔴 CRITICAL — App online nhưng chat KHÔNG hoạt động + nhiều tính năng chưa kiểm tra

### Tiến độ qua 3 phiên audit (bugs 1-11):
- ✅ BUG 1-10: Auth architecture, PKCE, infinite loops → FIXED
- ✅ BUG 11: Onboarding freeze → FIXED (RLS UPDATE + fetchingRef reset)
- ✅ Landing page renders đẹp
- ✅ Onboarding 3 steps chạy mượt
- ✅ RLS policies đầy đủ cho profiles (SELECT, INSERT, UPDATE)

### 🔴 BUG HIỆN TẠI — BUG 12: Chat CHẾT HOÀN TOÀN
**Triệu chứng (user báo):** "Khi chat, hệ thống mất luôn đoạn chat, không phản hồi không gì cả"
**Bằng chứng từ edge function logs:**
```
POST | 503 | /functions/v1/chat — execution_time_ms: 2359
```
→ Edge function `chat` trả **503 Service Unavailable** → vertex-key.com API fail

**Root causes khả năng:**
1. `VERTEX_KEY_API_KEY` secret hết balance / sai key
2. Model ID `gemini-2.5-flash-chat` không đúng format vertex-key.com yêu cầu
3. Frontend nhận 503 nhưng `contentType` check ĐÚNG (non-streaming error path thử parse JSON) → user message bị XÓA khỏi UI (`setMessages(prev => prev.filter(...))`), nên "mất luôn đoạn chat"
4. Edge function dùng `Supabase.ai.Session('gte-small')` cho embedding — có thể fail và gây lỗi logic flow

---

## 📚 SKILLS & KNOWLEDGE

### Skills đã cài (auto-load khi cần):
- `~/.claude/skills/` — 16 global skills (Superpowers, Frontend Design, Testing...)

### Spec files (ĐỌC TRƯỚC):
- `.claude/spec/design-system.md` — Colors, typography, spacing
- `.claude/prd/PRD_brain2-platform-rebuild.md` — Full PRD 16 sections

### Conventions bắt buộc:
- **Vanilla CSS ONLY** — CSS variables, design tokens ở `index.css`
- **Dark mode mặc định** — Navy Blue `#2563B8` + Gold `#D4A537`, bg-primary `#111318`
- **Inter font** — body + headings. JetBrains Mono — code blocks
- **Streaming chat** — SSE, không polling
- **Error messages tiếng Việt**
- **RLS enforced** — mọi table phải có Row Level Security
- **Naming**: Components PascalCase, hooks `use`+CamelCase, CSS `.kebab-case`, DB `snake_case`

---

## 📐 PRD REFERENCE

**PRD file:** `.claude/prd/PRD_brain2-platform-rebuild.md`
**PRD Status:** Approved ✅

---

## ⚡ TASK HIỆN TẠI — FULL PRODUCTION STABILIZATION (24h Sprint)

### 🔲 MEGA TASK: Brain2 Production-Ready
**Giao bởi:** Antigravity | **Ngày:** 2026-04-08 15:40
**Loại:** Critical Bug Fix + Full Feature Audit + Production Hardening
**Ưu tiên:** 🔴 HIGHEST — App phải dùng được end-to-end
**Thời lượng:** Long-running (chạy liên tục cho đến khi PASS HẾT AC)

---

## PHASE 1: FIX CHAT (🔴 CRITICAL — làm ĐẦU TIÊN)

### BUG 12: Chat trả 503, user message biến mất

**Root cause analysis — kiểm tra theo thứ tự:**

#### 1.1. Verify VERTEX_KEY_API_KEY
```bash
# Test direct API call
curl -s -X POST "https://vertex-key.com/api/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(supabase functions env list --project-ref sauuvyffudkmdbeglspb 2>/dev/null | grep VERTEX_KEY_API_KEY | awk '{print $2}')" \
  -d '{"model": "gemini-2.5-flash-chat", "messages": [{"role": "user", "content": "Hello"}], "max_tokens": 50}' | head -200
```
→ Nếu trả error balance/auth → KEY HẾT TIỀN hoặc SAI
→ Nếu trả 404 model → MODEL ID SAI

**ALTERNATIVE:** Nếu không lấy được key trực tiếp, test qua edge function:
```bash
curl -s -X GET "https://sauuvyffudkmdbeglspb.supabase.co/functions/v1/chat"
```
→ Trả JSON với `models` array + `version` + `status`

#### 1.2. Kiểm tra model IDs
File `supabase/functions/chat/index.ts` dòng 58-69 define MODELS:
- `gemini-2.5-flash` → vertexId `gemini-2.5-flash-chat`
- `gemini-2.5-pro` → vertexId `gemini-2.5-pro-chat`

**⚠️ QUAN TRỌNG:** vertex-key.com có thể KHÔNG dùng suffix `-chat`. Kiểm tra documentation hoặc test trực tiếp. Có thể cần thay đổi thành:
- `gemini-2.5-flash` (không có `-chat`)
- `google/gemini-2.5-flash-preview-04-17` (format đầy đủ)

#### 1.3. Fix frontend error handling
File `src/hooks/useChat.ts` dòng 82-94:
- Khi server trả non-streaming response → code parse JSON → remove user message
- **Vấn đề:** User thấy tin nhắn biến mất mà KHÔNG thấy error message
- **Fix:** Giữ user message + hiện error toast rõ ràng

```tsx
// TRƯỚC (xấu):
setMessages(prev => prev.filter(m => m.id !== userMessage.id))

// SAU (tốt):
// KHÔNG xóa userMessage. Thêm error bubble DƯỚI user message
setMessages(prev => [...prev, {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: `⚠️ ${errData.message || 'Không thể kết nối AI. Vui lòng thử lại.'}`,
  conversation_id: '',
  created_at: new Date().toISOString(),
}])
```

#### 1.4. Kiểm tra Supabase.ai.Session embedding
```typescript
// Dòng 163 trong chat/index.ts:
const aiSession = new Supabase.ai.Session('gte-small');
```
→ Nếu Supabase không có `gte-small` model trên FREE tier → crash toàn bộ flow
→ Fix: Wrap trong try-catch MẠNH HƠN, nếu embedding fail → skip RAG, vẫn chat bình thường

#### 1.5. Verify rate limit RPC
```sql
-- Kiểm tra check_rate_limit function
SELECT check_rate_limit('some-test-user-id-here');
```
→ Nếu RPC fail → tiếp tục vì code đã có try-catch, nhưng VERIFY

#### 1.6. TEST CHAT sau khi fix:
1. Login Google → vào /chat
2. Gõ "Xin chào" → nhấn Send
3. Phải thấy: user bubble + streaming AI response
4. Console: KHÔNG có error 503

**CRITICAL: Nếu chat vẫn fail sau fix code → vấn đề là ở VERTEX_KEY_API_KEY balance. Báo Antigravity để nạp tiền.**

---

## PHASE 2: FULL FEATURE AUDIT (30 files, 9 features)

Rà soát TỪNG TÍNH NĂNG theo bảng dưới. Với mỗi feature: đọc code → tìm bug → fix → verify.

### Feature Matrix — Audit Checklist

| # | Feature | Frontend Files | Backend (Edge Fn) | Database | Status |
|---|---------|---------------|-------------------|----------|--------|
| F1 | **Landing Page** | `pages/LandingPage.tsx` | — | — | ☐ |
| F2 | **Auth Flow** | `pages/AuthCallback.tsx`, `contexts/AuthContext.tsx`, `hooks/useAuth.ts` | — | `profiles` | ☐ |
| F3 | **Onboarding** | `pages/OnboardingPage.tsx` | — | `profiles` | ☐ |
| F4 | **Chat AI** | `components/chat/*` (5 files), `hooks/useChat.ts` | `chat/index.ts` | `conversations`, `messages`, `usage_daily` | ☐ |
| F5 | **Vault (Notes)** | `components/vault/*` (7 files), `hooks/useVault.ts`, `hooks/useVaultSearch.ts` | `embed/index.ts`, `search-notes/index.ts` | `notes` | ☐ |
| F6 | **Dashboard** | `components/dashboard/*` (5 files), `hooks/useAnalytics.ts` | `analyze-vault/index.ts`, `recommend/index.ts` | `knowledge_analytics`, `recommendations` | ☐ |
| F7 | **Import** | `components/import/*` (3 files) | `import-files/index.ts`, `notion-connect/index.ts` | `notes` | ☐ |
| F8 | **Payment** | `components/payment/*` (2 files), `hooks/useTier.ts` | `payment-webhook/index.ts` | `payments`, `profiles.tier` | ☐ |
| F9 | **Settings** | `pages/SettingsPage.tsx` | — | `profiles` | ☐ |

### Audit Protocol — Cho MỖI feature:

**Step A: Code Review**
- Đọc TOÀN BỘ files liên quan
- Kiểm tra: error handling, edge cases, null checks, RLS compatibility
- Kiểm tra: UI hiển thị đúng tiếng Việt, dark mode, responsive

**Step B: Runtime Test**  
- Build local: `npm run dev`
- Test feature trong browser (hoặc curl nếu backend)
- Ghi nhận: ✅ Pass / 🔴 Fail / ⚠️ Warning

**Step C: Fix Issues**
- Fix ngay nếu tìm thấy bug
- Error handling phải dùng tiếng Việt
- Mỗi fix → verify lại ngay

**Step D: Report**
- Ghi kết quả vào KẾT QUẢ PHIÊN ở cuối file này

---

### PHASE 2 CHI TIẾT — Từng Feature:

#### F1: Landing Page
**Files:** `src/pages/LandingPage.tsx`, `src/index.css` (.landing-*)
**Checklist:**
- [ ] Hero section render đúng (gradient, animation)
- [ ] Features section (4 cards) với icons + descriptions
- [ ] Pricing section (3 tiers: Free/Pro/VIP) với giá đúng
- [ ] CTA button "Bắt đầu miễn phí" → link tới Google OAuth
- [ ] Footer + social links
- [ ] Performance: No CLS, fast LCP

#### F2: Auth Flow
**Files:** `AuthContext.tsx`, `useAuth.ts`, `AuthCallback.tsx`, `supabase.ts`, `App.tsx`
**Checklist:**
- [ ] Google OAuth: Click login → Google → redirect → /auth/callback
- [ ] PKCE flow: Code verifier exchange + 15s timeout
- [ ] AuthCallback: Handle race conditions, mounted guard
- [ ] AuthContext: Single listener, no infinite loops
- [ ] Safety timeout: 5s max init
- [ ] ProtectedRoute: Redirect đúng (unauthenticated → landing, no onboarding → onboarding)
- [ ] AuthRoute: Redirect đúng (authenticated + onboarded → chat)
- [ ] Tab close + reopen: Session persist (storageKey `sb-brain2-auth-token`)
- [ ] Logout: Clear session + redirect landing

#### F3: Onboarding
**Files:** `OnboardingPage.tsx`
**Checklist:**
- [ ] Step 1: Display name input
- [ ] Step 2: Goals selection (6 options)
- [ ] Step 3: First prompt (optional)
- [ ] Submit: Update profile → refreshProfile → navigate /chat
- [ ] Error handling: Alert/toast if update fails
- [ ] UI: Progress dots, back button, animations

#### F4: Chat AI (🔴 HIGHEST PRIORITY — đang broken)
**Frontend files:** `ChatInterface.tsx`, `ChatInput.tsx`, `MessageBubble.tsx`, `ModeSelector.tsx`, `ModelSelector.tsx`, `NoteCreateSuggestion.tsx`, `useChat.ts`, `useConversations.ts`, `ChatPage.tsx`
**Backend:** `supabase/functions/chat/index.ts`
**DB tables:** `conversations`, `messages`, `cognitive_tools`, `usage_daily`

**Checklist:**
- [ ] Welcome state: 4 suggested prompts hiện đúng
- [ ] Mode selector: 4 modes (Tự do, Chiêm nghiệm, Nghiên cứu, Cố vấn) — data từ `cognitive_tools` table
- [ ] Model selector: Show models theo tier (free = flash + haiku)
- [ ] Send message: POST /functions/v1/chat → SSE stream → render progressively
- [ ] Error 503 handling: KHÔNG xóa user message, hiện error bubble
- [ ] Rate limiting: Hiện usage badge (X/30 cho free tier)
- [ ] Conversation management: Create, select, pin, archive, delete
- [ ] Sidebar: List conversations mới nhất → click load messages
- [ ] Load messages khi select conversation → render history
- [ ] Markdown rendering trong MessageBubble
- [ ] Auto-scroll to bottom on new message
- [ ] New chat button: Clear messages, reset state
- [ ] Auto-send first prompt from onboarding

**Edge function `chat/index.ts` audit:**
- [ ] Auth validation (Bearer token → getUser)
- [ ] Rate limit check (check_rate_limit RPC)
- [ ] Tool prompt load từ cognitive_tools
- [ ] Conversation creation/reuse
- [ ] Message history load (limit 20)
- [ ] Vault RAG context (embedding → search_notes RPC) — MUST handle failure gracefully
- [ ] AI call to vertex-key.com — VERIFY model IDs match API
- [ ] Fallback model logic
- [ ] SSE streaming response
- [ ] Save user + assistant messages WITH user_id
- [ ] Update conversation last_message_at
- [ ] Increment usage (increment_usage RPC)
- [ ] CORS headers correct

#### F5: Vault (Notes Management)
**Frontend:** `VaultBrowser.tsx`, `NoteList.tsx`, `NoteCard.tsx`, `NoteDetail.tsx`, `NoteEditor.tsx`, `SearchBar.tsx`, `FilterChips.tsx`, `useVault.ts`, `useVaultSearch.ts`
**Backend:** `embed/index.ts`, `search-notes/index.ts`
**DB:** `notes` table

**Checklist:**
- [ ] List notes: Load user's notes, paginated (200 limit)
- [ ] Filter by type (concept, insight, reflection, experience, project, other)
- [ ] Filter by maturity (seed, growing, mature)
- [ ] Filter by domain
- [ ] Search: Keyword search + semantic search (via search-notes edge fn)
- [ ] Create note: Title, content, type, domain, maturity
- [ ] Edit note: Inline editing, auto-save
- [ ] Delete note: Soft delete (set deleted_at)
- [ ] Note detail: Full content view with markdown rendering
- [ ] Embedding: After create/update → trigger embed edge function
- [ ] RLS: notes table has SELECT, INSERT, UPDATE policies

#### F6: Knowledge Dashboard
**Frontend:** `KnowledgeDashboard.tsx`, `RadarChart.tsx`, `MaturityChart.tsx`, `StatsCards.tsx`, `RecommendationCards.tsx`, `UsageStats.tsx`, `useAnalytics.ts`
**Backend:** `analyze-vault/index.ts`, `recommend/index.ts`
**DB:** `knowledge_analytics`, `recommendations`

**Checklist:**
- [ ] Radar chart: 6 dimensions of knowledge strength
- [ ] Maturity distribution: pie/bar chart (seed vs growing vs mature)
- [ ] Stats cards: Total notes, domains, avg maturity, connections
- [ ] Recommendations: AI-generated suggestions for learning
- [ ] Usage stats: Messages today, notes created, AI cost
- [ ] Edge function analyze-vault: Returns analytics data
- [ ] Edge function recommend: Returns personalized recommendations
- [ ] Error states: Empty vault, loading skeleton, error message

#### F7: Import
**Frontend:** `ImportManager.tsx`, `FileImport.tsx`, `NotionImport.tsx`
**Backend:** `import-files/index.ts`, `notion-connect/index.ts`

**Checklist:**
- [ ] File upload: Accept .md, .txt files
- [ ] Notion OAuth: Connect → import pages
- [ ] Progress indicator during import
- [ ] Error handling: File too large, invalid format
- [ ] Notes created correctly in DB after import
- [ ] Embeddings triggered for imported notes

#### F8: Payment
**Frontend:** `PaymentFlow.tsx`, `PaymentStatus.tsx`, `useTier.ts`
**Backend:** `payment-webhook/index.ts`
**DB:** `payments`, `profiles`

**Checklist:**
- [ ] Show current tier (Free/Pro/VIP) with pricing
- [ ] Transaction code: B2-{userId} format
- [ ] VIB bank info: PHAN MINH THÔNG — 002031988
- [ ] Payment flow: Select tier → show transfer info → wait for confirmation
- [ ] Webhook: Parse Gmail → match transaction → upgrade tier
- [ ] PaymentStatus: Show pending/completed/failed
- [ ] Tier configs correct (Free: 30 msg/day, Pro: 200, VIP: unlimited)
- [ ] Rate limit by tier works correctly

#### F9: Settings
**Frontend:** `SettingsPage.tsx`

**Checklist:**
- [ ] View profile info (name, email, tier)
- [ ] Edit display name
- [ ] Change usage goals  
- [ ] Logout button
- [ ] Delete account (if implemented)
- [ ] Dark mode (default, no toggle needed per design decision)

---

## PHASE 3: PRODUCTION HARDENING

### 3.1. Error Boundary
- [ ] `ErrorBoundary.tsx` wraps tất cả routes
- [ ] Fallback UI hiển thị message tiếng Việt
- [ ] Auto-report errors (console.error minimum)

### 3.2. Loading States
- [ ] Skeleton components cho mọi async data load
- [ ] No flash of unstyled content
- [ ] Loading spinner cho form submissions

### 3.3. Edge Cases
- [ ] Empty vault: Show proper empty state
- [ ] No conversations: Show welcome screen
- [ ] Expired session: Auto-redirect to login
- [ ] Network offline: Graceful degradation
- [ ] Rate limit hit: Clear message + upgrade CTA

### 3.4. CSS Audit
- [ ] All `.landing-*`, `.chat-*`, `.onboarding-*`, `.vault-*`, `.dashboard-*`, `.settings-*` classes exist
- [ ] No orphan CSS (styles without matching component)
- [ ] Dark mode colors consistent
- [ ] Scrollbar styling
- [ ] Input focus states

### 3.5. TypeScript
- [ ] `npm run build` → 0 errors, 0 warnings
- [ ] No `any` types unless absolutely necessary
- [ ] All interfaces defined in `lib/types.ts`

### 3.6. Security Audit
- [ ] All edge functions validate auth token
- [ ] CORS headers correct (allow brain2.thongphan.com)
- [ ] No secrets exposed in frontend code
- [ ] RLS enabled on every table with user data
- [ ] Service role key ONLY in edge functions, NEVER in frontend

---

## PHASE 4: BUILD & DEPLOY

### 4.1. Build
```bash
npm run build
```
→ PHẢI 0 errors, 0 warnings

### 4.2. Deploy edge functions (NẾU có thay đổi)
```bash
# Chỉ deploy functions đã sửa code:
npx supabase functions deploy chat --project-ref sauuvyffudkmdbeglspb
npx supabase functions deploy embed --project-ref sauuvyffudkmdbeglspb
# ... thêm functions khác nếu sửa
```
**⚠️ IMPORTANT:** Edge function `chat` có `verify_jwt: false` — giữ nguyên vì function tự verify via `getUser()`. KHÔNG bật verify_jwt vì sẽ break custom auth flow.

### 4.3. Deploy frontend
```bash
npx wrangler pages deploy dist/ --project-name brain2-platform
```
> **⚠️ CRITICAL:** Cloudflare Pages project dùng **Direct Upload**. Git push KHÔNG auto-deploy.

### 4.4. Verify deployment
```bash
curl -s "https://brain2.thongphan.com/" | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1
```
→ Hash phải KHÁC `index-0cd_0-R5.js` (bundle hiện tại)

---

## PHASE 5: E2E SMOKE TEST (BẮT BUỘC — không được skip)

### Test Sequence — mỗi step PHẢI pass:

| # | Test | Action | Expected | Status |
|---|------|--------|----------|--------|
| T1 | Landing | Visit brain2.thongphan.com | Hero + Features + Pricing render | ☐ |
| T2 | Login | Click "Bắt đầu miễn phí" | Google OAuth popup | ☐ |
| T3 | Callback | Complete Google login | Redirect to /onboarding (new) or /chat (existing) | ☐ |
| T4 | Onboarding | Complete 3 steps | Navigate to /chat | ☐ |
| T5 | Chat Send | Type "Xin chào" → Send | User bubble appears | ☐ |
| T6 | Chat Response | Wait for AI | Streaming response appears | ☐ |
| T7 | Chat Error | If 503 | Error message shown, user msg NOT deleted | ☐ |
| T8 | New Chat | Click + button | Messages cleared, welcome screen | ☐ |
| T9 | Mode Switch | Change mode | Mode indicator updates | ☐ |
| T10 | Vault | Navigate to /vault | Notes list or empty state | ☐ |
| T11 | Note Create | Click create | Note form, save works | ☐ |
| T12 | Dashboard | Navigate to /dashboard | Charts/stats render | ☐ |
| T13 | Settings | Navigate to /settings | Profile info displayed | ☐ |
| T14 | Sidebar | Click conversation | Load messages history | ☐ |
| T15 | Console | Check DevTools | No critical errors | ☐ |
| T16 | Nav Guards | Visit /chat unauthenticated | Redirect to landing | ☐ |

**Nếu BẤT CỨ test nào FAIL → FIX ngay, redeploy, test lại. KHÔNG báo "done" khi chưa pass HẾT.**

---

## CONTEXT & CONSTRAINTS

### Infrastructure:
- **Supabase project:** `sauuvyffudkmdbeglspb` (FREE tier)
- **Custom domain:** `brain2.thongphan.com` (Cloudflare Pages)
- **Cloudflare Pages project:** `brain2-platform` (⚠️ Direct Upload)
- **Git remote:** `brain2-origin` → `github.com/thongphan23/brain2-app.git`
- **AI Proxy:** `https://vertex-key.com/api/v1` (OpenAI-compatible)

### Commands:
- **Build:** `npm run build`
- **Dev:** `npm run dev`
- **Deploy frontend:** `npx wrangler pages deploy dist/ --project-name brain2-platform`
- **Deploy edge fn:** `npx supabase functions deploy [name] --project-ref sauuvyffudkmdbeglspb`
- **Deploy ALL edge fns:** `for fn in chat embed recommend search-notes analyze-vault import-files payment-webhook; do npx supabase functions deploy $fn --project-ref sauuvyffudkmdbeglspb; done`

### Database Tables (public schema):
`cognitive_tools`, `conversations`, `knowledge_analytics`, `messages`, `notes`, `payments`, `profiles`, `recommendations`, `usage_daily`, `vault_kv`

### Database Functions (RPCs):
- `check_rate_limit(p_user_id uuid)` — Rate limiting
- `increment_usage(p_user_id uuid, p_input_tokens int, p_output_tokens int, p_cost_usd float)` — Track usage
- `search_notes(query_embedding vector, match_threshold float, match_count int, p_user_id uuid)` — Semantic search

### RLS Status (all verified ✅):
- `profiles`: SELECT + INSERT + UPDATE ✅
- `conversations`: SELECT + INSERT + UPDATE ✅
- `messages`: SELECT + INSERT ✅
- `notes`: SELECT + INSERT + UPDATE ✅
- `cognitive_tools`: SELECT (public) ✅
- `payments`: SELECT + INSERT + UPDATE ✅
- `knowledge_analytics`: SELECT + INSERT + UPDATE ✅
- `recommendations`: SELECT + INSERT + UPDATE + DELETE ✅
- `usage_daily`: SELECT + INSERT + UPDATE ✅
- `vault_kv`: RLS enabled, NO policies (only backend access) ✅

### Edge Functions Deployed:
| Slug | Version | JWT | Status |
|------|---------|-----|--------|
| chat | v27 | false | ACTIVE |
| embed | v8 | false | ACTIVE |
| recommend | v6 | false | ACTIVE |
| search-notes | v2 | false | ACTIVE |
| analyze-vault | v2 | false | ACTIVE |
| import-files | v2 | false | ACTIVE |
| payment-webhook | v3 | false | ACTIVE |
| notion-connect | v11 | false | ACTIVE |
| admin-dashboard | v2 | false | ACTIVE |
| backfill | v6 | false | ACTIVE |

### Secrets (7 set on Supabase):
`VERTEX_KEY_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_WEBHOOK_SECRET`, `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `VIB_WEBHOOK_SECRET`

---

## ACCEPTANCE CRITERIA

- [ ] AC-1: Landing page hiện đầy đủ Hero + Features + Pricing
- [ ] AC-2: Google OAuth flow hoàn tất
- [ ] AC-3: Onboarding 3 steps → navigate /chat (KHÔNG freeze)
- [ ] AC-4: **Chat: User gửi tin nhắn → AI trả lời streaming** (BUG 12 FIXED)
- [ ] AC-5: Chat: Error 503 → hiện error bubble, KHÔNG xóa user message
- [ ] AC-6: Vault: List/Create/Edit/Delete notes hoạt động
- [ ] AC-7: Dashboard: Charts + Stats render
- [ ] AC-8: Settings: View + Edit profile
- [ ] AC-9: Navigation guards: Protected routes redirect đúng
- [ ] AC-10: Console: KHÔNG có critical errors
- [ ] AC-11: `npm run build` → 0 errors
- [ ] AC-12: Deploy qua wrangler → bundle hash mới
- [ ] AC-13: E2E tests T1-T16 PASS HẾT
- [ ] AC-14: RLS verified cho mọi table
- [ ] AC-15: Conversation sidebar: List + Select + Load history
- [ ] AC-16: Rate limiting works (free = 30 msg/day)

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
| Edge function JWT | `verify_jwt: false` | Functions self-verify via getUser() |

---

## 📝 KẾT QUẢ PHIÊN

<!-- Claude Code: ghi kết quả ở ĐẦU mục này, MỖI PHIÊN MỘT ENTRY -->
<!-- Format: ### YYYY-MM-DD HH:MM — [Tóm tắt] -->
<!-- BẮT BUỘC ghi: Status, files đã sửa, AC đạt, issues còn lại -->

### 2026-04-08 15:40 — Antigravity tạo handoff v3.0 FULL STABILIZATION
**Ai ghi:** Antigravity
**Status:** 🔴 Giao Claude Code — MEGA TASK

**Context:**
- BUG 12: Chat trả 503 — vertex-key.com API fail hoặc model ID sai
- User báo: "chat mất đoạn tin, không phản hồi"
- Edge function logs xác nhận: `POST | 503 | /functions/v1/chat`
- Frontend xóa user message khi nhận error → user thấy "mất chat"

**Tạo handoff v3.0** — 5 phases:
1. Fix Chat (CRITICAL)
2. Full Feature Audit (9 features, 30+ files)
3. Production Hardening (error boundary, loading, CSS, TypeScript)
4. Build & Deploy (wrangler + edge functions)
5. E2E Smoke Test (16 tests)

---

### 2026-04-08 14:00 — Claude Code: BUG 11 Fixed + Deployed ✅
**Ai ghi:** Claude Code
**Status:** ✅ Phase A+B+D+E done

**Fixes:**
1. `AuthContext.fetchProfile`: Reset `fetchingRef.current = false`
2. `OnboardingPage.handleComplete`: Check `{error}` + alert()
3. Tạo RLS UPDATE policy migration SQL
4. Build 0 errors, Deploy via wrangler

**AC đạt:** AC-1 ✅, AC-6 ✅, AC-7 ✅, AC-8 ✅

---

### 2026-04-08 11:40 — Antigravity fix BUG 7-10 + deploy
**Ai ghi:** Antigravity
**Fixes:** AuthRoute, currentUserIdRef, 5s safety timeout, wrangler deploy

---

### 2026-04-08 10:15 — Claude Code fix BUG 1-6
**Ai ghi:** Claude Code
**Fixes:** AuthContext refactor, PKCE hardening, orphan cleanup
**Commit:** `b72e5ec`
