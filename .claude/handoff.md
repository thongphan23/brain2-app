# 📋 Sổ Bàn Giao v4.3 — Brain2 Platform: Advanced Dashboard & Offline UX

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc KỸ trước khi làm.
> ⏱️ **60-Minute Rule:** Tổng các tasks bên dưới PHẢI đủ dày đặc để CC chạy ≥60 phút.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-09
**Phiên bản:** v4.3 — Advanced Dashboard & Offline UX ✅ HOÀN THÀNH
**Tình trạng chung:** 🟢 ỔN ĐỊNH. Dashboard Recharts, Offline UX, & Glassmorphism đã xong trong v4.3.

### Kết quả các phiên trước:
- ✅ PWA đã setup thành công (manifest, precache assets).
- ✅ A11y Audit đạt chuẩn. Chat Retry flow trơn tru.
- 🔴 Github Actions (CI/CD) ĐANG CHỜ anh Rio config 2 Tokens: `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`. (Edge Function v29 chưa deploy được tự động).

---

## ⚡ TASK HIỆN TẠI

> ⏱️ **60-Minute Rule:** CC thực thi TOÀN BỘ từ đầu đến cuối, KHÔNG hỏi xác nhận giữa chừng. Chạy liên tục từ Task 1 đến Task 3.

### 🔲 Task 1: Nâng cấp Data Visualization (Dashboard)
**Ước lượng:** ~20 phút
**Mô tả:** Màn hình User Dashboard hiện tại đơn điệu. Cần sử dụng thư viện biểu đồ (ví dụ `recharts`) để vẽ UI biểu đồ đẹp mắt thể hiện Token Usage & Cost Analytics.

**Build Order:**
1. **SETUP**: Chạy lệnh cài đặt thư viện biểu đồ: `npm install recharts`. Cài đặt định nghĩa Typescript type nếu cần.
2. **IMPLEMENT-1 (Data Preparation)**: Mở component hiển thị Dashboard (ví dụ `src/pages/DashboardPage.tsx` hoặc tương tự). Lấy data từ API Supabase `usage_daily` table để map thành format mảng Data: `[{ day: "Mon", tokens: 1200 }, ...]`.
3. **IMPLEMENT-2 (UI Component)**: Thêm 1 biểu đồ `AreaChart` hoặc `LineChart` từ Recharts, bo góc, màu sắc Dark Mode đồng nhất (xanh/gold).
4. **IMPLEMENT-3 (Card Metrics)**: Cải tiến các Metric Cards (Tổng token, Số tiền, Giới hạn hằng ngày) thêm tính năng animate loading skeleton đẹp hơn.
5. **VERIFY**: Chạy `npm run build` xem biểu đồ build có lỗi không.

---

### 🔲 Task 2: Offline Resilience (UX)
**Ước lượng:** ~25 phút
**Mô tả:** PWA đã cài, giờ cần ứng dụng Offline Mode một phần. Nếu rớt mạng, App sẽ hiển thị cảnh báo offline tinh tế vả disable input thay vì để app Crash khi Call API.

**Build Order:**
1. **IMPLEMENT-1 (Online Hook)**: Tạo hook `src/hooks/useNetworkState.ts` theo dõi sự kiện mạng `window.addEventListener('offline', ...)` và `online`.
2. **IMPLEMENT-2 (Chat UI offline block)**: Trong `ChatInterface.tsx`, nếu mạng bị Offline: hiển thị "⚠️ Đã mất kết nối. Chat sẽ tiếp tục khi có mạng." và `disabled` nút Send.
3. **IMPLEMENT-3 (Toast Notification)**: Dùng Toast hiện thông báo "Vừa khôi phục kết nối mạng" khi App chuyển từ offline về online.
4. **TEST**: Simulate offline mode trên network, check behavior.
5. **VERIFY**: Không có warning `eslint` hay TS error.

---

### 🔲 Task 3: Brand DNA & Glassmorphism Polish
**Ước lượng:** ~15 phút
**Mô tả:** Làm sắc nét UI Landing Page & Sidebar bằng Glassmorphism và tối ưu hóa CSS transition.

