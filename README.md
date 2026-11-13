# BTL-Web-Unijob — Nền tảng Kết nối Việc làm Bán thời gian & Thực tập cho Sinh viên

**BTL-Web-Unijob** là ứng dụng Web Fullstack được thiết kế theo kiến trúc **Client–Server phân tách (Decoupled Architecture)**, hỗ trợ sinh viên tìm kiếm cơ hội thực tập, việc làm bán thời gian (part-time) và giúp doanh nghiệp quản lý quy trình tuyển dụng trực tuyến.

---

## 1. Kiến trúc Kỹ thuật & Công nghệ (Tech Stack)

- **Môi trường thực thi (Runtime Environment):** **Node.js 24 LTS**
- **Frontend (Single Page Application):** React (khởi tạo qua Vite), React Router (Client-side Routing), Tailwind CSS, Lucide React, React Hook Form & Sonner.
- **Quản lý Trạng thái (State Management) & Giao tiếp API:** React Context API (`AuthContext` quản lý phiên xác thực toàn cục), Zustand (`useJobStore`, `useApplicationStore` quản lý state nghiệp vụ) kết hợp Axios Interceptors.
- **Backend (RESTful API Server):** Node.js & Express.js, kiến trúc phân tầng `Routes -> Validators -> Controllers -> Models`, tích hợp Middleware xử lý lỗi tập trung (`errorMiddleware`).
- **Cơ sở dữ liệu (Database & ODM):** MongoDB Atlas & Mongoose (4 Collections liên kết qua khóa ngoại `ObjectId`).
- **Bảo mật & Triển khai (Security & Cloud Deployment):** Mã hóa mật khẩu một chiều bằng `bcrypt`, xác thực và phân quyền dựa trên vai trò (**RBAC — Role-Based Access Control**) thông qua **JWT (JSON Web Token)**; dự kiến triển khai trên **Vercel** (Frontend) và **Render** (Backend).

---

## 2. Hướng dẫn Khởi chạy Môi trường Cục bộ (Local Development)

Dự án sử dụng **Node.js 24 LTS** và lệnh `npm ci` để đảm bảo cài đặt chính xác phiên bản thư viện từ `package-lock.json` (Deterministic Installation).

Sau khi `git clone` kho mã nguồn về máy, hãy mở **hai cửa sổ Terminal (PowerShell)** tại thư mục gốc của dự án (`BTL-Web-Unijob`) và thực thi độc lập từng khối lệnh sau:

### Terminal 1: Khởi chạy Máy chủ Backend (`server`)

```powershell
Set-Location server
npm.cmd ci
if (-not (Test-Path -LiteralPath '.env')) {
  Copy-Item .env.example .env
}
npm.cmd run dev
```

### Terminal 2: Khởi chạy Giao diện Frontend (`client`)

```powershell
Set-Location client
npm.cmd ci
if (-not (Test-Path -LiteralPath '.env')) {
  Copy-Item .env.example .env
}
npm.cmd run dev
```

---

## 3. Địa chỉ Kiểm tra Hệ thống (Verification Endpoints)

Khi cả hai tiến trình Development Server đang hoạt động, hệ thống có thể được truy cập và kiểm thử tại các địa chỉ sau:

| Thành phần Hệ thống | Địa chỉ Truy cập (URL) | Mô tả Kỹ thuật |
| :--- | :--- | :--- |
| **Ứng dụng Web (Frontend SPA)** | [http://localhost:5173](http://localhost:5173) | Giao diện người dùng React/Vite với 9 định tuyến màn hình (Routes) |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Endpoint giám sát trạng thái vận hành của Express Server và kết nối CSDL |
| **Auth Router** | `http://localhost:5000/api/auth` | Định tuyến xác thực người dùng, cấp phát JWT và kiểm tra phiên (`/me`) |
| **Users & Profiles Router** | `http://localhost:5000/api/users` | Định tuyến quản lý hồ sơ năng lực Sinh viên và thông tin Doanh nghiệp |
| **Jobs Router** | `http://localhost:5000/api/jobs` | Định tuyến CRUD tin tuyển dụng và truy vấn lọc công việc đa điều kiện |
| **Applications Router** | `http://localhost:5000/api/applications` | Định tuyến nộp hồ sơ ứng tuyển, xét duyệt trạng thái và thống kê dữ liệu |

---

## 4. Phân công Nhiệm vụ theo Chức năng Dọc (Fullstack Feature Ownership)

Nhóm áp dụng mô hình phân công theo chiều dọc (**Giao diện UI $\rightarrow$ RESTful API $\rightarrow$ MongoDB Schema**), đảm bảo mỗi thành viên làm chủ trọn vẹn luồng dữ liệu và các thao tác CRUD trên nhánh chức năng của mình:

| Thành viên | Chức năng Phụ trách | Hạng mục Giao diện (Frontend) | Hạng mục Hệ thống & CSDL (Backend & DevOps) |
| :--- | :--- | :--- | :--- |
| **TV1 (Trưởng nhóm)** | **Quản lý Người dùng, Phân quyền & Cấu hình Dự án** | - Kiến trúc Layout dùng chung (`Header`, `Footer`) và cấu hình định tuyến tổng (`App.jsx`)<br>- Xây dựng trang Đăng nhập (`LoginPage`) và Đăng ký (`RegisterPage`)<br>- Thiết lập `AuthContext` và `ProtectedRoute` để kiểm soát truy cập theo vai trò (`student` / `employer`)<br>- Giao diện quản lý Hồ sơ Sinh viên & Doanh nghiệp | - Khởi tạo cấu trúc mã nguồn (Boilerplate), thiết lập quy chuẩn Git/GitHub và biên soạn tài liệu `README.md`<br>- Thiết kế Collection `Users` (kèm `StudentProfiles`), xây dựng REST API `/api/auth` và `/api/users`<br>- **Phần nâng cao:** Tích hợp mã hóa mật khẩu `bcrypt`, xác thực & phân quyền bằng `JWT`, phụ trách triển khai (Deploy) hệ thống lên Vercel và Render |
| **TV2** | **Quản lý Tin tuyển dụng & Tìm kiếm** | - Xây dựng Trang Chủ (`JobListPage`) hiển thị danh sách việc làm dạng thẻ (`JobCard`)<br>- Phát triển Trang Chi tiết việc làm (`JobDetailPage`)<br>- Xây dựng Dashboard Quản lý tin đăng (`EmployerJobDashboard` — Thêm/Sửa/Xóa tin dành cho Nhà tuyển dụng)<br>- Tích hợp thanh công cụ tìm kiếm và bộ lọc việc làm (`JobFilterBar`) kết hợp quản lý state qua Zustand (`useJobStore`) | - Thiết kế Collection `Jobs` liên kết khóa ngoại với Nhà tuyển dụng<br>- Xây dựng tầng kiểm tra tính hợp lệ của dữ liệu đầu vào (`jobValidator`)<br>- Phát triển REST API `/api/jobs` hỗ trợ đầy đủ các phương thức CRUD<br>- Xây dựng thuật toán truy vấn và lọc công việc động theo từ khóa, ngành nghề và địa điểm |
| **TV3** | **Quản lý Ứng tuyển & Thống kê** | - Xây dựng luồng nghiệp vụ nộp hồ sơ ứng tuyển (CV) cho Sinh viên<br>- Phát triển trang "Việc làm đã ứng tuyển" (`StudentApplicationsPage`) giúp Sinh viên theo dõi kết quả và rút đơn<br>- Phát triển trang "Duyệt ứng viên" (`ApplicantReviewPage` — Thêm/Sửa/Xóa trạng thái đơn dành cho Nhà tuyển dụng)<br>- Tích hợp bảng thống kê trực quan (tổng số lượng đơn đã nhận, phân loại theo trạng thái) qua Zustand (`useApplicationStore`) | - Thiết kế Collection `Applications` liên kết giữa Sinh viên (`User`) và Tin tuyển dụng (`Job`)<br>- Phát triển REST API `/api/applications` đáp ứng đầy đủ các thao tác CRUD<br>- Xử lý ràng buộc toàn vẹn nghiệp vụ (Business Logic): Chặn một sinh viên nộp đơn trùng lặp 2 lần cho cùng một công việc<br>- Xây dựng API tổng hợp số liệu thống kê đơn ứng tuyển |

---

## 5. Trạng thái Khởi tạo & Quy chuẩn Môi trường (Current Project Status)

- **Kiến trúc Khung (Scaffold & Routing):** Bản dựng khung hiện tại đã thiết lập hoàn chỉnh **9 trang giao diện mẫu (View Placeholders)** trên Frontend tương ứng với **4 Router API** trên Backend (`/api/auth`, `/api/users`, `/api/jobs`, `/api/applications`).
- **Chuẩn phản hồi Endpoint chờ triển khai:** Các nhánh Router hoặc Controller đang trong quá trình phát triển được cấu hình trả về mã trạng thái chuẩn **HTTP `501 Not Implemented`** để phân biệt rõ với lỗi đường dẫn (`404 Not Found`) hoặc lỗi máy chủ (`500 Internal Server Error`).
- **Cơ chế Giám sát Kết nối CSDL (Health Telemetry):** Ở bước dựng khung, nếu máy cục bộ chưa cấu hình chuỗi kết nối MongoDB Atlas, máy chủ Express vẫn khởi chạy bình thường để phục vụ kiểm thử giao diện và phản hồi trạng thái `database: disconnected` tại endpoint `/api/health`.
- **Cô lập Biến Môi trường (Environment Isolation):** Kho lưu trữ Git chỉ lưu giữ tệp cấu hình mẫu `.env.example` nhằm bảo mật thông tin nhạy cảm. Các thông số thực tế (như `MONGO_URI`, `JWT_SECRET`) được lưu trữ cục bộ trong tệp `.env` trên máy cá nhân của từng thành viên và đã được loại trừ khỏi lịch sử Git thông qua `.gitignore`.