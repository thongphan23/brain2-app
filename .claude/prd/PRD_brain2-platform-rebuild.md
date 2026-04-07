# Builder PRD: Brain2 Platform — Full Rebuild

- **Version**: 3.0
- **Created**: 2026-04-07
- **Author**: Antigravity + Thông Phan
- **Builder**: Claude Code via Vertex-Key
- **Status**: Draft → Review
- **Project**: `/Users/rio/brain2-app/`

---

<!-- ═══════════════════════════════════════════════ -->
<!-- TẦNG 1: CONTEXT — Bối cảnh                    -->
<!-- ═══════════════════════════════════════════════ -->

## 1. PROBLEM STATEMENT — Bài Toán

**Vấn đề:** Người dùng không nhớ được những thứ cần nhớ, và không thể đồng nhất tri thức cá nhân với AI. Khi dùng ChatGPT hay bất kỳ LLM nào, AI biết mọi thứ nhưng không biết gì về NGƯỜI DÙNG — dẫn đến output generic, không tối ưu, và không compound (tích lũy) theo thời gian.

**Ai gặp vấn đề này:** Content creators, solopreneurs, coaches Việt Nam — những người tạo ra nhiều tri thức nhưng không có hệ thống lưu trữ + khai thác hiệu quả. Ước tính 50K+ người Việt đang dùng AI hàng ngày nhưng chưa tối ưu.

**Hiện trạng (workaround):** 
- Dùng ChatGPT/Gemini riêng lẻ → mất context mỗi phiên
- Ghi chú rải rác (Notion, Google Docs, sổ tay) → không kết nối, không search được bằng AI
- Một số ít dùng Obsidian nhưng không có AI layer → phải tự tìm thủ công

**Tại sao giải quyết BÂY GIỜ:** AI đã mainstream — ai cũng dùng ChatGPT. Nhưng đây là cơ hội "second mover": không cần xây LLM, chỉ cần xây TẦNG CÁ NHÂN HÓA phía trên. Brain2 đã được dogfooded 6+ tháng bởi anh Thông Phan, chứng minh hiệu quả (viết bài nhanh 3-5x, ra quyết định sắc bén hơn). Thời điểm productize là BÂY GIỜ.

**Context từ Brain2:** [[ai-insight-obsidian-vs-supabase-second-brain]], [[reflection-brain2-he-dieu-hanh-cuoc-song]], [[brain2-platform-product-vision]]

---

## 2. TARGET USERS — Người Dùng Mục Tiêu

### Persona 1: "Minh" — Content Creator / Solopreneur
- **Vai trò**: Tạo nội dung trên Facebook/TikTok, bán khóa học online hoặc coaching
- **Hành vi**: Đọc sách, nghe podcast, ghi chú rời rạc. Dùng ChatGPT hàng ngày nhưng phải paste context mỗi lần. Có 50-200 ghi chú rải rác.
- **Pain point**: "Tôi biết mình đã ghi lại insight đó ở đâu đó, nhưng không tìm được. Và AI không nhớ gì về tôi cả."
- **Kỳ vọng**: Lưu tri thức 1 lần, AI tự tìm và kết nối. Chat AI hiểu context cá nhân. Gợi ý nội dung mới dựa trên vault.

### Persona 2: "Hà" — Professional muốn nâng cấp bản thân
- **Vai trò**: Nhân viên văn phòng 25-35 tuổi, đang đi học thêm, muốn hệ thống hóa kiến thức
- **Hành vi**: Ghi chú trên Notion, nhưng vault lộn xộn. Muốn dùng AI nhưng chưa biết cách tối ưu.
- **Pain point**: "Tôi đọc + học nhiều nhưng không nhớ được gì. Kiến thức không liên kết."
- **Kỳ vọng**: Nhập tri thức → hệ thống tự phân loại + kết nối. Biểu đồ cho thấy năng lực hiện tại → biết học gì tiếp.

### Persona 3: Thông Phan — Admin / Platform Owner
- **Vai trò**: Quản lý platform, verify thanh toán, monitor usage
- **Hành vi**: Xem dashboard admin hàng ngày
- **Pain point**: Cần biết ai đang active, ai churn, chi phí AI bao nhiêu
- **Kỳ vọng**: Admin dashboard tự động, payment auto-verify, usage alerts

---

## 3. GOALS & SUCCESS METRICS — Mục Tiêu & Đo Lường

### Business Goal
Tạo nền tảng SaaS cá nhân hóa tri thức đầu tiên cho thị trường Việt Nam. Thu phí subscription (Pro/VIP) từ người dùng nghiêm túc. Xây dựng cộng đồng 100 users đầu tiên chất lượng cao.

### Success Metrics

| Chỉ số | Loại | Hiện tại | Mục tiêu 30 ngày | Mục tiêu 90 ngày |
|--------|------|----------|-------------------|-------------------|
| Registered users | Primary | 3 | 100 | 300 |
| DAU (Daily Active Users) | Primary | 1 | 15 | 50 |
| Notes tạo / user / tuần | Secondary | N/A | 3 | 7 |
| Retention D7 | Secondary | N/A | 30% | 40% |
| Paid users (Pro + VIP) | Primary | 0 | 10 | 30 |
| Chi phí AI / user / ngày | Guardrail | N/A | < $0.05 | < $0.03 |
| Uptime | Guardrail | N/A | ≥ 99.5% | ≥ 99.5% |

### Definition of Done
- [ ] Tất cả Acceptance Criteria pass
- [ ] Landing page live + convert visitors
- [ ] Auth → Onboarding → Chat → Vault flow hoạt động end-to-end
- [ ] Payment auto-verify working
- [ ] Deploy production trên Cloudflare Pages
- [ ] 10 beta users test thành công

---