**Build Order:**
1. **IMPLEMENT-1**: Check `src/index.css` hoặc các file module CSS. Bổ sung các class tái sử dụng UX như `.glass-panel` với backdrop-blur và outline nhạt tinh tế.
2. **IMPLEMENT-2**: Đưa class `.glass-panel` này áp dụng vào Conversation Sidebar và Navbar của Dashboard. Đảm bảo UI mượt khi cuộn.
3. **VERIFY**: Chạy `npm run build && tsc -b`. 
4. **GIT**: Gom nhóm lại và Push commit với nội dung `"feat: upgraded user dashboard, offline UX & glassmorphism polishing"`.

**Acceptance Criteria (phải verify bằng lệnh cụ thể):**
- [ ] AC-1: Cài đặt và build `recharts` thành công → verify bằng `npm run build`.
- [ ] AC-2: Có hook `useNetworkState.ts` và có tác dụng trên Chat.
- [ ] AC-3: Classes `.glass-panel` có hiệu lực.
- [ ] AC-4: Toàn bộ build tsc không báo lỗi type.

**Ghi chú từ Antigravity:**
- **Không ngắt quãng**: Làm trọn vẹn 60 phút, nếu gặp lỗi Recharts, mạnh dạn đổi library (ví dụ: `chart.js` hoặc dùng CSS tự vẽ nếu Recharts hỏng).
- Sau khi code xong, anh Rio có Github Actions đang treo nên CC chưa cần deploy phần Edge Function mà chỉ cần tập trung Frontend rồi Commit.

---

## 📝 KẾT QUẢ PHIÊN

<!-- Claude Code: ghi kết quả ở ĐẦU mục này, MỖI PHIÊN MỘT ENTRY -->
<!-- Format: ### YYYY-MM-DD HH:MM — [Tóm tắt] -->
<!-- BẮT BUỘC ghi: Status, files đã sửa, AC đạt, issues còn lại -->

### 2026-04-09 HH:MM — v4.3: Dashboard + Offline UX + Glassmorphism
**Ai ghi:** Claude Code
**Status:** ✅ Hoàn thành
**Đã làm:**
- **TokenUsageChart.tsx** (new): Recharts AreaChart, dual Y-axis (messages + USD cost), 7-day window, fills from `usage_daily` table. Gradient fills: blue (#3B82F6) + gold (#D4A537). Custom tooltip in dark mode.
- **KnowledgeDashboard.tsx**: wired TokenUsageChart into `dashboard-sidebar` section with `.dashboard-usage-chart` wrapper.
- **StatsCards.tsx**: replaced static `<Skeleton>` with animated shimmer pulse (`.stats-card-skeleton`) — no more unused import.
- **useNetworkState.ts** (new): `window.addEventListener('offline'/'online')` → returns `isOffline`. Ref-based reconnect Toast in ChatInterface.
- **ChatInterface.tsx**: added `disabled={isOffline}` to ChatInput, added `.chat-offline-banner` alert, reconnect Toast via `useEffect`.
- **index.css**: Added `.glass-panel` system (backdrop-blur 16px, saturation, subtle borders), `.sidebar` + `.app-header` glass overrides, `.chat-offline-banner` (warning style), `.dashboard-usage-chart` container, `@keyframes skeleton-shimmer`.
- **Bug fix**: `react-is` missing peer dep → `npm install react-is --legacy-peer-deps`.
**Acceptance Criteria đạt:**
- [x] AC-1: recharts build thành công ✅ (DashboardPage: 347 kB bundle)
- [x] AC-2: `useNetworkState.ts` tồn tại + tác dụng trên Chat ✅
- [x] AC-3: `.glass-panel` có hiệu lực (Sidebar, Header glass override) ✅
- [x] AC-4: `tsc -b && vite build` không lỗi ✅
**Ghi chú cho Antigravity:** `npm run build` → 0 lỗi. Commit `2b643b9` pushed lên `brain2-origin/main`. Github Actions CI/CD vẫn đang chờ Tokens (SUPABASE_ACCESS_TOKEN, CLOUDFLARE_API_TOKEN). Frontend deploy thủ công qua `npx wrangler pages deploy`.
