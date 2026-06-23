# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN HỆ AUTH & SECURITY
**Thành viên thực hiện:** Hoài Bảo  
**Dự án:** Hệ thống Quản lý bảo dưỡng trung tâm dịch vụ xe điện EV (EV Service Center Maintenance Management System)

---

## 1. DANH SÁCH YÊU CẦU PHÂN HỆ (REQUIREMENTS LIST)

Bảng tổng hợp đặc tả yêu cầu nghiệp vụ của Phân hệ Xác thực & Bảo mật (Authentication):

| Mã Yêu Cầu [REQ ID] | Phân Hệ [Module] | Tên Yêu Cầu [Requirement Name] | Mô Tả Chi Tiết Yêu Cầu [Description] | Độ Ưu Tiên [Priority] | Phân Quyền [Role] |
|---|---|---|---|---|---|
| **REQ-1.1** | Authentication | Đăng ký tài khoản Khách hàng | Khách hàng đăng ký bằng Email, Mật khẩu, Họ tên, Số điện thoại. FE tự động chuyển hướng về trang Đăng nhập sau khi hiển thị Pop-up thông báo thành công | High | Khách hàng |
| **REQ-1.2** | Authentication | Đăng nhập hệ thống | Cho phép Đăng nhập bằng Email/Username và Mật khẩu. Hỗ trợ cơ chế JWT Bearer Token để bảo mật các API và chức năng "Ghi nhớ mật khẩu". | High | Tất cả các role |
| **REQ-1.3** | Authentication | Đăng nhập nội bộ | Giao diện đăng nhập riêng biệt dành cho các vai trò vận hành (StaffLogin.jsx) để phân quyền tính năng nghiệp vụ. | High | Nhân viên, Kỹ thuật viên |
| **REQ-1.4** | Authentication | Yêu cầu mã OTP Quên mật khẩu | Nhập email đăng ký để nhận mã xác minh OTP ngẫu nhiên gồm 6 số được in trực tiếp trong log của container authservice. | High | Khách hàng |
| **REQ-1.5** | Authentication | Xác thực OTP & Reset mật khẩu | Nhập OTP thu nhận được để kiểm tra thời hạn và số lần thử sai tối đa. Đặt mật khẩu mới khi xác thực OTP thành công. | High | Khách hàng |
| **REQ-1.6** | Security | Bảo mật thông tin cá nhân | Yêu cầu kiểm tra Token JWT hợp lệ khi truy cập API lấy thông tin người dùng hiện tại `/api/auth/me`. | High | Tất cả các role |
| **REQ-1.7** | Security | Giới hạn tần suất (Rate Limiting) | Giới hạn số lần yêu cầu reset mật khẩu liên tiếp trong một khoảng thời gian để ngăn chặn tấn công spam/brute-force. | Medium | Tất cả các role |

---

## 2. THIẾT KẾ KIỂM THỬ HỘP ĐEN (BLACK-BOX TEST DESIGN)

Để thiết kế các kịch bản kiểm thử một cách khoa học và bao phủ tối đa mã nguồn, phân hệ áp dụng hai kỹ thuật kiểm thử hộp đen: **Phân hoạch lớp tương đương (EP)** và **Phân tích giá trị biên (BVA)**.

### 2.1. Phân hoạch lớp tương đương (Equivalence Partitioning)

Phân chia miền dữ liệu đầu vào của các thuộc tính API thành các lớp tương đương hợp lệ và không hợp lệ:

