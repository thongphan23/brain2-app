# Brain2 Platform — Claude Code Instructions

> **Mục tiêu**: Xây dựng Brain2 SaaS Platform — nền tảng "Bộ Não Thứ 2" cho cá nhân
> **Tech Stack**: Vite + React 19 + TypeScript + Vanilla CSS + Supabase (pgvector)
> **Working Directory**: `/Users/rio/brain2-app/`

## ⚠️ BẮT BUỘC — ĐỌC TRƯỚC KHI LÀM BẤT CỨ GÌ

### 1. Đọc Sổ Bàn Giao
```
Đọc file: .claude/handoff.md
```
File này chứa:
- **TASK HIỆN TẠI** — task cụ thể được Antigravity giao
- **QUYẾT ĐỊNH ĐÃ CHỐT** — design decisions đã approve, KHÔNG thay đổi
- **KẾT QUẢ PHIÊN** — context từ các phiên trước

**Quy tắc:**
- Nếu có task trong "TASK HIỆN TẠI" → hỏi anh: "Em thấy task [tên] trong sổ bàn giao. Anh muốn em bắt đầu không?"
- Nếu không có task → hỏi anh cần gì
- KHÔNG tự ý thay đổi design decisions đã chốt

### 2. Đọc PRD (Source of Truth)
```
Đọc file: .claude/prd/PRD_brain2-platform-rebuild.md
```
PRD chứa TOÀN BỘ kỹ thuật: System Design, File Map, API Contracts, Acceptance Criteria, Patterns.
Handoff chỉ chứa TRẠNG THÁI PHIÊN — task hiện tại, tiến độ, ghi chú.

### 3. Khi kết thúc session — BẮT BUỘC
```
→ CẬP NHẬT kết quả vào .claude/handoff.md:
  - Thêm entry mới ở ĐẦU mục "KẾT QUẢ PHIÊN"
  - Ghi: Status, files đã thay đổi, test results, đang dở gì
  - Đánh dấu Acceptance Criteria nào đã đạt
  - Ghi chú cho Antigravity nếu cần
```

### 4. Implementation Specs
```
Nếu cần đọc chi tiết kỹ thuật → xem thư mục .claude/spec/
Chỉ đọc khi cần, KHÔNG đọc tất cả từ đầu.
```

---

## PROJECT OVERVIEW

Brain2 Platform — SaaS cho phép người dùng lưu trữ và khai thác tri thức cá nhân (Second Brain) bằng AI.
- Chat AI với 4 modes (Tự do, Reflect, Deep Research, Mentoring) — AI hiểu context vault user
- Vault management — notes CRUD, semantic search, auto note suggestion
- Knowledge Dashboard — radar chart năng lực tri thức + AI recommendations
- Payment tự động qua chuyển khoản VIB → Gmail parse → auto verify
- Import: Obsidian/Files + Notion OAuth

## CRITICAL RULES

1. **Vanilla CSS ONLY** — KHÔNG dùng Tailwind, CSS modules, hoặc CSS-in-JS. Dùng CSS variables từ design system trong `src/index.css`
2. **Dark mode mặc định** — Navy Blue (#2563B8) + Gold (#D4A537). Tham khảo design spec trong PRD Section 9
3. **PC-first** — Desktop ≥1024px là target chính, responsive nhưng không optimize mobile
4. **Supabase project giữ nguyên** — ID: `sauuvyffudkmdbeglspb`. KHÔNG tạo project mới
5. **Vertex-key proxy** — AI routing qua vertex-key.com, OpenAI-compatible format
6. **RLS bắt buộc** — Mọi table phải có Row Level Security. User A không thấy data User B
7. **Font: Inter** — Google Fonts. Code: JetBrains Mono
8. **Streaming chat** — Server-Sent Events, KHÔNG polling

## ENVIRONMENT

### Credentials
```
VITE_SUPABASE_URL=https://sauuvyffudkmdbeglspb.supabase.co
VITE_SUPABASE_ANON_KEY= (lấy từ Supabase dashboard)
VITE_VERTEX_KEY_URL=https://vertex-key.com/v1
```

### Setup
```bash
npm install
npm run dev
```

## CONVENTIONS

- Components: PascalCase → `ChatInterface.tsx`
- Hooks: camelCase + "use" → `useChat.ts`
- CSS classes: kebab-case → `.chat-interface`
- Error handling: try/catch + toast notification (tiếng Việt)
- State: React Context + custom hooks (NO Redux/Zustand)
- Database: snake_case → `user_profiles`

---

*File này load tự động ở đầu mỗi session Claude Code.*
*Sau khi đọc → đọc tiếp `.claude/handoff.md` để nắm task hiện tại.*