<!-- ═══════════════════════════════════════════════ -->
<!-- TẦNG 2: SCOPE — Phạm vi                       -->
<!-- ═══════════════════════════════════════════════ -->

## 4. USER STORIES — Câu Chuyện Người Dùng

```
US-01: Là user mới, tôi muốn đăng ký bằng Google,
       để bắt đầu dùng nhanh nhất có thể.
       Priority: P0

US-02: Là user mới, tôi muốn trải qua onboarding chọn mục tiêu,
       để platform hiểu tôi muốn gì.
       Priority: P0

US-03: Là user, tôi muốn chat tự do với AI (hiểu vault của tôi),
       để hỏi bất kỳ thứ gì và nhận câu trả lời dựa trên tri thức cá nhân.
       Priority: P0

US-04: Là user, tôi muốn dùng mode Reflect để AI dẫn dắt chiêm nghiệm,
       để biến trải nghiệm thành insight có cấu trúc.
       Priority: P0

US-05: Là user, tôi muốn dùng mode Deep Research để phân tích sâu 1 topic,
       để tạo atomic notes chất lượng cao.
       Priority: P0

US-06: Là user, tôi muốn dùng mode Mentoring để có AI cố vấn cá nhân,
       để được hướng dẫn dựa trên hiểu biết về tôi.
       Priority: P0

US-07: Là user, tôi muốn xem + tìm kiếm notes trong vault,
       để dễ dàng truy xuất tri thức đã lưu.
       Priority: P0

US-08: Là user, tôi muốn AI tự đề xuất lưu note khi phát hiện insight,
       để vault phát triển tự nhiên qua conversation.
       Priority: P0

US-09: Là user, tôi muốn import từ Notion workspace,
       để chuyển tri thức hiện có vào platform.
       Priority: P1

US-10: Là user, tôi muốn upload folder Obsidian (.md files),
       để import vault hiện tại.
       Priority: P1

US-11: Là user, tôi muốn nâng cấp lên Pro/VIP bằng chuyển khoản NH,
       để mở khóa tính năng nâng cao.
       Priority: P1

US-12: Là user, tôi muốn xem dashboard với radar chart năng lực tri thức,
       để biết điểm mạnh/yếu và học gì tiếp.
       Priority: P1

US-13: Là user, tôi muốn nhận gợi ý chủ động từ AI,
       để biết nên nghiên cứu/kết nối thêm gì.
       Priority: P1

US-14: Là AI agent bên ngoài, tôi muốn truy cập vault user qua MCP,
       để hiểu context cá nhân khi xử lý task.
       Priority: P2

US-15: Là admin, tôi muốn xem dashboard quản lý users + payments,
       để monitor toàn platform.
       Priority: P2
```

---

## 5. FUNCTIONAL REQUIREMENTS — Yêu Cầu Chức Năng (P0/P1/P2)

### P0 — Must-Have (MVP)

- **FR-01**: **Auth — Google OAuth** đăng nhập/đăng ký. Tạo profile tự động. (US-01)
- **FR-02**: **Onboarding Flow** — Chọn mục tiêu sử dụng (learn, create, grow...), tên hiển thị, sở thích. Welcome bonus 30 messages. (US-02)
- **FR-03**: **Chat AI — Mode Tự Do** (mặc định). User nói gì cũng được. AI tự động RAG từ vault nếu relevant. Streaming response. (US-03)
- **FR-04**: **Chat AI — Mode Reflect**. Hỏi đáp tương tác có dẫn dắt. AI chiêm nghiệm trải nghiệm → rút insight → đề xuất tạo note. (US-04)
- **FR-05**: **Chat AI — Mode Deep Research**. Phân tích sâu concept/topic 5 tầng. Output: atomic notes có cấu trúc. (US-05)
- **FR-06**: **Chat AI — Mode Mentoring**. AI cố vấn cá nhân, hiểu user qua vault, đưa lời khuyên contextual. (US-06)
- **FR-07**: **Vault Management** — List notes, search (keyword + semantic), view detail, edit, delete (soft). (US-07)
- **FR-08**: **Auto Note Creation** — AI phát hiện insight → gợi ý "Lưu vào vault?". User confirm → tạo note + embedding tự động. (US-08)
- **FR-09**: **Conversation Management** — List, pin, archive, delete conversations. (US-03)
- **FR-10**: **Tier System** — Free/Pro/VIP limits enforced. Rate limiting. Usage tracking. (US-11)
- **FR-11**: **Landing Page** — Hero section, features, pricing table, demo/screenshots, CTA đăng ký. (Marketing)

### P1 — Should-Have (v1)

- **FR-12**: **Import Notion** — OAuth connect → chọn pages → parse → tạo notes + embedding. (US-09)
- **FR-13**: **Import Obsidian/Files** — Upload folder hoặc multi-file (.md, .txt, .doc, .docx). Parse → tạo notes + embedding. Giới hạn max files/size per import. (US-10)
- **FR-14**: **Payment — Chuyển khoản VIB** — Hiện thông tin CK (VIB, tên TK, số TK). Mã giao dịch format: `B2-{user_id_prefix_8char}`. Giá: Pro 499,000đ/tháng, VIP 999,000đ/tháng. Hệ thống monitor Gmail VIB → parse email (Subject: "Chuyển tiền nhanh...thành công", field Diễn giải chứa mã B2-xxx) → auto verify → upgrade tier. Fallback: admin manual verify. (US-11)
- **FR-15**: **Knowledge Analytics Dashboard** — Radar chart năng lực tri thức (theo domain). Stats: tổng notes, connections, maturity distribution. (US-12)
- **FR-16**: **Proactive Recommendations** — AI phân tích vault → gợi ý: "Bạn nên học thêm X", "Kết nối note Y với Z", "Review lại note Z". Hiển thị trên dashboard. (US-13)
- **FR-17**: **Cognitive Tools Selection** — User chọn tool/mode khác nhau khi bắt đầu chat. Mỗi tool có system prompt riêng, mục đích riêng. (US-03)

