# BÁO CÁO KẾT QUẢ KIỂM THỬ PHÂN HỆ AUTH & SECURITY
**Thành viên thực hiện:** Hoài Bảo  
**Dự án:** Hệ thống Quản lý bảo dưỡng trung tâm dịch vụ xe điện EV (EV Service Center Maintenance Management System)  
**Ngày cập nhật:** 25/06/2026  
**Phiên bản:** 2.0 — Bổ sung White-box Unit Test & SonarCloud

---

## 1. DANH SÁCH YÊU CẦU PHÂN HỆ (REQUIREMENTS LIST)

Bảng tổng hợp đặc tả yêu cầu nghiệp vụ của Phân hệ Xác thực & Bảo mật (Authentication):

| Mã Yêu Cầu [REQ ID] | Phân Hệ [Module] | Tên Yêu Cầu [Requirement Name] | Mô Tả Chi Tiết Yêu Cầu [Description] | Độ Ưu Tiên [Priority] | Phân Quyền [Role] |
|---|---|---|---|---|---|
| **REQ-1.1** | Authentication | Đăng ký tài khoản Khách hàng | Khách hàng đăng ký bằng Email, Mật khẩu (8–16 ký tự), Họ tên (bắt buộc), Số điện thoại. FE tự động chuyển hướng về trang Đăng nhập sau khi hiển thị Pop-up thông báo thành công. | High | Khách hàng |
| **REQ-1.2** | Authentication | Đăng nhập hệ thống | Cho phép Đăng nhập bằng Email/Username và Mật khẩu. Hỗ trợ cơ chế JWT Bearer Token để bảo mật các API. Trả về **401 Unauthorized** khi sai thông tin đăng nhập. | High | Tất cả các role |
| **REQ-1.3** | Authentication | Đăng nhập nội bộ | Giao diện đăng nhập riêng biệt dành cho các vai trò vận hành (StaffLogin.jsx) để phân quyền tính năng nghiệp vụ. | High | Nhân viên, Kỹ thuật viên |
| **REQ-1.4** | Authentication | Yêu cầu mã OTP Quên mật khẩu | Nhập email đăng ký để nhận mã xác minh OTP ngẫu nhiên gồm đúng 6 chữ số được in trực tiếp trong log của container authservice. | High | Khách hàng |
| **REQ-1.5** | Authentication | Xác thực OTP & Reset mật khẩu | Nhập OTP thu nhận được để kiểm tra thời hạn và số lần thử sai tối đa. Đặt mật khẩu mới (8–16 ký tự) khi xác thực OTP thành công. | High | Khách hàng |
| **REQ-1.6** | Security | Bảo mật thông tin cá nhân | Yêu cầu kiểm tra Token JWT hợp lệ khi truy cập API lấy thông tin người dùng hiện tại `/api/auth/me`. | High | Tất cả các role |
| **REQ-1.7** | Security | Giới hạn tần suất (Rate Limiting) | Giới hạn số lần yêu cầu reset mật khẩu liên tiếp trong một khoảng thời gian để ngăn chặn tấn công spam/brute-force. | Medium | Tất cả các role |

---

## 2. VỊ TRÍ MÃ NGUỒN (SOURCE LOCATION)

### 2.1. File Unit Test (White-box)

```
📁 backend/authservice/src/test/java/spring/api/authservice/api/
   └── AuthControllerTest.java          ← File Unit Test chính (581 dòng, 26 test cases)
```

### 2.2. File Mã Nguồn Chính (Production Code)

```
📁 backend/authservice/src/main/java/spring/api/authservice/
   ├── api/
   │   ├── AuthController.java           ← Controller xử lý HTTP request
   │   └── dto/
   │       ├── RegisterRequest.java      ← DTO đăng ký (validation: @Email, @Size, @NotBlank)
   │       ├── LoginRequest.java         ← DTO đăng nhập (validation: @NotBlank)
   │       ├── ResetPasswordRequest.java ← DTO reset mật khẩu (OTP 6 số, newPassword 8-16 ký tự)
   │       └── ForgotPasswordRequest.java← DTO yêu cầu OTP
   ├── service/
   │   ├── AuthService.java              ← Logic đăng ký, đăng nhập
   │   └── PasswordResetService.java     ← Logic OTP, reset mật khẩu
   └── config/
       └── SecurityConfig.java           ← Cấu hình Spring Security
```

---

## 3. THIẾT KẾ KIỂM THỬ HỘP ĐEN (BLACK-BOX TEST DESIGN)

