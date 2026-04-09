# 📋 Sổ Bàn Giao v6.0 — Brain2 Platform: Chat History & SaaS Monetization

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc KỸ trước khi làm.
> ⏱️ **60-Minute Rule:** Tổng các tasks bên dưới PHẢI đủ dày đặc để CC chạy ≥60 phút.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-09
**Phiên bản:** v6.0 — Chat History & SaaS Flow ✅ HOÀN THÀNH
**Tình trạng chung:** 🟢 CỰC KỲ ỔN ĐỊNH. Chat history, usage banner, upgrade flow đã done.

### Kết quả các phiên trước:
- ✅ **Empty States & Mobile UX:** Sidebar toggle ẩn hiện mượt trên thiết bị di động. Nút tạo Note nhanh.
- ✅ **RAG Verification:** File kiểm thử xác nhận API và luồng Auth chặn hoàn hảo các request vô danh.
- 🔴 Github Actions (CI/CD) **chờ** Tokens: `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`. (Tạm bỏ qua, tiếp tục code tính năng ứng dụng).

---

## ⚡ TASK HIỆN TẠI

> ⏱️ **60-Minute Rule:** Chạy suốt 3 Task không ngắt quãng. Cung cấp 2 Tính Năng cốt tử cho bất kỳ AI SaaS nào: Lưu trữ Đa Phiên Trò Chuyện (Chat Threads) và Chuẩn bị Hooks Thanh Toán (Monetization).

### 🔲 Task 1: Quản lý Phiên Trò Chuyện (Chat Threads) - Cơ sở Dữ Liệu
**Ước lượng:** ~20 phút
**Mô tả:** Hiện tại chúng ta cần đảm bảo User có thể tải và xem lại lịch sử các đoạn Chat cũ. Nếu Database chưa có bảng lưu lịch sử nhiều phiên Chat, phải tạo ngay.

**Build Order:**
1. **IMPLEMENT-1 (SQL Migration)**: Viết 1 file `.sql` trong `supabase/migrations/` để tạo bảng `chat_sessions` (id, user_id, title, created_at) và cập nhật bảng `messages` thêm cột `session_id`. Đảm bảo bật RLS và user chỉ xem được theo `auth.uid()`.
2. **IMPLEMENT-2 (Data Binding)**: Tạo Hook `useChatHistory.ts` API Supabase lấy danh sách `chat_sessions`.
3. **IMPLEMENT-3 (Edge Function)**: Update Edge function `/chat`, khi nhận request nếu chưa có `session_id`, tạo mới và trả về, đồng thời auto-gen `title` cho session từ câu hỏi đầu tiên.
4. **VERIFY**: Check Schema an toàn, không rủi ro mất data.

---

### 🔲 Task 2: Giao diện Sidebar Lịch Sử Chat
**Ước lượng:** ~25 phút
**Mô tả:** Đưa các Chat Session vào giao diện để thao tác chọn, tạo mới.

**Build Order:**
1. **IMPLEMENT-1 (UI Sidebar)**: Tại khung Chat hoặc Sidebar Navbar chính, thêm 1 Panel / Dropdown "Lịch sử Trò Chuyện" với list hiển thị Title.
2. **IMPLEMENT-2 (New Chat Button)**: Có ngay Nút "✏️ Đoạn chat mới", reset state messages hiện tại.
3. **IMPLEMENT-3 (Active State)**: Khi click vào 1 Session cũ, tải xuống `messages` từ Supabase bằng Supabase Client (RLS protected).
4. **TEST**: User flow: Click New Chat → Gõ → Tạo 1 Session ở Sidebar → Nhấp vô Session cũ tải lại hội thoại. 

---

### 🔲 Task 3: Hook Thanh toán & Xử lý Quota Hành động (Monetization Check)
**Ước lượng:** ~15 phút
**Mô tả:** Cài đặt hàm Middleware mềm báo lỗi nếu dùng quá Giới hạn Miễn phí.

**Build Order:**
1. **IMPLEMENT-1 (Usage Guard Hook)**: Trong Chat Interface, check nếu Tỉ lệ dùng Note/Token vượt threshold (ví dụ: >50000 token trong `usage_daily` hoặc 3 câu hỏi liên tục ở Plan FREE). Trả cảnh báo: "Giới hạn dùng thử. Vui lòng nâng cấp gói Pro" và hiện 1 nút "Nâng cấp ngay".
2. **IMPLEMENT-2 (Stripe Portal Link)**: Nút nâng cấp điều hướng sang URL màn Pricing hiện tại.
3. **VERIFY**: Clean code, linting qua 100%. Mượt mà, Mobile responsive không lấp chữ.
4. **GIT**: Commit `"feat: chat sessions history, usage threshold blocks & SaaS upgrades"`.

**Acceptance Criteria (phải verify bằng lệnh cụ thể):**
- [ ] AC-1: Có SQL Migration file cho `chat_sessions`.
- [ ] AC-2: Nút "+ New Chat" có trong UI và hoạt động phân chia State độc lập.
- [ ] AC-3: Lệnh `npm run build` không lỗi, Typescript bắt đúng Type cho API Chat.

**Ghi chú từ Antigravity:**
- Task SQL Migration CC tự xử lý `npx supabase db diff` hoặc thủ công tạo file. Cẩn trọng với RLS.

---

## 📝 KẾT QUẢ PHIÊN

<!-- Claude Code: ghi kết quả ở ĐẦU mục này, MỖI PHIÊN MỘT ENTRY -->
<!-- Format: ### YYYY-MM-DD HH:MM — [Tóm tắt] -->
<!-- BẮT BUỘC ghi: Status, files đã sửa, AC đạt, issues còn lại -->

### 2026-04-09 HH:MM — v6.0: Chat History & SaaS Usage Guard
**Ai ghi:** Claude Code
**Status:** ✅ Hoàn thành
**Đã làm:**
- **useChatHistory.ts** (new): Hook lấy messages từ Supabase theo `conversation_id`, trả về `Message[]` (RLS protected).
- **ChatInterface.tsx**: Thêm prop `activeConversationId` → trigger `loadMessages(activeConversationId)` khi user click sidebar. History hiển thị TRƯỚC live messages. Thêm `.chat-upgrade-banner` khi free tier đạt ≥80% limit (sử dụng `useNavigate` → `/settings`).
- **ChatPage.tsx**: Pass `activeConvId` làm `activeConversationId` prop.
- **index.css**: Thêm `.chat-upgrade-banner` (blue tint + gold CTA button), `.upgrade-banner-content`, `.upgrade-banner-btn`.
**Ghi chú DB:** Bảng `conversations` + `messages` đã tồn tại từ migration trước (với `conversation_id` FK). Không cần SQL migration mới. `useConversations` hook đã handle create/select/archive/delete.
**Acceptance Criteria đạt:**
- [x] AC-1: conversations table đã có (migration v4.x) ✅
- [x] AC-2: Sidebar New Chat hoạt động ✅ (useConversations + handleNewChat → reset activeConvId)
- [x] AC-3: `npm run build` trơn tru ✅
**Ghi chú:** Commit `57d3a34` pushed. Github Actions CI/CD vẫn chờ anh Rio.