| Tham số đầu vào | Phân hoạch hợp lệ | Tag | Phân hoạch không hợp lệ | Tag |
|---|---|---|---|---|
| **Email / Username** | Định dạng email hợp lệ (vd: `bao.hoai@domain.com`) | **V1** | Định dạng email không hợp lệ (thiếu `@`, thiếu `.com`,...) | **X1** |
| | Email chưa tồn tại trong hệ thống (khi Đăng ký) | **V2** | Email bị trống hoặc null | **X2** |
| | Email đã tồn tại trong hệ thống (khi Đăng nhập / Reset) | **V3** | Email đã tồn tại trong hệ thống (khi Đăng ký) | **X3** |
| | | | Email không tồn tại trong hệ thống (khi Đăng nhập / Reset) | **X4** |
| **Mật khẩu** | Độ dài mật khẩu >= 6 ký tự | **V4** | Mật khẩu bị trống hoặc null | **X5** |
| | Mật khẩu khớp với dữ liệu mã hóa trong DB (khi Đăng nhập) | **V5** | Độ dài mật khẩu < 6 ký tự (khi Đăng ký / Reset) | **X6** |
| | | | Nhập sai mật khẩu đã đăng ký (khi Đăng nhập) | **X7** |
| **Họ tên (fullName)**| Họ tên không bị trống hoặc null | **V6** | Họ tên bị trống hoặc null (khi Đăng ký) | **X8** |
| **Mã OTP (token)** | Độ dài đúng 6 ký tự và chỉ chứa chữ số | **V7** | Mã OTP bị trống hoặc null | **X9** |
| | Mã OTP trùng khớp trong DB và còn trong thời hạn 15 phút | **V8** | Độ dài mã OTP khác 6 ký tự | **X10** |
| | | | Mã OTP chứa ký tự đặc biệt hoặc chữ cái | **X11** |
| | | | Mã OTP không khớp với dữ liệu lưu trong DB | **X12** |
| | | | Mã OTP đã hết hạn hoặc đã được sử dụng trước đó | **X13** |
| **JWT Access Token** | Token hợp lệ, chưa hết hạn, đúng chữ ký | **V9** | Không đính kèm Token trong Header (API cần bảo mật) | **X14** |
| (API /api/auth/me) | | | Token giả mạo hoặc đã hết hạn | **X15** |

### 2.2. Phân tích giá trị biên (Boundary Value Analysis)

Kiểm thử tại các biên ranh giới về độ dài của chuỗi **Mật khẩu** (miền hợp lệ [6, 255] ký tự) và độ dài **Mã OTP** (độ dài cố định bằng 6 ký tự):

#### a. Biên độ dài mật khẩu (Miền hợp lệ: [6, 255] ký tự)
*   `min-` (5 ký tự - không hợp lệ): **B1**
*   `min` (6 ký tự - hợp lệ): **B2**
*   `min+` (7 ký tự - hợp lệ): **B3**
*   `nominal` (12 ký tự - hợp lệ): **B4**
*   `max-` (254 ký tự - hợp lệ): **B5**
*   `max` (255 ký tự - hợp lệ): **B6**
*   `max+` (256 ký tự - không hợp lệ): **B7**

#### b. Biên độ dài mã OTP (Độ dài cố định: 6 ký tự)
*   `min-` (5 số - không hợp lệ): **B8**
*   `boundary` (6 số - hợp lệ): **B9**
*   `max+` (7 số - không hợp lệ): **B10**

---

## 3. KỊCH BẢN KIỂM THỬ VÀ KẾT QUẢ (TEST CASES & RESULTS)

Bảng chi tiết các kịch bản kiểm thử chức năng các API Endpoint bao gồm kiểm thử bảo mật phân quyền và kiểm thử giới hạn tần suất (Rate Limiting):

| Test Case ID | API / Path | Mục tiêu | Preconditions | Method | URL | Expected Status Code | Status | Reported by | Tag được bao phủ |
|---|---|---|---|---|---|---|---|---|---|
| **1** | POST `/api/auth/register` | Kiểm tra tính năng Đăng ký tài khoản mới và sửa logic điều hướng Frontend đã về trang Login sau khi thành công | Hệ thống Microservices hoạt động, email chưa tồn tại trong DB, Frontend đã cập nhật router điều hướng. | POST | http://localhost:8090/api/auth/register | 201 | **Passed** | Hoài Bảo | V1, V2, V4, V6, B4 |
| **2** | POST `/api/auth/login` | Kiểm tra tính năng Đăng nhập bằng mã @JsonAlias, hỗ trợ bọc lót truyền cả "username" chứa giá trị Email | Tài khoản đã được tạo thành công ở Bước 1, database MySQL đã lưu thông tin. | POST | http://localhost:8090/api/auth/login | 200 | **Passed** | Hoài Bảo | V3, V5, B4 |
| **3** | POST `/api/auth/forgot-password` | Kiểm tra tính năng gửi yêu cầu cấp mã OTP 6 số phục vụ đặt lại mật khẩu. | Email nhập vào form phải đúng định dạng cú pháp JSON (không thừa dấu phẩy ở cuối dòng) và tồn tại trong hệ thống. | POST | http://localhost:8090/api/auth/forgot-password | 200 | **Passed** | Hoài Bảo | V3 |
| **4** | POST `/api/auth/forgot-password/reset` | Kiểm tra tính năng Reset mật khẩu bằng mã OTP lấy thực tế từ Log Docker Console. | Mã OTP nhập vào phải chính xác và còn trong thời gian hiệu lực (phải dẹp lỗi expired). | POST | http://localhost:8090/api/auth/reset-password | 200 | **Passed** | Hoài Bảo | V3, V7, V8, B9 |
| **5** | GET `/api/auth/me` | **Kiểm thử Bảo mật:** Gọi API lấy thông tin cá nhân hiện tại mà không truyền Token xác thực | Yêu cầu cấu hình bảo mật Stateless hoạt động. | GET | http://localhost:8090/api/auth/me | 401 | **Passed** | Hoài Bảo | X14 |
| **6** | GET `/api/auth/me` | **Kiểm thử Bảo mật:** Gọi API lấy thông tin cá nhân hiện tại với Token giả mạo/hết hạn | Gửi kèm Token không hợp lệ lên Authorization Header. | GET | http://localhost:8090/api/auth/me | 401 | **Passed** | Hoài Bảo | X15 |
| **7** | POST `/api/auth/forgot-password` | **Kiểm thử Rate Limiting:** Kiểm tra cơ chế chặn spam yêu cầu OTP bằng cách gửi liên tục 6 lần/5 phút | Hệ thống đã bật RateLimitService để lưu trữ số lần thử từ IP. | POST | http://localhost:8090/api/auth/forgot-password | 400 | **Passed** | Hoài Bảo | X13 |