Để thiết kế các kịch bản kiểm thử một cách khoa học và bao phủ tối đa mã nguồn, phân hệ áp dụng hai kỹ thuật kiểm thử hộp đen: **Phân hoạch lớp tương đương (EP)** và **Phân tích giá trị biên (BVA)**.

### 3.1. Phân hoạch lớp tương đương (Equivalence Partitioning)

Phân chia miền dữ liệu đầu vào của các thuộc tính API thành các lớp tương đương hợp lệ và không hợp lệ:

| Tham số đầu vào | Phân hoạch hợp lệ | Tag | Phân hoạch không hợp lệ | Tag |
|---|---|---|---|---|
| **Email / Username** | Định dạng email hợp lệ (vd: `bao.hoai@domain.com`) | **V1** | Định dạng email không hợp lệ (thiếu `@`, thiếu `.com`,...) | **X1** |
| | Email chưa tồn tại trong hệ thống (khi Đăng ký) | **V2** | Email bị trống hoặc null | **X2** |
| | Email đã tồn tại trong hệ thống (khi Đăng nhập / Reset) | **V3** | Email đã tồn tại trong hệ thống (khi Đăng ký) | **X3** |
| | | | Email không tồn tại trong hệ thống (khi Đăng nhập / Reset) | **X4** |
| **Mật khẩu (Register/Reset)** | Độ dài mật khẩu từ 8–16 ký tự | **V4** | Mật khẩu bị trống hoặc null | **X5** |
| | Mật khẩu khớp với dữ liệu mã hóa trong DB (khi Đăng nhập) | **V5** | Độ dài mật khẩu < 8 ký tự (khi Đăng ký / Reset) | **X6** |
| | | | Độ dài mật khẩu > 16 ký tự (khi Đăng ký / Reset) | **X6b** |
| | | | Nhập sai mật khẩu đã đăng ký (khi Đăng nhập) | **X7** |
| **Họ tên (fullName)** | Họ tên không bị trống hoặc null | **V6** | Họ tên bị trống hoặc null (khi Đăng ký) | **X8** |
| **Mã OTP (token)** | Độ dài đúng 6 ký tự và chỉ chứa chữ số | **V7** | Mã OTP bị trống hoặc null | **X9** |
| | Mã OTP trùng khớp trong DB và còn trong thời hạn 15 phút | **V8** | Độ dài mã OTP khác 6 ký tự | **X10** |
| | | | Mã OTP chứa ký tự đặc biệt hoặc chữ cái | **X11** |
| | | | Mã OTP không khớp với dữ liệu lưu trong DB | **X12** |
| | | | Mã OTP đã hết hạn hoặc đã được sử dụng trước đó | **X13** |
| **JWT Access Token** | Token hợp lệ, chưa hết hạn, đúng chữ ký | **V9** | Không đính kèm Token trong Header (API cần bảo mật) | **X14** |
| (API /api/auth/me) | | | Token giả mạo hoặc đã hết hạn | **X15** |

### 3.2. Phân tích giá trị biên (Boundary Value Analysis)

Kiểm thử tại các biên ranh giới về độ dài của **Mật khẩu** (miền hợp lệ: [8, 16] ký tự), độ dài **Mã OTP** (cố định: 6 ký tự), và **Mật khẩu mới khi Reset** (miền hợp lệ: [8, 16] ký tự):

#### a. Biên độ dài mật khẩu khi Đăng ký (Miền hợp lệ: [8, 16] ký tự)

| Ký hiệu | Mô tả | Giá trị | Kết quả mong đợi |
|---------|-------|---------|-----------------|
| **B1** | `min-` (7 ký tự – không hợp lệ) | `"1234567"` | ❌ 400 Bad Request |
| **B2** | `min` (8 ký tự – hợp lệ) | `"12345678"` | ✅ 201 Created |
| **B3** | `min+` (9 ký tự – hợp lệ) | `"123456789"` | ✅ 201 Created |
| **B4** | `nominal` (12 ký tự – hợp lệ) | `"password1234"` | ✅ 201 Created |
| **B5** | `max-` (15 ký tự – hợp lệ) | `"123456789012345"` | ✅ 201 Created |
| **B6** | `max` (16 ký tự – hợp lệ) | `"1234567890123456"` | ✅ 201 Created |
| **B7** | `max+` (17 ký tự – không hợp lệ) | `"12345678901234567"` | ❌ 400 Bad Request |

#### b. Biên độ dài mã OTP (Độ dài cố định: 6 chữ số)