### P2 — Nice-to-Have (v1.x)

- **FR-18**: **Context MCP Server** — MCP server endpoint cho agent bên ngoài truy cập vault user (authed via API key). Semantic search + note retrieval. (US-14)
- **FR-19**: **Admin Dashboard** — User management, payment verification, usage stats, cost monitoring. (US-15)
- **FR-20**: **Knowledge Graph Visualization** — Graph view kết nối giữa notes. Interactive: click node → xem detail. (Future)
- **FR-21**: **Export vault** — Download toàn bộ notes dưới dạng .md files (Obsidian-compatible). (Future)

---

## 6. NON-FUNCTIONAL REQUIREMENTS — Yêu Cầu Phi Chức Năng

| Hạng mục | Yêu cầu cụ thể |
|----------|-----------------|
| **Performance** | Page load < 2s (SPA cached, Cloudflare CDN). Chat first token < 2s. Full response < 15s. Semantic search < 500ms. Bundle size < 1MB. |
| **Security** | Google OAuth only (no password). RLS on ALL user tables. HTTPS enforced. Input sanitization. Rate limiting: 20 msg/ngày (free), 200 (pro), unlimited (vip). |
| **Scalability** | Support 100 concurrent users. Supabase auto-scaling. Edge Functions stateless. pgvector HNSW index cho search < 100ms. |
| **Accessibility** | Keyboard navigation cho chat. Sufficient color contrast (WCAG AA). Screen reader friendly. |
| **Availability** | 99.5% uptime (Supabase + Cloudflare). Graceful degradation khi AI down. |
| **Compatibility** | Chrome/Safari/Firefox/Edge latest 2 versions. PC first (responsive nhưng optimize desktop). |
| **Data** | Soft delete (không hard delete). User có thể export data. Supabase daily backup. |

---

## 7. BOUNDARY — Ranh Giới

### ✅ Trong scope (ĐƯỢC LÀM):
- Full rebuild frontend (Vite + React + TypeScript) từ đầu
- Landing page, Auth, Onboarding, Chat (4 modes), Vault CRUD
- Tier system (free/pro/vip) with enforcement
- Payment via chuyển khoản NH + Gmail auto-verify
- Import: Notion OAuth + File upload (md, txt, doc, docx)
- Knowledge Analytics Dashboard + Radar chart
- Proactive recommendations engine
- 11 cognitive tools (curated từ 14 tools hiện tại — xem Appendix A)

### ❌ Ngoài scope (KHÔNG ĐƯỢC LÀM):
- Mobile native app → defer to v2
- Marketplace cho custom cognitive tools → defer to v2
- Team/B2B collaboration → defer to v2
- Real-time collaboration (multi-user edit) → defer to v2
- Stripe/PayPal payment → chỉ dùng chuyển khoản NH
- Multi-language UI (chỉ tiếng Việt, support tiếng Anh trong chat)

### ⚠️ Constraints (Ràng buộc cứng):
- Supabase project `sauuvyffudkmdbeglspb` — giữ nguyên, schema đã có
- Cloudflare Pages hosting — static SPA, không SSR
- Vertex-key proxy cho AI routing — vertex-key.com
- Embedding dimension: vector(768) — Gemini text-embedding
- Domain: brain2.thongphan.com
- Budget AI: tiered daily cap ($2 free, $20 pro, $50 vip)

---

<!-- ═══════════════════════════════════════════════ -->
<!-- TẦNG 3: BLUEPRINT — Bản thiết kế              -->
<!-- ═══════════════════════════════════════════════ -->

## 8. SYSTEM DESIGN — Kiến Trúc Kỹ Thuật

### Tech Stack
- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Styling**: Vanilla CSS (design system custom, dark mode)
- **Database**: PostgreSQL + pgvector (Supabase)
- **Auth**: Supabase Auth (Google OAuth)
- **Hosting**: Cloudflare Pages (static SPA)
- **AI Backend**: Supabase Edge Functions → Vertex-key proxy → AI Models
- **Storage**: Supabase Storage (avatars, payment proofs)
- **Email parsing**: Gmail API hoặc Supabase Edge Function webhook

### Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                    Cloudflare Pages                   │
│              (Vite + React SPA — Static)              │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│    │  Landing  │ │   Chat   │ │   Vault  │            │
│    │   Page    │ │Interface │ │ Manager  │            │
│    └──────────┘ └──────────┘ └──────────┘            │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│    │Dashboard │ │ Settings │ │  Import  │            │
│    │(Radar)   │ │& Payment │ │(Notion/  │            │
│    │          │ │          │ │ Files)   │            │
│    └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS API calls
┌──────────────────────▼──────────────────────────────┐
│               Supabase (brain2-platform)              │
│  ┌────────────────────────────────────────────┐      │
│  │ Auth (Google OAuth)     │ Storage           │      │
│  ├────────────────────────────────────────────┤      │
│  │ Edge Functions:                             │      │
│  │  • chat (streaming, 4 modes, RAG)          │      │
│  │  • embed (auto-embed new notes)            │      │
│  │  • recommend (proactive suggestions)       │      │
│  │  • notion-connect (OAuth + sync)           │      │
│  │  • payment-webhook (Gmail → verify)        │      │
│  │  • import-files (parse .md/.txt/.docx)     │      │
│  │  • admin-dashboard (stats + management)    │      │
│  │  • analyze-vault (radar chart data)        │      │
│  ├────────────────────────────────────────────┤      │
│  │ Database (3 schemas):                       │      │
│  │  public: profiles, cognitive_tools,         │      │
│  │          conversations, messages            │      │
│  │  brain2: notes (pgvector 768d),             │      │
│  │          connections, knowledge_maps        │      │
│  │  system: usage_daily, tier_config,          │      │
│  │          rate_limits, recommendations,      │      │
│  │          audit_log, payments                │      │
│  └────────────────────────────────────────────┘      │
│                       │                               │
└───────────────────────┼───────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │   Vertex-key      │
              │   Proxy           │
              │   (AI Models)     │
              │  • Gemini Flash   │
              │  • Gemini Pro     │
              │  • Claude Sonnet  │
              │  • GPT-4o/5.2    │
              │  • DeepSeek R1    │
              └───────────────────┘
