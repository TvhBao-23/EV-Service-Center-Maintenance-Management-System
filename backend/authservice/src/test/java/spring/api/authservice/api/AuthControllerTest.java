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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(spring.api.authservice.config.SecurityConfig.class)
public class AuthControllerTest {

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
    public void testRegister_REG01_Password8Chars_Created() throws Exception {
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
    public void testRegister_REG02_Password16Chars_Created() throws Exception {
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
    public void testRegister_REG03_Password7Chars_BadRequest() throws Exception {
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
    public void testRegister_REG04_Password17Chars_BadRequest() throws Exception {
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
    public void testRegister_REG05_EmailInvalid_BadRequest() throws Exception {
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
    public void testRegister_REG06_EmailEmpty_BadRequest() throws Exception {
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
    public void testRegister_REG07_EmailNull_BadRequest() throws Exception {
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
    public void testRegister_REG08_FullNameEmpty_BadRequest() throws Exception {
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
    public void testRegister_REG09_FullNameNull_BadRequest() throws Exception {
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
    public void testRegister_REG10_DuplicateEmail_BadRequest() throws Exception {
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
    public void testResetPassword_B8_Otp5Digits_BadRequest() throws Exception {
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
    public void testResetPassword_B9_Otp6Digits_Ok() throws Exception {
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
    public void testResetPassword_B10_Otp7Digits_BadRequest() throws Exception {
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
    public void testResetPassword_X11_OtpContainsLetters_BadRequest() throws Exception {
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
    public void testRegister_EmptyFullName_BadRequest() throws Exception {
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

    @Test
    public void testLogin_ValidRequest_Success() throws Exception {
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

    @Test
    public void testForgotPassword_ValidRequest_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest(
                "bao.hoai@example.com"
        );

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