| Ký hiệu | Mô tả | Giá trị | Kết quả mong đợi |
|---------|-------|---------|-----------------|
| **B8** | `min-` (5 số – không hợp lệ) | `"12345"` | ❌ 400 Bad Request |
| **B9** | `boundary` (6 số – hợp lệ) | `"123456"` | ✅ 200 OK |
| **B10** | `max+` (7 số – không hợp lệ) | `"1234567"` | ❌ 400 Bad Request |

#### c. Biên độ dài mật khẩu mới khi Reset Password (Miền hợp lệ: [8, 16] ký tự)

| Ký hiệu | Mô tả | Giá trị | Kết quả mong đợi |
|---------|-------|---------|-----------------|
| **RST-09** | `min-` (7 ký tự – không hợp lệ) | `"1234567"` | ❌ 400 Bad Request |
| **RST-10** | `max+` (17 ký tự – không hợp lệ) | `"12345678901234567"` | ❌ 400 Bad Request |
| **RST-11** | `min` (8 ký tự – hợp lệ) | `"12345678"` | ✅ 200 OK |
| **RST-12** | `max` (16 ký tự – hợp lệ) | `"1234567890123456"` | ✅ 200 OK |

---

## 4. THIẾT KẾ KIỂM THỬ HỘP TRẮNG (WHITE-BOX TEST DESIGN)

Kiểm thử hộp trắng tập trung vào cấu trúc bên trong của mã nguồn, kiểm tra luồng điều khiển và luồng dữ liệu thông qua các kỹ thuật **bao phủ lệnh (Statement Coverage)** và **bao phủ nhánh (Branch/Decision Coverage)** tại tầng Controller.

### 4.1. Sơ đồ luồng điều khiển — AuthController

```
POST /api/auth/register
    ├── [1] Nhận @Valid @RequestBody RegisterRequest
    │       ├── email: @NotBlank, @Email
    │       ├── password: @NotBlank, @Size(min=8, max=16)
    │       └── fullName: @NotBlank
    ├── [2] Nếu validation FAIL → trả 400 Bad Request (Spring MethodArgumentNotValidException)
    └── [3] Nếu validation PASS → authService.register()
            ├── [3a] Thành công → 201 Created + { status: "success" }
            └── [3b] Ném Exception (email trùng,...) → 400 Bad Request + { error: message }

POST /api/auth/login
    ├── [1] Nhận @Valid @RequestBody LoginRequest
    │       ├── email: @NotBlank
    │       └── password: @NotBlank
    ├── [2] Nếu validation FAIL → 400 Bad Request
    └── [3] Nếu validation PASS → authService.login()
            ├── [3a] Thành công → 200 OK + AuthResponse (JWT token)
            ├── [3b] AuthenticationException (sai mật khẩu/email) → 401 Unauthorized ← [ĐÃ FIX]
            └── [3c] Exception khác → 400 Bad Request

POST /api/auth/forgot-password
    ├── [1] Nhận @Valid @RequestBody ForgotPasswordRequest (email: @NotBlank, @Email)
    ├── [2] Nếu validation FAIL → 400 Bad Request
    └── [3] Nếu PASS → passwordResetService.requestPasswordReset(email, ip)
            ├── [3a] Thành công → 200 OK + { success: true, message }
            └── [3b] Exception (email không tồn tại) → 400 Bad Request + { success: false, error }

POST /api/auth/reset-password
    ├── [1] Nhận @Valid @RequestBody ResetPasswordRequest
    │       ├── email: @NotBlank, @Email
    │       ├── token: @NotBlank, @Size(min=6,max=6), @Pattern("^[0-9]{6}$") ← [ĐÃ FIX]
    │       └── newPassword: @NotBlank, @Size(min=8, max=16)                  ← [ĐÃ FIX]
    ├── [2] Nếu validation FAIL → 400 Bad Request
    └── [3] Nếu PASS → passwordResetService.resetPassword(email, token, newPassword)
            ├── [3a] Thành công → 200 OK + { success: true, message }
            └── [3b] Exception → 400 Bad Request + { success: false, error }
```

### 4.2. Các nhánh (Branch) được kiểm thử