---

## 4. DANH SÁCH LỖI PHÁT HIỆN (BUG LIST)

Bảng ghi nhận và theo dõi trạng thái các lỗi (bugs) phát hiện được trong quá trình kiểm thử:

| ID | Bug Summary | Description | Pre-Condition | Steps to Reproduce | Build found | Date found | Platform | Reproducibility | Severity | Priority | Reported by | Status | Resolution | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | [Auth-Module] Lỗi lệch trường dữ liệu full_name gây sập DB và lỗi điều hướng sai logic trên Frontend. | Khi đăng ký tài khoản trên giao diện web, Frontend gửi sai tên thuộc tính dẫn đến Backend nhận giá trị null tại cột bắt buộc (Column 'full_name' cannot be null), gây lỗi 400 Bad Request. Sau khi có tài khoản, luồng UI tự động điều hướng nhảy thẳng vào trang khách hàng mà không qua trang Login. | Hệ thống chạy trên môi trường Docker local, database MySQL bật chế độ ép ràng buộc NOT NULL. | 1. Truy cập giao diện Đăng ký http://localhost:3000/register.<br>2. Điền thông tin Họ tên, Email, Mật khẩu rồi bấm nút Tạo tài khoản. | 1.0 | 29-thg 5-2026 | Windows | Yes | S2 - Major | P2 - High | Hoài Bảo | **Closed** | **Fixed** | Đã cập nhật @JsonAlias tại Backend và sửa router.push('/login') tại file Register.jsx trên Frontend. Toàn bộ luồng test lại trên Postman đã Passed xanh mướt. |
| **2** | [Auth-UI] Lỗi điều hướng sai logic giao diện sau khi đăng ký tài khoản thành công. | Sau khi người dùng nhấn Đăng ký và hệ thống trả về mã 201 Created thành công, luồng giao diện Frontend tự động điều hướng (nhảy thẳng) vào trang giao diện Khách hàng (Customer Dashboard) thay vì quay về trang Đăng nhập (/login). Điều này làm sai lệch kịch bản kiểm thử bảo mật của phân hệ Auth. | Giao diện ứng dụng Frontend chạy trên môi trường local (Port 3000), tài khoản đăng ký là hợp lệ. | 1. Truy cập giao diện Đăng ký http://localhost:3000/register.<br>2. Nhập đầy đủ thông tin tài khoản mới hợp lệ.<br>3. Nhấn nút Đăng ký.<br>4. Quan sát tuyến đường (URL) điều hiện tiếp theo trên trình duyệt. | 1.0 | 29-thg 5-2026 | Windows | Yes | S3 - Minor | P2 - High | Hoài Bảo | **Closed** | **Fixed** | Đã tiến hành refactor lại file Register.jsx và StaffRegister.jsx, thay thế hàm điều hướng cũ bằng router.push('/login') để ép người dùng phải đăng nhập lại bằng tài khoản mới nhằm lấy Token JWT sạch. |
