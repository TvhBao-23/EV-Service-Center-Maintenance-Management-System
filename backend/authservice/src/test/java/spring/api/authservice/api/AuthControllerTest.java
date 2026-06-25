package spring.api.authservice.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import spring.api.authservice.api.dto.RegisterRequest;
import spring.api.authservice.api.dto.ResetPasswordRequest;
import spring.api.authservice.api.dto.LoginRequest;
import spring.api.authservice.api.dto.ForgotPasswordRequest;
import spring.api.authservice.api.dto.AuthResponse;
import spring.api.authservice.service.AuthService;
import spring.api.authservice.service.PasswordResetService;
import spring.api.authservice.service.JwtService;
import spring.api.authservice.repository.UserRepository;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(spring.api.authservice.config.SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private PasswordResetService passwordResetService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    // =========================================================================
    // WHITE-BOX / BVA REGISTER TESTS (REG-01 to REG-10)
    // =========================================================================

    /**
     * REG-01: Đăng ký thành công với Password đúng biên dưới (8 ký tự)
     */
    @Test
    void testRegister_REG01_Password8Chars_Created() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "12345678", // 8 chars
                "Hoài Bảo",
                null,
                null
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(new AuthResponse("mocked-jwt-token"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công!"));
    }

    /**
     * REG-02: Đăng ký thành công với Password đúng biên trên (16 ký tự)
     */
    @Test
    void testRegister_REG02_Password16Chars_Created() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "1234567890123456", // 16 chars
                "Hoài Bảo",
                null,
                null
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(new AuthResponse("mocked-jwt-token"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công!"));
    }

    /**
     * REG-03: Thất bại do mật khẩu ngắn hơn biên dưới (7 ký tự)
     */
    @Test
    void testRegister_REG03_Password7Chars_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "1234567", // 7 chars
                "Hoài Bảo",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-04: Thất bại do mật khẩu dài hơn biên trên (17 ký tự)
     */
    @Test
    void testRegister_REG04_Password17Chars_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "12345678901234567", // 17 chars
                "Hoài Bảo",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-05: Thất bại do email sai định dạng (thiếu @ và tên miền)
     */
    @Test
    void testRegister_REG05_EmailInvalid_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "invalid-email",
                "12345678",
                "Hoài Bảo",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-06: Thất bại do email để trống (chuỗi rỗng)
     */
    @Test
    void testRegister_REG06_EmailEmpty_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "",
                "12345678",
                "Hoài Bảo",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-07: Thất bại do email là null
     */
    @Test
    void testRegister_REG07_EmailNull_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                null,
                "12345678",
                "Hoài Bảo",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-08: Thất bại do họ tên để trống (chuỗi rỗng)
     */
    @Test
    void testRegister_REG08_FullNameEmpty_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "12345678",
                "",
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-09: Thất bại do họ tên là null
     */
    @Test
    void testRegister_REG09_FullNameNull_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "12345678",
                null,
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * REG-10: Thất bại do trùng lặp tài khoản (email đã được sử dụng)
     */
    @Test
    void testRegister_REG10_DuplicateEmail_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "12345678",
                "Hoài Bảo",
                null,
                null
        );

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email đã được sử dụng"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email đã được sử dụng"));
    }

    // =========================================================================
    // BOUNDARY VALUE ANALYSIS (BVA) - OTP LENGTH (EXACTLY 6 DIGITS)
    // =========================================================================

    /**
     * Case B8: min- (5 digits - Invalid)
     */
    @Test
    void testResetPassword_B8_Otp5Digits_BadRequest() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "bao.test@example.com",
                "12345", // 5 digits
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Case B9: boundary (6 digits - Valid)
     */
    @Test
    void testResetPassword_B9_Otp6Digits_Ok() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "bao.test@example.com",
                "123456", // 6 digits (correct boundary)
                "newpassword123"
        );

        doNothing().when(passwordResetService).resetPassword(any(String.class), any(String.class), any(String.class));

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    /**
     * Case B10: max+ (7 digits - Invalid)
     */
    @Test
    void testResetPassword_B10_Otp7Digits_BadRequest() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "bao.test@example.com",
                "1234567", // 7 digits
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Case X11: Contains letters (Invalid format)
     */
    @Test
    void testResetPassword_X11_OtpContainsLetters_BadRequest() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "bao.test@example.com",
                "12345A", // Letters instead of digits
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // GENERAL AUTHENTICATION TESTS
    // =========================================================================

    @Test
    void testRegister_EmptyFullName_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao@example.com",
                "password123",
                "", // Empty full name
                null,
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // WHITE-BOX / BVA LOGIN TESTS (LOG-01 to LOG-06)
    // =========================================================================

    /**
     * LOG-01: Đăng nhập thành công bằng Email hợp lệ
     */
    @Test
    void testLogin_LOG01_SuccessEmail_Ok() throws Exception {
        LoginRequest request = new LoginRequest(
                "bao.hoai@example.com",
                "password123"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(new AuthResponse("mocked-jwt-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }

    /**
     * LOG-02: Đăng nhập thành công bằng Username alias
     */
    @Test
    void testLogin_LOG02_SuccessUsernameAlias_Ok() throws Exception {
        String requestJson = "{\"username\":\"bao.hoai@example.com\",\"password\":\"password123\"}";

        when(authService.login(any(LoginRequest.class))).thenReturn(new AuthResponse("mocked-jwt-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked-jwt-token"));
    }

    /**
     * LOG-03: Đăng nhập thất bại do sai mật khẩu (HTTP 401 Unauthorized)
     */
    @Test
    void testLogin_LOG03_WrongPassword_Unauthorized() throws Exception {
        LoginRequest request = new LoginRequest(
                "bao.hoai@example.com",
                "wrong-password"
        );

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Email hoặc mật khẩu không đúng"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Email hoặc mật khẩu không đúng"));
    }

    /**
     * LOG-04: Đăng nhập thất bại do tài khoản không tồn tại (HTTP 401 Unauthorized)
     */
    @Test
    void testLogin_LOG04_UserNotFound_Unauthorized() throws Exception {
        LoginRequest request = new LoginRequest(
                "notfound@example.com",
                "password123"
        );

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Không tìm thấy người dùng"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Không tìm thấy người dùng"));
    }

    /**
     * LOG-05: Đăng nhập thất bại do trường Email bị trống (HTTP 400 Bad Request)
     */
    @Test
    void testLogin_LOG05_EmailEmpty_BadRequest() throws Exception {
        LoginRequest request = new LoginRequest(
                "",
                "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * LOG-06: Đăng nhập thất bại do trường Mật khẩu bị trống (HTTP 400 Bad Request)
     */
    @Test
    void testLogin_LOG06_PasswordEmpty_BadRequest() throws Exception {
        LoginRequest request = new LoginRequest(
                "bao.hoai@example.com",
                ""
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // WHITE-BOX / BVA FORGOT PASSWORD TESTS (FGT-01 to FGT-02)
    // =========================================================================

    /**
     * FGT-01: Gửi yêu cầu OTP thành công
     */
    @Test
    void testForgotPassword_FGT01_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest(
                "bao.hoai@example.com"
        );

        doNothing().when(passwordResetService).requestPasswordReset(any(String.class), any(String.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."));
    }

    /**
     * FGT-02: Gửi yêu cầu OTP lỗi do email không tồn tại trong hệ thống
     */
    @Test
    void testForgotPassword_FGT02_EmailNotFound() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest(
                "notfound@example.com"
        );

        doThrow(new RuntimeException("Email không tồn tại trong hệ thống"))
                .when(passwordResetService).requestPasswordReset(any(String.class), any(String.class));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Email không tồn tại trong hệ thống"));
    }
}