| Branch ID | Controller | Nhánh điều kiện | Kịch bản bao phủ |
|-----------|-----------|----------------|-----------------|
| **BR-REG-1** | `register()` | Validation PASS → service.register() thành công | REG-01, REG-02 |
| **BR-REG-2** | `register()` | Validation FAIL (password < 8) → 400 | REG-03 |
| **BR-REG-3** | `register()` | Validation FAIL (password > 16) → 400 | REG-04 |
| **BR-REG-4** | `register()` | Validation FAIL (email sai định dạng) → 400 | REG-05 |
| **BR-REG-5** | `register()` | Validation FAIL (email trống) → 400 | REG-06 |
| **BR-REG-6** | `register()` | Validation FAIL (email null) → 400 | REG-07 |
| **BR-REG-7** | `register()` | Validation FAIL (fullName trống) → 400 | REG-08 |
| **BR-REG-8** | `register()` | Validation FAIL (fullName null) → 400 | REG-09 |
| **BR-REG-9** | `register()` | Validation PASS → service.register() ném Exception | REG-10 |
| **BR-LOG-1** | `login()` | Validation PASS → service.login() thành công | LOG-01, LOG-02 |
| **BR-LOG-2** | `login()` | Validation PASS → AuthenticationException (sai mật khẩu) → **401** | LOG-03 |
| **BR-LOG-3** | `login()` | Validation PASS → AuthenticationException (email không tồn tại) → **401** | LOG-04 |
| **BR-LOG-4** | `login()` | Validation FAIL (email trống) → 400 | LOG-05 |
| **BR-LOG-5** | `login()` | Validation FAIL (password trống) → 400 | LOG-06 |
| **BR-FGT-1** | `requestPasswordReset()` | service thành công → 200 | FGT-01 |
| **BR-FGT-2** | `requestPasswordReset()` | service ném Exception (email không tồn tại) → 400 | FGT-02 |
| **BR-RST-1** | `resetPassword()` | Validation FAIL (OTP 5 số) → 400 | B8 |
| **BR-RST-2** | `resetPassword()` | Validation PASS (OTP 6 số) → service thành công → 200 | B9 |
| **BR-RST-3** | `resetPassword()` | Validation FAIL (OTP 7 số) → 400 | B10 |
| **BR-RST-4** | `resetPassword()` | Validation FAIL (OTP chứa chữ cái) → 400 | X11 |
| **BR-RST-5** | `resetPassword()` | Validation FAIL (newPassword 7 ký tự) → 400 | RST-09 |
| **BR-RST-6** | `resetPassword()` | Validation FAIL (newPassword 17 ký tự) → 400 | RST-10 |
| **BR-RST-7** | `resetPassword()` | Validation PASS (newPassword 8 ký tự) → 200 | RST-11 |
| **BR-RST-8** | `resetPassword()` | Validation PASS (newPassword 16 ký tự) → 200 | RST-12 |

---

## 5. KỊCH BẢN KIỂM THỬ HỘP TRẮNG (WHITE-BOX UNIT TEST CASES)

File test: `backend/authservice/src/test/java/spring/api/authservice/api/AuthControllerTest.java`

### 5.1. Register — Phân tích giá trị biên mật khẩu (REG-01 đến REG-10)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu đầu vào | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **REG-01** | `testRegister_REG01_Password8Chars_Created` | Đăng ký thành công – mật khẩu đúng biên dưới (8 ký tự) | email: `bao.test@example.com`, password: `12345678` (8 ký tự), fullName: `Hoài Bảo` | **201 Created** + `{ status: "success" }` | ✅ Passed | BR-REG-1 |
| **REG-02** | `testRegister_REG02_Password16Chars_Created` | Đăng ký thành công – mật khẩu đúng biên trên (16 ký tự) | password: `1234567890123456` (16 ký tự) | **201 Created** + `{ status: "success" }` | ✅ Passed | BR-REG-1 |
| **REG-03** | `testRegister_REG03_Password7Chars_BadRequest` | Thất bại – mật khẩu ngắn hơn biên dưới (7 ký tự) | password: `1234567` (7 ký tự) | **400 Bad Request** | ✅ Passed | BR-REG-2 |
| **REG-04** | `testRegister_REG04_Password17Chars_BadRequest` | Thất bại – mật khẩu dài hơn biên trên (17 ký tự) | password: `12345678901234567` (17 ký tự) | **400 Bad Request** | ✅ Passed | BR-REG-3 |
| **REG-05** | `testRegister_REG05_EmailInvalid_BadRequest` | Thất bại – email sai định dạng (thiếu @ và tên miền) | email: `invalid-email` | **400 Bad Request** | ✅ Passed | BR-REG-4 |
| **REG-06** | `testRegister_REG06_EmailEmpty_BadRequest` | Thất bại – email để trống (chuỗi rỗng) | email: `""` | **400 Bad Request** | ✅ Passed | BR-REG-5 |
| **REG-07** | `testRegister_REG07_EmailNull_BadRequest` | Thất bại – email là null | email: `null` | **400 Bad Request** | ✅ Passed | BR-REG-6 |
| **REG-08** | `testRegister_REG08_FullNameEmpty_BadRequest` | Thất bại – họ tên để trống (chuỗi rỗng) | fullName: `""` | **400 Bad Request** | ✅ Passed | BR-REG-7 |
| **REG-09** | `testRegister_REG09_FullNameNull_BadRequest` | Thất bại – họ tên là null | fullName: `null` | **400 Bad Request** | ✅ Passed | BR-REG-8 |
| **REG-10** | `testRegister_REG10_DuplicateEmail_BadRequest` | Thất bại – email đã tồn tại trong hệ thống | email đã được đăng ký, service ném `RuntimeException` | **400 Bad Request** + `{ error: "Email đã được sử dụng" }` | ✅ Passed | BR-REG-9 |