```

### Data Flow — Chat
```
1. User types message → React state update
2. Component → POST /functions/v1/chat (streaming)
   Body: { message, conversation_id, tool_slug, model }
3. Edge Function:
   a. Auth check (JWT)
   b. Rate limit check (tier_config → usage_daily)
   c. RAG: embed query → semantic search brain2.notes → top 5 context
   d. Build prompt: system_prompt (from cognitive_tools) + context + history + message
   e. Call Vertex-key proxy → stream response
   f. Save message (user + assistant) to messages table
   g. Update usage_daily counters
   h. Detect insights → suggest note creation
4. Frontend: stream tokens → render markdown → scroll
5. Error: toast notification + retry button
```

### Data Model — New/Modified Tables

```sql
-- NEW: Payment tracking
CREATE TABLE system.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  tier_target TEXT NOT NULL CHECK (tier_target IN ('pro', 'vip')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'VND',
  transaction_code TEXT UNIQUE, -- From bank transfer email
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  verified_by TEXT, -- 'auto' or admin user_id
  email_raw TEXT, -- Raw email content for audit
  expires_at TIMESTAMPTZ, -- Subscription expiration
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NEW: Knowledge analytics snapshots
CREATE TABLE system.knowledge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_notes INTEGER DEFAULT 0,
  total_connections INTEGER DEFAULT 0,
  domain_scores JSONB DEFAULT '{}', -- {"psychology": 0.7, "business": 0.4, ...}
  maturity_distribution JSONB DEFAULT '{}', -- {"seed": 10, "growing": 5, "permanent": 2}
  note_type_distribution JSONB DEFAULT '{}', -- {"concept": 15, "insight": 8, ...}
  overall_score FLOAT DEFAULT 0,
  suggested_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- EXISTING tables: giữ nguyên schema hiện tại
-- public.profiles, public.cognitive_tools, public.conversations, public.messages
-- brain2.notes, brain2.connections, brain2.knowledge_maps
-- system.usage_daily, system.tier_config, system.rate_limits, system.recommendations
```

### File Map (Frontend — BUILD LẠI)
```
[NEW]    src/
[NEW]    ├── main.tsx                          — Entry point
[NEW]    ├── App.tsx                           — Router + Auth provider
[NEW]    ├── index.css                         — Design system (CSS variables, base styles)
[NEW]    ├── lib/
[NEW]    │   ├── supabase.ts                   — Supabase client init
[NEW]    │   ├── types.ts                      — TypeScript interfaces
[NEW]    │   ├── constants.ts                  — App constants
[NEW]    │   └── utils.ts                      — Shared utilities
[NEW]    ├── hooks/
[NEW]    │   ├── useAuth.ts                    — Auth state + methods
[NEW]    │   ├── useChat.ts                    — Chat state + streaming
[NEW]    │   ├── useVault.ts                   — Notes CRUD + search
[NEW]    │   ├── useConversations.ts           — Conversation management
[NEW]    │   └── useTier.ts                    — Tier status + limits
[NEW]    ├── components/
[NEW]    │   ├── layout/
[NEW]    │   │   ├── AppLayout.tsx             — Sidebar + main content
[NEW]    │   │   ├── Sidebar.tsx               — Navigation sidebar
[NEW]    │   │   └── Header.tsx                — Top bar
[NEW]    │   ├── chat/
[NEW]    │   │   ├── ChatInterface.tsx         — Main chat area
[NEW]    │   │   ├── MessageBubble.tsx         — Single message render
[NEW]    │   │   ├── ChatInput.tsx             — Input + send
[NEW]    │   │   ├── ModeSelector.tsx          — Free/Reflect/Research/Mentoring
[NEW]    │   │   ├── ModelSelector.tsx          — AI model picker (by tier)
[NEW]    │   │   └── NoteCreateSuggestion.tsx  — "Save to vault?" prompt
[NEW]    │   ├── vault/
[NEW]    │   │   ├── VaultBrowser.tsx          — List + search notes
[NEW]    │   │   ├── NoteCard.tsx              — Note preview card
[NEW]    │   │   ├── NoteDetail.tsx            — Full note view/edit
[NEW]    │   │   └── NoteEditor.tsx            — Markdown editor
[NEW]    │   ├── dashboard/
[NEW]    │   │   ├── KnowledgeDashboard.tsx    — Analytics overview
[NEW]    │   │   ├── RadarChart.tsx            — Radar chart component
[NEW]    │   │   ├── RecommendationCards.tsx   — AI suggestions
[NEW]    │   │   └── UsageStats.tsx            — Usage metrics
[NEW]    │   ├── import/
[NEW]    │   │   ├── ImportManager.tsx         — Import hub
[NEW]    │   │   ├── NotionImport.tsx          — Notion OAuth flow
[NEW]    │   │   └── FileImport.tsx            — Drag-drop file upload
[NEW]    │   ├── payment/
[NEW]    │   │   ├── PricingTable.tsx          — Tier cards
[NEW]    │   │   ├── PaymentFlow.tsx           — Bank transfer flow
[NEW]    │   │   └── PaymentStatus.tsx         — Verification status
[NEW]    │   └── shared/
[NEW]    │       ├── Button.tsx                — Button variants
[NEW]    │       ├── Input.tsx                 — Input + textarea
[NEW]    │       ├── Modal.tsx                 — Modal dialog
[NEW]    │       ├── Toast.tsx                 — Notification toasts
[NEW]    │       ├── Skeleton.tsx              — Loading skeleton
[NEW]    │       └── EmptyState.tsx            — Empty state illustrations
[NEW]    └── pages/
[NEW]        ├── LandingPage.tsx               — Public landing
[NEW]        ├── AuthCallback.tsx              — OAuth callback handler
[NEW]        ├── OnboardingPage.tsx            — Post-signup onboarding
[NEW]        ├── ChatPage.tsx                  — Main chat interface
[NEW]        ├── VaultPage.tsx                 — Vault browser
[NEW]        ├── DashboardPage.tsx             — Knowledge dashboard
[NEW]        ├── ImportPage.tsx                — Import manager
[NEW]        ├── SettingsPage.tsx              — Profile + payment + tier
[NEW]        └── AdminPage.tsx                 — Admin dashboard (P2)
```

### Dependencies

| Dependency | Type | Status | Purpose |
|------------|------|--------|---------|
| Supabase (brain2-platform) | Infrastructure | ✅ Live | Database, Auth, Edge Functions, Storage |
| Vertex-key proxy | External API | ✅ Live | AI model routing (OpenAI-compatible) |
| Cloudflare Pages | Infrastructure | ✅ Live | Frontend hosting + CDN |
| Gmail API | External API | ⏳ Setup needed | Payment email parsing |
| Notion API | External API | ✅ Tested | OAuth + page import |
| React 19 | Library | ✅ Available | Frontend framework |
| Chart.js (hoặc Recharts) | Library | ✅ Available | Radar chart + analytics |

---

## 9. DESIGN SPEC — Chi Tiết Thiết Kế (UI/UX)

### Design Direction
- **Inspiration**: Perplexity AI — clean, focused, modern
- **Theme**: Dark mode mặc định, PC-first
- **Feel**: Premium, tối giản, tập trung vào content
- **Personality**: Intelligent, trustworthy, personal

### Colors
```css
/* Brand — Navy Blue + Gold */
--primary: hsl(220, 70%, 45%);           /* #2563B8 — Navy Blue chính */
--primary-hover: hsl(220, 70%, 55%);     /* Lighter on hover */
--primary-light: hsl(220, 70%, 90%);     /* Background tints */
--accent: hsl(45, 85%, 55%);             /* #D4A537 — Gold accent */
--accent-hover: hsl(45, 85%, 65%);

/* Dark Mode Surfaces */
--bg-primary: hsl(225, 20%, 8%);         /* #111318 — Main background */
--bg-secondary: hsl(225, 18%, 12%);      /* #181B23 — Cards, sidebar */
--bg-tertiary: hsl(225, 16%, 16%);       /* #222630 — Elevated surfaces */
--bg-hover: hsl(225, 16%, 20%);          /* Hover state */

/* Text */
--text-primary: hsl(220, 15%, 92%);      /* #E8EAF0 — Main text */
--text-secondary: hsl(220, 10%, 65%);    /* #9BA0AD — Secondary */
--text-muted: hsl(220, 8%, 45%);         /* #686E7D — Muted */

/* Functional */
--success: hsl(145, 65%, 45%);           /* Green */
--warning: hsl(35, 90%, 55%);            /* Amber */
--error: hsl(0, 70%, 55%);              /* Red */
--info: hsl(200, 80%, 55%);             /* Light blue */

/* Borders & Dividers */
--border: hsl(225, 15%, 18%);            /* Subtle borders */
--border-hover: hsl(225, 15%, 25%);
```

### Typography
- **Font stack**: `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif`
- **Headings**: Inter, 600-700 weight. h1: 32px, h2: 24px, h3: 20px, h4: 16px
- **Body**: Inter, 400 weight, 16px, line-height 1.6
- **Code/Mono**: `'JetBrains Mono', 'SF Mono', monospace`

### Layout
- **Desktop (≥1024px)**: Sidebar (260px, collapsible) + Main content (fluid, max-width 960px for chat)
- **Tablet (768-1023px)**: Sidebar overlay (hamburger toggle)
- **Mobile (< 768px)**: Bottom nav, full-width content. (Support nhưng không optimize)

### Key Screens

1. **Landing Page**: Hero "Bộ Não Thứ 2 — AI Hiểu Bạn" + 3 feature blocks + Pricing table (3 tiers) + CTA button + Footer
2. **Chat Interface**: Sidebar (conversations list) + Main (messages + input) + Mode selector (top) + Model selector. Streaming markdown render.
3. **Vault Browser**: Search bar + Filter chips (type, domain, maturity) + Note cards grid + Click → Detail panel (slide-in hoặc modal)
4. **Knowledge Dashboard**: Radar chart (center) + Stats cards (total notes, connections, maturity) + Recommendation cards (below)
5. **Import Page**: Two cards — Notion (OAuth connect) + Files (drag-drop zone). Progress indicator.
6. **Settings/Payment**: Profile info + Current tier card + Upgrade button → Payment flow (QR/bank info + transaction code)
7. **Onboarding**: 3 steps wizard — Welcome → Goals → First chat prompt

### Animations & Interactions
- Chat messages: fade-in slide-up 300ms ease
- Sidebar: slide-in 200ms ease-out
- Buttons: scale(1.02) + subtle glow on hover, 150ms transition
- Cards: translateY(-2px) + shadow increase on hover
- Page transitions: opacity crossfade 200ms
- Loading: skeleton shimmer animation
- Toast: slide-in from top-right, auto-dismiss 5s
- Radar chart: animated draw-in on mount (1s ease)
- Typing indicator: 3 dots pulse animation

---

## 10. API CONTRACTS — Giao Kèo API

### Edge Function: `/chat` (POST, streaming)
```typescript
// POST /functions/v1/chat
// Auth: Required (Supabase JWT)
// Response: Server-Sent Events (streaming)

interface ChatRequest {
  message: string               // User message, max 4000 chars
  conversation_id?: string      // Existing conv or null for new
  tool_slug: string             // 'brain2-chat' | 'reflect' | 'deep-research' | 'mentoring' | etc.
  model?: string                // Override model, must be in tier's allowed_models
}

// SSE Response stream
// data: {"type": "token", "content": "..."}
// data: {"type": "note_suggestion", "title": "...", "content": "...", "note_type": "concept"}
// data: {"type": "context_used", "notes": [{id, title, similarity}]}
// data: {"type": "done", "usage": {input_tokens, output_tokens, model_used}}
// data: {"type": "error", "message": "..."}
```

### Edge Function: `/embed` (POST)
```typescript
// POST /functions/v1/embed
// Auth: Required
interface EmbedRequest {
  note_id: string     // Note to embed
}
interface EmbedResponse {
  success: boolean
  dimensions: number   // 768
}
```

### Edge Function: `/payment-webhook` (POST)
```typescript
// POST /functions/v1/payment-webhook
// Auth: Service key (internal only)
interface PaymentWebhookRequest {
  transaction_code: string   // From Gmail parse
  amount: number
  sender_name: string
  bank_name: string
  email_raw: string
}
interface PaymentWebhookResponse {
  matched: boolean
  user_id?: string
  tier_activated?: string
}
```

### Edge Function: `/analyze-vault` (POST)
```typescript
// POST /functions/v1/analyze-vault
// Auth: Required
interface AnalyzeVaultResponse {
  domain_scores: Record<string, number>  // {"psychology": 0.7, "business": 0.4}
  total_notes: number
  maturity_distribution: Record<string, number>
  note_type_distribution: Record<string, number>
  overall_score: number
  suggested_topics: string[]
  radar_data: {
    labels: string[]     // Domain names
    values: number[]     // 0-1 scores
  }
}
```

### Edge Function: `/import-files` (POST, multipart)
```typescript
// POST /functions/v1/import-files
// Auth: Required
// Content-Type: multipart/form-data
// Max total size: 50MB
// Accepted extensions: .md, .txt, .doc, .docx

interface ImportResponse {
  total_files: number
  imported: number
  skipped: number
  errors: Array<{filename: string, reason: string}>
  notes_created: string[]  // Note IDs
}
```

---

## 11. PATTERNS & CONVENTIONS — Quy Ước Code

### Code Style
```typescript
// Naming conventions:
// Components: PascalCase — ChatInterface.tsx
// Hooks: camelCase with "use" prefix — useChat.ts
// Utilities: camelCase — formatDate.ts
// Constants: UPPER_SNAKE_CASE — MAX_RETRY_COUNT
// CSS classes: kebab-case — .chat-interface
// Files: PascalCase for components, camelCase for utils
// Database: snake_case — user_profiles
// Edge Functions: kebab-case directories — payment-webhook/
```

### Error Handling Pattern
```typescript
try {
  const data = await supabase.from('notes').select('*')
  if (data.error) throw data.error
  return { success: true, data: data.data }
} catch (error) {
  console.error('[VaultManager] Failed to fetch notes:', error)
  toast.error('Không thể tải notes. Vui lòng thử lại.')
  return { success: false, error }
}
```

### State Management
- React Context cho Auth + Theme
- Custom hooks cho feature-specific state (useChat, useVault)
- Supabase realtime subscriptions cho live updates (messages, notes)
- No external state library (Redux, Zustand) — đủ đơn giản cho Context + hooks

### Testing Conventions
- Vitest cho unit tests
- Testing Library cho component tests
- Test files: `*.test.ts` / `*.test.tsx`
- Coverage target: > 70% cho business logic (hooks, utils)

---

<!-- ═══════════════════════════════════════════════ -->
<!-- TẦNG 4: EXECUTION — Thực thi                  -->
<!-- ═══════════════════════════════════════════════ -->

## 12. TIMELINE & BUILD PHASES — Lộ Trình Thực Thi

| Phase | Deliverables | Effort | Dependencies |
|-------|-------------|--------|-------------|
| **Phase 1: Foundation** | Vite project setup, design system CSS, Supabase client, Auth flow, Router | Medium (2-3 ngày) | None |
| **Phase 2: Core Chat** | Chat interface (4 modes), streaming, RAG, conversation management, mode/model selector | Large (4-5 ngày) | Phase 1 |
| **Phase 3: Vault** | Vault browser, note CRUD, search (keyword + semantic), note editor, auto note creation | Medium (3-4 ngày) | Phase 1 |
| **Phase 4: Onboarding + Landing** | Landing page, onboarding wizard, tier display | Medium (2-3 ngày) | Phase 1 |
| **Phase 5: Import + Payment** | File import, Notion import, payment flow + Gmail webhook | Large (3-4 ngày) | Phase 3 |
| **Phase 6: Dashboard + Analytics** | Knowledge dashboard, radar chart, recommendations, usage stats | Medium (2-3 ngày) | Phase 3 |
| **Phase 7: Polish + Deploy** | Error handling, loading states, animations, responsive fixes, production deploy | Medium (2-3 ngày) | All |

### Build Order
```
1. Setup: Vite + React + TS, package.json, env vars, Supabase client
2. Design System: index.css (colors, typography, layout, components)
3. Auth: useAuth hook, AuthCallback page, protected routes
4. Layout: AppLayout, Sidebar, Header, Router setup
5. Chat: ChatInterface, MessageBubble, ChatInput, streaming hook
6. Chat Modes: ModeSelector, 4 modes, system prompts
7. Vault: VaultBrowser, NoteCard, NoteDetail, NoteEditor
8. Search: keyword + semantic search in vault
9. Auto Notes: NoteCreateSuggestion in chat
10. Landing: LandingPage, hero, features, pricing
11. Onboarding: OnboardingPage, 3-step wizard
12. Import: FileImport (drag-drop), NotionImport (OAuth)
13. Payment: PricingTable, PaymentFlow, payment-webhook Edge Function
14. Dashboard: KnowledgeDashboard, RadarChart, RecommendationCards
15. Polish: animations, error states, loading skeletons, toasts
16. Deploy: Cloudflare Pages, DNS verify, production test
```

---

## 13. RISKS & MITIGATIONS — Rủi Ro & Đối Phó

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | AI cost vượt budget khi nhiều user chat | Medium | High | Tier daily caps enforced. Gemini Flash (rẻ) cho free tier. Usage monitoring alerts. |
| R2 | Payment Gmail parsing lỗi — mã giao dịch sai format | Medium | Medium | Strict transaction code format (B2-{user_id_prefix}). Fallback: admin manual verify. Email raw lưu audit. |
| R3 | User import Obsidian vault quá lớn (1000+ files) | Low | Medium | Limit: 200 files/import, 50MB/import. Queue processing. Progress indicator. |
| R4 | Vertex-key proxy downtime | Low | High | Health check endpoint. Fallback model routing. User-friendly error message. |
| R5 | RLS misconfiguration — data leak | Very Low | Critical | Automated RLS policy tests. Security audit trước launch. Test with 2+ users cross-check. |
| R6 | Full rebuild takes longer than estimated | Medium | Medium | Phase-based delivery — Phase 1-4 = MVP deployable. P1/P2 features defer if needed. |
| R7 | Radar chart data không meaningful với ít notes | Medium | Low | Minimum 10 notes để show radar. Trước đó show "Bạn cần thêm X notes để mở khóa bản đồ tri thức". |

---

## 14. EDGE CASES & OPEN QUESTIONS — Trường Hợp Biên & Câu Hỏi Mở

### Edge Cases

- **EC-1**: User mất kết nối giữa chat streaming → buffer partial response, hiện "Mất kết nối" toast, tự reconnect
- **EC-2**: User paste message > 4000 chars → truncate + warning toast "Giới hạn 4000 ký tự"
- **EC-3**: User hết daily quota giữa conversation → block input + show "Hết lượt hôm nay. Nâng cấp Pro?"
- **EC-4**: Notion OAuth revoked giữa sync → detect 401 → prompt re-authorize
- **EC-5**: User import file .docx chứa chủ yếu hình ảnh, ít text → skip + notify "File X chứa quá ít text"
- **EC-6**: Payment email đến trễ (24h+) → auto-verify vẫn hoạt động khi email arrive. Show "Đang chờ xác nhận" status.
- **EC-7**: 2 users chuyển khoản cùng số tiền cùng lúc → transaction code unique per user phân biệt
- **EC-8**: User xóa tất cả notes → dashboard show empty state "Bắt đầu bằng cách chat với AI"

### Open Questions

1. **[OQ-1]**: ~~TÊN SẢN PHẨM?~~ → ✅ **CHỐT: Brain2** — giữ nguyên tên
2. **[OQ-2]**: ~~GIÁ CHÍNH XÁC?~~ → ✅ **CHỐT: Pro 499,000đ/tháng, VIP 999,000đ/tháng (VNĐ)**
3. **[OQ-3]**: ~~GMAIL PAYMENT~~ → ✅ **CHỐT: Ngân hàng VIB**. Email format đã có mẫu:
   - Subject: "Chuyển tiền nhanh đến tài khoản ngân hàng nội địa thành công"
   - Fields: Số hoá đơn, Trạng thái ("Thành công"), Số tiền, Diễn giải (chứa mã giao dịch user)
   - Parser cần match: Diễn giải chứa mã B2-{user_id_prefix} + Số tiền = 499,000 hoặc 999,000
4. **[OQ-4]**: ~~COGNITIVE TOOLS~~ → ✅ **CHỐT: Chọn lọc lại** — xem đề xuất curation bên dưới
5. **[OQ-5]**: ~~RADAR CHART DOMAINS~~ → ✅ **CHỐT: Auto-detect** từ notes content bằng AI classification

### Appendix A: Cognitive Tools Curation (Chọn lọc)

Từ 14 tools hiện tại → giữ **11 tools**, loại 3 tools bị overlap:

| # | Slug | Tên | Category | Quyết định |
|---|------|-----|----------|------------|
| 1 | `brain2-chat` | Chat Tự Do | core | ✅ GIỮ (mode mặc định) |
| 2 | `reflect` | Chiêm Nghiệm | core | ✅ GIỮ |
| 3 | `deep-research` | Nghiên Cứu Sâu | core | ✅ GIỮ (merge concept-deep + research-assistant vào) |
| 4 | `mentoring` | Cố Vấn Cá Nhân | core | ✅ GIỮ |
| 5 | `reverse-engineer` | Phân Tích Ngược | workshop | ✅ GIỮ (unique) |
| 6 | `hook-analyzer` | Phân Tích Hooks | workshop | ✅ GIỮ (unique) |
| 7 | `goal-tracker` | Theo Dõi Mục Tiêu | productivity | ✅ GIỮ |
| 8 | `prompt-generator` | Tạo Prompt | workshop | ✅ GIỮ (unique) |
| 9 | `viral-analyzer` | Phân Tích Viral | workshop | ✅ GIỮ (unique) |
| 10 | `product-builder` | Tạo Sản Phẩm Số | pro-only | ✅ GIỮ (Pro+ only) |
| 11 | `ebook-architect` | Kiến Trúc Ebook | pro-only | ✅ GIỮ (Pro+ only) |
| ~~12~~ | ~~`concept-deep`~~ | ~~Đào Sâu Concept~~ | ~~learning~~ | ❌ MERGE vào deep-research |
| ~~13~~ | ~~`reflection-guide`~~ | ~~Hướng Dẫn Chiêm Nghiệm~~ | ~~learning~~ | ❌ MERGE vào reflect |
| ~~14~~ | ~~`research-assistant`~~ | ~~Trợ Lý Nghiên Cứu~~ | ~~analysis~~ | ❌ MERGE vào deep-research |

**Lý do merge:**
- `concept-deep` ≈ `deep-research` — cùng mục đích đào sâu 1 concept
- `reflection-guide` ≈ `reflect` — cùng mục đích chiêm nghiệm, chỉ khác prompt
- `research-assistant` ≈ `deep-research` — overlap 80% use case

### Appendix B: VIB Email Payment Format

Dựa trên mẫu email thực tế từ VIB:

```
Subject: Chuyển tiền nhanh đến tài khoản ngân hàng nội địa thành công
Kính gửi: PHAN MINH THÔNG

Số hoá đơn:     6097VNIB02Y9HPMD
Trạng thái:     Thành công
Ngày giao dịch: 09:36 07/04/2026
Từ tài khoản:   002031988
Đến tài khoản:  00000952914 - MAI NHAT BIEN
Tại ngân hàng:  TPBank
Số tiền:        199,000 đ
Phí (VAT):      0 đ
Diễn giải:      DIBIpaZI1na0 DibiVoice subscription Plan Standard Plan
```

**Parser logic:**
1. Match subject chứa "thành công"
2. Extract "Số tiền" → check = 499,000 (Pro) hoặc 999,000 (VIP)
3. Extract "Diễn giải" → find pattern `B2-{8char}` → lookup user_id prefix
4. Nếu match → auto update tier + tạo record trong system.payments
5. Nếu không match → log + alert admin để manual verify

---

## 15. ACCEPTANCE CRITERIA — Tiêu Chí Hoàn Thành

### Functional

- [ ] **AC-01**: User đăng nhập Google OAuth thành công, profile tạo tự động. Verify: click "Đăng nhập" → Google popup → redirect → thấy app.
- [ ] **AC-02**: Onboarding 3 bước hoạt động. Verify: user mới → Goals → Name → First chat. Profile saved.
- [ ] **AC-03**: Chat Mode Tự Do — gửi message, nhận streaming response markdown. Verify: type + send → tokens stream → full message rendered.
- [ ] **AC-04**: Chat RAG — AI tìm và dùng notes liên quan. Verify: tạo note "X" → hỏi về X → response cite note đó.
- [ ] **AC-05**: Chat Modes (Reflect/Research/Mentoring) — chuyển mode, system prompt thay đổi, hành vi AI khác. Verify: switch mode → first message khác biệt.
- [ ] **AC-06**: Vault CRUD — tạo, đọc, sửa, xóa (soft) notes. Verify: each operation thành công + UI update.
- [ ] **AC-07**: Vault search — keyword + semantic. Verify: search "tư duy" → tìm notes chứa "mindset" (semantic match).
- [ ] **AC-08**: Auto Note — AI suggest tạo note khi phát hiện insight. Verify: chat insight → "Lưu vào vault?" prompt → click → note created.
- [ ] **AC-09**: Tier enforcement — free user bị block sau 20 messages. Verify: send 20 msgs → msg 21 blocked + upgrade prompt.
- [ ] **AC-10**: Landing page render đẹp, pricing table, CTA button. Verify: truy cập domain → page hiển thị đúng.

### Functional — P1

- [ ] **AC-11**: Import files (.md, .txt) thành công → notes created + embedded. Verify: upload 5 files → 5 notes xuất hiện.
- [ ] **AC-12**: Import Notion — OAuth connect → chọn pages → import Notes. Verify: connect Notion → pick page → note created.
- [ ] **AC-13**: Payment — hiện thông tin CK + mã giao dịch unique. Verify: click nâng cấp → thấy info chuyển khoản.
- [ ] **AC-14**: Dashboard radar chart hiển thị đúng. Verify: user có >10 notes → radar chart render + domain scores.
- [ ] **AC-15**: Recommendations hiển thị gợi ý. Verify: trigger recommend → cards show trên dashboard.

### Non-Functional

- [ ] **AC-NF-1**: Page load < 2s. Verify: Lighthouse. Expected: Performance > 85.
- [ ] **AC-NF-2**: Chat first token < 2s. Verify: timestamp send → first token. Expected: < 2000ms.
- [ ] **AC-NF-3**: RLS works — User A không thấy notes User B. Verify: login user A → query notes → chỉ thấy notes mình.
- [ ] **AC-NF-4**: Rate limiting — free user bị block sau limit. Verify: exceed quota → 429 response.

### Edge Cases

- [ ] **AC-EC-1**: Chat > 4000 chars → truncate + warning. Verify: paste long text → warning toast.
- [ ] **AC-EC-2**: Import file > 50MB → reject + message. Verify: upload large file → error displayed.
- [ ] **AC-EC-3**: Offline mid-chat → reconnect + partial message preserved.

---

## 16. EXECUTION LOG — Nhật Ký Thực Thi

> Section này do Antigravity + Claude Code điền SAU KHI chạy.

| Lần | Ngày | Builder | Kết quả | AC Pass | Ghi chú |
|-----|------|---------|---------|---------|---------|
| 1   |      |         |         |         |         |

### Issues Found → PRD Improvements
- (Chưa có)

### Lessons Learned
- (Chưa có)
