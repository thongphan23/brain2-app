# 📋 Sổ Bàn Giao v4.4 — Brain2 Platform: Next-Gen Knowledge Vault UX

> File này là kênh giao tiếp 2 chiều giữa Antigravity (PM) và Claude Code (Builder).
> ⚠️ File này là NGUỒN SỰ THẬT DUY NHẤT sau khi /clear — đọc KỸ trước khi làm.
> ⏱️ **60-Minute Rule:** Tổng các tasks bên dưới PHẢI đủ dày đặc để CC chạy ≥60 phút.

---

## 🗺️ TRẠNG THÁI HIỆN TẠI

**Cập nhật lần cuối:** 2026-04-09
**Phiên bản:** v4.4 — Next-Gen Knowledge Vault UX ✅ HOÀN THÀNH
**Tình trạng chung:** 🟢 CỰC KỲ ỔN ĐỊNH. Markdown renderer, ZIP export, Tag filter (v4.4) đã done.

### Kết quả các phiên trước:
- ✅ **Dashboard Visual:** Đã có biểu đồ Token Usage cực xịn qua `recharts`.
- ✅ **Offline Resilience:** Chat interface biết cách tự bảo vệ khi rớt mạng.
- ✅ **Aesthetic:** Giao diện có Backdrop blur kính mờ ở Navbar và Sidebar.
- 🔴 Github Actions (CI/CD) **vẫn chờ** token từ anh Rio (`SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`). CC tạm cứ xử lý Code, chờ anh Rio ghép token CI/CD sẽ tự xanh.

---

## ⚡ TASK HIỆN TẠI

> ⏱️ **60-Minute Rule:** CC thực thi TOÀN BỘ từ đầu đến cuối, KHÔNG hỏi xác nhận giữa chừng. Chạy liên tục từ Task 1 đến Task 3.

### 🔲 Task 1: Rich Markdown Renderer cho Note Vault
**Ước lượng:** ~20 phút
**Mô tả:** Chế độ xem chi tiết của Note (Knowledge Vault) hiện tại đang khá thô. Cần tích hợp Markdown parser xịn xò với Syntax Highlighting.

**Build Order:**
1. **SETUP**: Chạy lệnh cài đặt: `npm install react-markdown rehype-highlight remark-gfm`. Không quên cài các package types nếu sử dụng TypeScript.
2. **IMPLEMENT-1 (View Component)**: Tại màn hình xem chi tiết `Note` (ví dụ `NoteDetail.tsx` hoặc `VaultPage.tsx`), dùng `<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>` để render nội dung.
3. **IMPLEMENT-2 (CSS Cân chỉnh)**: Bổ sung CSS vào file `index.css` cho bảng (table), blockquote và code block để giao diện code không bị nát, giữ tinh thần Dark Mode thanh lịch.
4. **VERIFY**: Load thử 1 Dummy Note có định dạng Bảng, Code block và kiểm tra có vỡ layout không.

---

### 🔲 Task 3: Chế độ Sao Lưu Nhanh (Export to ZIP)
**Ước lượng:** ~25 phút
**Mô tả:** Giúp user có thể bấm nút "Sao lưu" ở mục Settings / Vault để tải toàn bộ Notes hiện có về dạng `.zip`. Tránh rủi ro mất mát dữ liệu và đẩy mạnh độ tin cậy của Platform.

**Build Order:**
1. **SETUP**: Cài đặt thư viện nén: `npm install jszip file-saver`, cộng với các file `@types` tương ứng.
2. **IMPLEMENT-1 (Data FetchHook)**: Viết 1 hàm nhỏ `exportAllNotes()` gọi `supabase.from('notes').select('*')` để lấy mọi content.
3. **IMPLEMENT-2 (Zip Builder)**: Duyệt mảng data, với mỗi Note, tạo 1 file `[title].md` bên trong folder ảo của `JSZip`.
4. **IMPLEMENT-3 (UI Button)**: Tại trang Setting hoặc góc phải màn hình Vault, thêm Nút `Export Vault Archive`. Có trạng thái Loading khi JSZip đang nén. Khi xong dùng `file-saver` kích hoạt tải về.
5. **TEST**: User click xuất file -> Nhận file `.zip` chứa các `.md`.