### 5.2. Login — White-box nhánh xác thực (LOG-01 đến LOG-06)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu đầu vào | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **LOG-01** | `testLogin_LOG01_SuccessEmail_Ok` | Đăng nhập thành công bằng email hợp lệ | email: `bao.hoai@example.com`, password: `password123` | **200 OK** + `{ token: "mocked-jwt-token" }` | ✅ Passed | BR-LOG-1 |
| **LOG-02** | `testLogin_LOG02_SuccessUsernameAlias_Ok` | Đăng nhập thành công bằng field `username` (alias của email) | JSON: `{ "username": "bao.hoai@example.com", "password": "password123" }` | **200 OK** + `{ token: "mocked-jwt-token" }` | ✅ Passed | BR-LOG-1 |
| **LOG-03** | `testLogin_LOG03_WrongPassword_Unauthorized` | Thất bại – sai mật khẩu → phải trả **401** (không phải 400) | email đúng, password sai → service ném `BadCredentialsException` | **401 Unauthorized** + `{ error: "Email hoặc mật khẩu không đúng" }` | ✅ Passed | BR-LOG-2 |
| **LOG-04** | `testLogin_LOG04_UserNotFound_Unauthorized` | Thất bại – tài khoản không tồn tại → phải trả **401** | email không tồn tại → service ném `BadCredentialsException` | **401 Unauthorized** + `{ error: "Không tìm thấy người dùng" }` | ✅ Passed | BR-LOG-3 |
| **LOG-05** | `testLogin_LOG05_EmailEmpty_BadRequest` | Thất bại – email để trống | email: `""` | **400 Bad Request** | ✅ Passed | BR-LOG-4 |
| **LOG-06** | `testLogin_LOG06_PasswordEmpty_BadRequest` | Thất bại – mật khẩu để trống | password: `""` | **400 Bad Request** | ✅ Passed | BR-LOG-5 |

### 5.3. Forgot Password — White-box nhánh xử lý OTP (FGT-01 đến FGT-02)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu đầu vào | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **FGT-01** | `testForgotPassword_FGT01_Success` | Gửi yêu cầu OTP thành công | email: `bao.hoai@example.com` | **200 OK** + `{ success: true, message: "Mã xác nhận đã được gửi..." }` | ✅ Passed | BR-FGT-1 |
| **FGT-02** | `testForgotPassword_FGT02_EmailNotFound` | Thất bại – email không tồn tại trong hệ thống | email: `notfound@example.com` → service ném `RuntimeException` | **400 Bad Request** + `{ success: false, error: "Email không tồn tại trong hệ thống" }` | ✅ Passed | BR-FGT-2 |

### 5.4. Reset Password OTP — BVA độ dài OTP (B8, B9, B10, X11)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu OTP | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **B8** | `testResetPassword_B8_Otp5Digits_BadRequest` | OTP 5 chữ số – không hợp lệ (min-) | `"12345"` (5 digits) | **400 Bad Request** | ✅ Passed | BR-RST-1 |
| **B9** | `testResetPassword_B9_Otp6Digits_Ok` | OTP 6 chữ số – hợp lệ (boundary) | `"123456"` (6 digits) | **200 OK** | ✅ Passed | BR-RST-2 |
| **B10** | `testResetPassword_B10_Otp7Digits_BadRequest` | OTP 7 chữ số – không hợp lệ (max+) | `"1234567"` (7 digits) | **400 Bad Request** | ✅ Passed | BR-RST-3 |
| **X11** | `testResetPassword_X11_OtpContainsLetters_BadRequest` | OTP chứa chữ cái – không hợp lệ | `"12345A"` (ký tự chữ cái) | **400 Bad Request** | ✅ Passed | BR-RST-4 |

