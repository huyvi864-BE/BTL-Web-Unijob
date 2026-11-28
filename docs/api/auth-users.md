# Auth API

Phân hệ Auth hỗ trợ hai role: `student` và `employer`.

| API | Request body | Response |
|---|---|---|
| `POST /api/auth/register` | `name`, `email`, `password`, `role` | `{ user }` |
| `POST /api/auth/login` | `email`, `password` | `{ user, accessToken }` |
| `GET /api/users/me` | Không có body; cần token | `{ user }` |

API yêu cầu đăng nhập phải gửi header:

```http
Authorization: Bearer <accessToken>
```

Backend dùng `requireAuth` để xác thực token. Sau middleware, lấy ID tại `req.user.id` và role tại `req.user.role`. Các API dành cho nhà tuyển dụng gắn thêm `authorizeRoles('employer')` sau `requireAuth`.

Frontend dùng chung Axios tại `client/src/api/axiosClient.js` để tự gắn token và xử lý `401`. Token được lưu trong `sessionStorage` với key `unijob.accessToken`.

Các mã lỗi chính:

- `400`: Dữ liệu không hợp lệ.
- `401`: Sai thông tin đăng nhập hoặc token thiếu/sai/hết hạn.
- `403`: Không có quyền truy cập.
- `409`: Email hoặc dữ liệu bị trùng.
- `429`: Vượt giới hạn request.