---

### 🔲 Task 3: Hệ thống Lọc Card cơ bản (Tag Pills)
**Ước lượng:** ~15 phút
**Mô tả:** Hiện tại danh sách Vault Note có thể quá đông dòng. Cần có thanh (filter pills) nhỏ trên đầu để phân loại.

**Build Order:**
1. **IMPLEMENT-1**: UI cho thanh Tags ngang (Scrollable pills) ví dụ: `[All]`, `[Recent]`, `[Long-form]`.
2. **IMPLEMENT-2**: Xử lý logic lọc state (Dựa vào ngày tháng hoặc chiều dài ký tự để gán tag mẫu).
3. **VERIFY**: TypeScript phải vượt qua tsc -b hoàn toàn.
4. **CLEANUP & GIT**: Đẩy commit lên branch chính với nội dung `"feat: markdown renderer, vault zip export & simple UI filters"`.

**Acceptance Criteria (phải verify bằng lệnh cụ thể):**
- [ ] AC-1: `react-markdown` setup thành công → Không lỗi build.
- [ ] AC-2: Nút ZIP Export tải đúng định dạng.
- [ ] AC-3: Lệnh `npm run build` cho ra bundled folder trơn tru.

**Ghi chú từ Antigravity:**
- Nếu file types của JSZip hoặc FileSaver lỗi, có thể dùng kiểu `any` lấp liếm để đẩy nhanh tốc độ nhưng ưu tiên khai báo chuẩn. 
- Sau khi xong, cập nhật kết quả phiên làm việc bên dưới. 

---

## 📝 KẾT QUẢ PHIÊN

<!-- Claude Code: ghi kết quả ở ĐẦU mục này, MỖI PHIÊN MỘT ENTRY -->
<!-- Format: ### YYYY-MM-DD HH:MM — [Tóm tắt] -->
<!-- BẮT BUỘC ghi: Status, files đã sửa, AC đạt, issues còn lại -->

### 2026-04-09 HH:MM — v4.4: Markdown Renderer + ZIP Export + Tag Pills
**Ai ghi:** Claude Code
**Status:** ✅ Hoàn thành
**Đã làm:**
- **NoteDetail.tsx**: Thay `dangerouslySetInnerHTML` bằng `ReactMarkdown` (remarkGfm + Prism syntax highlighting via react-syntax-highlighter vscDarkPlus). Hỗ trợ tables, blockquotes, code blocks, inline code.
- **index.css**: Thêm CSS cho markdown elements — dark-mode tables (striped rows), blockquote với primary border, inline code gold style, headings, lists, HR, links.
- **exportUtils.ts** (new): JSZip + file-saver → `brain2-vault-YYYY-MM-DD.zip`. Mỗi note thành 1 `.md` có YAML frontmatter (title, type, maturity, domain, tags, dates). Sanitize filename.
- **VaultBrowser.tsx**: Thêm nút 💾 Xuất ZIP với loading state + success/error toast. Wire `VaultTagFilter`.
- **VaultTagFilter.tsx** (new): Horizontal scrollable pill bar — Tất cả / Gần đây / Dài / Seed / Growing / Permanent.
- **Tag filter logic**: `recent` (7 ngày), `longform` (>800 chars), `seed/growing/permanent` theo maturity level.
**Acceptance Criteria đạt:**
- [x] AC-1: react-markdown build thành công ✅
- [x] AC-2: Nút ZIP Export tải đúng định dạng ✅ (JSZip + file-saver)
- [x] AC-3: `npm run build` trơn tru ✅
**Ghi chú:** JSZip types cần `@types/file-saver` để import `saveAs`. `Note` type import không cần thiết trong exportUtils → đã bỏ.