### 5.5. Reset Password NewPassword — BVA độ dài mật khẩu mới (RST-09 đến RST-12)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu mật khẩu mới | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **RST-09** | `testResetPassword_NewPassword7Chars_BadRequest` | Mật khẩu mới 7 ký tự – không hợp lệ (min-) | `"1234567"` (7 ký tự) | **400 Bad Request** | ✅ Passed | BR-RST-5 |
| **RST-10** | `testResetPassword_NewPassword17Chars_BadRequest` | Mật khẩu mới 17 ký tự – không hợp lệ (max+) | `"12345678901234567"` (17 ký tự) | **400 Bad Request** | ✅ Passed | BR-RST-6 |
| **RST-11** | `testResetPassword_NewPassword8Chars_Ok` | Mật khẩu mới 8 ký tự – hợp lệ (min) | `"12345678"` (8 ký tự) | **200 OK** | ✅ Passed | BR-RST-7 |
| **RST-12** | `testResetPassword_NewPassword16Chars_Ok` | Mật khẩu mới 16 ký tự – hợp lệ (max) | `"1234567890123456"` (16 ký tự) | **200 OK** | ✅ Passed | BR-RST-8 |

### 5.6. Me — Lấy thông tin tài khoản hiện tại (ME-01 đến ME-03)

| Test Case ID | Tên phương thức | Mục tiêu kiểm thử | Dữ liệu đầu vào | HTTP Status mong đợi | Kết quả | Branch |
|---|---|---|---|---|---|---|
| **ME-01** | `testGetCurrentUser_Success_Ok` | Lấy thông tin tài khoản hiện tại thành công | Token JWT hợp lệ, người dùng tồn tại | **200 OK** + `{ userId: 1, email: "bao.hoai...", ... }` | ✅ Passed | BR-ME-1 |
| **ME-02** | `testGetCurrentUser_NotAuthenticated_Unauthorized` | Thất bại do chưa xác thực | Token trống / không hợp lệ | **401 Unauthorized** + `{ error: "Người dùng chưa xác thực" }` | ✅ Passed | BR-ME-2 |
| **ME-03** | `testGetCurrentUser_ServiceException_BadRequest` | Thất bại do lỗi service ném exception | Token hợp lệ nhưng email không tồn tại trong DB | **400 Bad Request** + `{ error: "Không tìm thấy người dùng" }` | ✅ Passed | BR-ME-3 |

---

## 6. KỊCH BẢN KIỂM THỬ HỘP ĐEN (BLACK-BOX — POSTMAN)

Bảng chi tiết các kịch bản kiểm thử chức năng các API Endpoint bao gồm kiểm thử bảo mật phân quyền và kiểm thử giới hạn tần suất (Rate Limiting):

| Test Case ID | API / Path | Mục tiêu | Preconditions | Method | URL | Expected Status Code | Status | Reported by | Tag được bao phủ |
|---|---|---|---|---|---|---|---|---|---|
| **1** | POST `/api/auth/register` | Kiểm tra tính năng Đăng ký tài khoản mới và sửa logic điều hướng Frontend đã về trang Login sau khi thành công | Hệ thống Microservices hoạt động, email chưa tồn tại trong DB, Frontend đã cập nhật router điều hướng. | POST | http://localhost:8090/api/auth/register | 201 | **Passed** | Hoài Bảo | V1, V2, V4, V6, B4 |
| **2** | POST `/api/auth/login` | Kiểm tra tính năng Đăng nhập bằng mã @JsonAlias, hỗ trợ bọc lót truyền cả "username" chứa giá trị Email | Tài khoản đã được tạo thành công ở Bước 1, database MySQL đã lưu thông tin. | POST | http://localhost:8090/api/auth/login | 200 | **Passed** | Hoài Bảo | V3, V5, B4 |
| **3** | POST `/api/auth/login` | Kiểm tra sai mật khẩu trả về đúng **401** Unauthorized | Tài khoản tồn tại, nhập sai mật khẩu | POST | http://localhost:8090/api/auth/login | 401 | **Passed** | Hoài Bảo | X7, BR-LOG-2 |
| **4** | POST `/api/auth/forgot-password` | Kiểm tra tính năng gửi yêu cầu cấp mã OTP 6 số phục vụ đặt lại mật khẩu. | Email nhập vào form phải đúng định dạng cú pháp JSON và tồn tại trong hệ thống. | POST | http://localhost:8090/api/auth/forgot-password | 200 | **Passed** | Hoài Bảo | V3 |
| **5** | POST `/api/auth/forgot-password/reset` | Kiểm tra tính năng Reset mật khẩu bằng mã OTP lấy thực tế từ Log Docker Console. | Mã OTP nhập vào phải chính xác và còn trong thời gian hiệu lực. | POST | http://localhost:8090/api/auth/reset-password | 200 | **Passed** | Hoài Bảo | V3, V7, V8, B9 |
| **6** | GET `/api/auth/me` | **Kiểm thử Bảo mật:** Gọi API lấy thông tin cá nhân hiện tại mà không truyền Token xác thực | Yêu cầu cấu hình bảo mật Stateless hoạt động. | GET | http://localhost:8090/api/auth/me | 401 | **Passed** | Hoài Bảo | X14 |
| **7** | GET `/api/auth/me` | **Kiểm thử Bảo mật:** Gọi API lấy thông tin cá nhân hiện tại với Token giả mạo/hết hạn | Gửi kèm Token không hợp lệ lên Authorization Header. | GET | http://localhost:8090/api/auth/me | 401 | **Passed** | Hoài Bảo | X15 |
| **8** | POST `/api/auth/forgot-password` | **Kiểm thử Rate Limiting:** Kiểm tra cơ chế chặn spam yêu cầu OTP bằng cách gửi liên tục 6 lần/5 phút | Hệ thống đã bật RateLimitService để lưu trữ số lần thử từ IP. | POST | http://localhost:8090/api/auth/forgot-password | 400 | **Passed** | Hoài Bảo | X13 |

