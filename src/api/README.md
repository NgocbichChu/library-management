# API

- config.ts: base URL và bật/tắt mock.
- client.ts: fetch dùng chung, JSON/FormData, xử lý lỗi HTTP và response rỗng (204).
- auth.ts: các endpoint login, logout, lấy user hiện tại.

Luồng: Form → Store → Service → API → Backend.

## Khi có backend

1. Copy .env.example thành .env.local tại thư mục gốc.
2. Đặt VITE_API_BASE_URL đúng URL backend, VITE_USE_MOCK_API=false, khởi động lại pnpm dev.
3. Sửa đường dẫn và kiểu response trong auth.ts cho khớp backend. Mẫu hiện giả định cookie session và login trả trực tiếp { id, name, email }. Nếu dùng token hoặc response bọc trong data, sửa client/service tương ứng.

Client gửi cookie bằng credentials: include; backend khác origin cần cấu hình CORS cho origin frontend và credentials. Biến VITE_* là cấu hình công khai, không đặt secret ở đây.

Phiên hiện vẫn chỉ giữ trong bộ nhớ. getCurrentUser có sẵn để nối khôi phục phiên sau này.

## Thêm API mới

Tạo file books.ts (hoặc readers.ts, loans.ts) khi đã biết dữ liệu backend:

```ts
import { apiClient } from "@/api/client"

interface Book {
  id: string
  title: string
}
export const getBooks = (signal?: AbortSignal) =>
  apiClient.get<Book[]>("/books", { signal })
```

Bọc lời gọi trong withLoading(() => getBooks()) khi cần loading toàn cục. Client không tự bật loading để tránh đếm hai lần với store hiện tại.

Lỗi HTTP là ApiError (status, data); lỗi mạng vẫn là lỗi fetch. Type generic chỉ hỗ trợ TypeScript, không validate response runtime.