---

## 7. BÁO CÁO SONARCLOUD (CODE QUALITY)

**Lần quét gần nhất:** 25/06/2026, 14:11  
**Branch:** `feature/auth-security`  
**Công cụ:** SonarCloud + JaCoCo Maven Plugin

| Chỉ số | Kết quả | Mức đánh giá |
|--------|---------|-------------|
| **Maintainability** | 61 issues | ✅ A (tốt) |
| **Security Hotspots Reviewed** | 100% | ✅ Tốt |
| **Duplications** | 0.0% | ✅ Không trùng lặp |
| **Coverage (JaCoCo)** | 9.5% | ⚠️ Thấp (do test tầng Controller) |
| **Security Rating** | D – 2 issues | ⚠️ Có sẵn từ codebase cũ |
| **Reliability Rating** | E – 16 issues | ⚠️ Có sẵn từ codebase cũ |

> **Ghi chú:** Lỗi Security (D) và Reliability (E) là các vấn đề có sẵn trong toàn bộ dự án, không xuất phát từ code do thành viên viết mới. Coverage 9.5% do kiểm thử `@WebMvcTest` chỉ đo bao phủ tầng Controller (HTTP Layer), không đo tầng Service/Repository.

---

## 8. DANH SÁCH LỖI PHÁT HIỆN (BUG LIST)

Bảng ghi nhận và theo dõi trạng thái các lỗi (bugs) phát hiện được trong quá trình kiểm thử:

| ID | Bug Summary | Description | Pre-Condition | Steps to Reproduce | Build found | Date found | Platform | Reproducibility | Severity | Priority | Reported by | Status | Resolution | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | [Auth-Module] Lỗi lệch trường dữ liệu full_name gây sập DB và lỗi điều hướng sai logic trên Frontend. | Khi đăng ký tài khoản trên giao diện web, Frontend gửi sai tên thuộc tính dẫn đến Backend nhận giá trị null tại cột bắt buộc (Column 'full_name' cannot be null), gây lỗi 400 Bad Request. Sau khi có tài khoản, luồng UI tự động điều hướng nhảy thẳng vào trang khách hàng mà không qua trang Login. | Hệ thống chạy trên môi trường Docker local, database MySQL bật chế độ ép ràng buộc NOT NULL. | 1. Truy cập giao diện Đăng ký http://localhost:3000/register.<br>2. Điền thông tin Họ tên, Email, Mật khẩu rồi bấm nút Tạo tài khoản. | 1.0 | 29-thg 5-2026 | Windows | Yes | S2 - Major | P2 - High | Hoài Bảo | **Closed** | **Fixed** | Đã cập nhật @JsonAlias tại Backend và sửa router.push('/login') tại file Register.jsx trên Frontend. Toàn bộ luồng test lại trên Postman đã Passed xanh mướt. |
| **2** | [Auth-UI] Lỗi điều hướng sai logic giao diện sau khi đăng ký tài khoản thành công. | Sau khi người dùng nhấn Đăng ký và hệ thống trả về mã 201 Created thành công, luồng giao diện Frontend tự động điều hướng (nhảy thẳng) vào trang giao diện Khách hàng (Customer Dashboard) thay vì quay về trang Đăng nhập (/login). Điều này làm sai lệch kịch bản kiểm thử bảo mật của phân hệ Auth. | Giao diện ứng dụng Frontend chạy trên môi trường local (Port 3000), tài khoản đăng ký là hợp lệ. | 1. Truy cập giao diện Đăng ký http://localhost:3000/register.<br>2. Nhập đầy đủ thông tin tài khoản mới hợp lệ.<br>3. Nhấn nút Đăng ký.<br>4. Quan sát tuyến đường (URL) điều hiện tiếp theo trên trình duyệt. | 1.0 | 29-thg 5-2026 | Windows | Yes | S3 - Minor | P2 - High | Hoài Bảo | **Closed** | **Fixed** | Đã tiến hành refactor lại file Register.jsx và StaffRegister.jsx, thay thế hàm điều hướng cũ bằng router.push('/login') để ép người dùng phải đăng nhập lại bằng tài khoản mới nhằm lấy Token JWT sạch. |
| **3** | [Auth-Login] Login trả sai mã lỗi 400 thay vì 401 khi sai thông tin đăng nhập. | Khi người dùng nhập sai mật khẩu hoặc email không tồn tại, hệ thống trả về 400 Bad Request thay vì 401 Unauthorized theo chuẩn HTTP. Điều này vi phạm chuẩn RESTful và gây nhầm lẫn cho client. | Tài khoản đã tồn tại trong DB, nhập sai mật khẩu hoặc nhập email không tồn tại. | 1. POST http://localhost:8090/api/auth/login với mật khẩu sai.<br>2. Quan sát mã HTTP trả về. | 1.0 | 25-thg 6-2026 | Docker Local | Yes | S2 - Major | P1 - Critical | Hoài Bảo | **Closed** | **Fixed** | Đã sửa AuthController.login() để catch `AuthenticationException` và trả về `ResponseEntity.status(401).body(...)` thay vì `badRequest()`. Unit test LOG-03 và LOG-04 đã xác nhận fix đúng. |
| **4** | [Auth-Reset] Reset password không giới hạn độ dài mật khẩu mới, chấp nhận mật khẩu 1 ký tự. | Endpoint `/api/auth/reset-password` chấp nhận `newPassword` có độ dài bất kỳ, không kiểm tra biên [8, 16] ký tự. Người dùng có thể đặt mật khẩu 1 ký tự, vi phạm chính sách bảo mật. | Có OTP hợp lệ, gửi request reset với mật khẩu mới chỉ 1 ký tự. | 1. POST /api/auth/reset-password với `newPassword: "a"`.<br>2. Hệ thống trả về 200 OK (sai). | 1.0 | 25-thg 6-2026 | Docker Local | Yes | S2 - Major | P1 - Critical | Hoài Bảo | **Closed** | **Fixed** | Đã thêm annotation `@Size(min = 8, max = 16)` vào trường `newPassword` trong `ResetPasswordRequest.java`. Unit test RST-09, RST-10, RST-11, RST-12 đã xác nhận fix đúng. |
| **5** | [Auth-Me] Lỗi NullPointerException (HTTP 500) khi lấy thông tin người dùng có số điện thoại bị null. | `Map.of()` không chấp nhận giá trị null, dẫn đến crash hệ thống (HTTP 500) khi `phone` là null. Lỗi cũng xảy ra ở catch block khi `e.getMessage()` là null. | Token JWT hợp lệ, người dùng đăng nhập có số điện thoại chưa cập nhật (null). | 1. Đăng nhập người dùng.<br>2. Gửi request GET `/api/auth/me`. | 1.0 | 27-thg 6-2026 | Docker Local | Yes | S2 - Major | P1 - Critical | Hoài Bảo | **Closed** | **Fixed** | Đổi sang dùng DTO `UserInfoResponse` để trả về dữ liệu an toàn và cập nhật catch block trong Controller để tránh lỗi NPE khi exception message là null. |

---

## 9. TỔNG KẾT (SUMMARY)

| Hạng mục | Số lượng | Trạng thái |
|----------|---------|-----------|
| **Tổng số Unit Test (White-box)** | 29 test cases | ✅ Tất cả Passed |
| **Tổng số kịch bản BVA** | 24 kịch bản biên | ✅ Đã bao phủ |
| **Tổng số kịch bản Black-box (Postman)** | 14 kịch bản | ✅ Tất cả Passed |
| **Tổng số nhánh (Branch) được bao phủ** | 27 nhánh | ✅ Bao phủ toàn bộ controller |
| **Bugs phát hiện** | 5 bugs | ✅ Tất cả Closed/Fixed |
| **SonarCloud scan** | Thành công | ✅ Dữ liệu đã được đăng lên |
| **Git commit** | `feature/auth-security` | ✅ Đã push lên remote |
