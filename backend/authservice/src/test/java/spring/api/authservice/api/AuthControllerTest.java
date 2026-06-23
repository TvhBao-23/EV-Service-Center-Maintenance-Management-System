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

    @Test
    public void testRegister_ValidRequest_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "boa.bao@example.com",
                "password123",
                "Hoài Bảo",
                "0987654321",
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

    @Test
    public void testRegister_PasswordTooShort_BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "boa.bao@example.com",
                "12345", // Too short (5 characters)
                "Hoài Bảo",
                "0987654321",
                null
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegister_PasswordExactBoundary_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "bao.test@example.com",
                "123456", // Min boundary (6 characters)
                "Bảo Test",
                null,
                null
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(new AuthResponse("mocked-jwt-token"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

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
    public void testResetPassword_InvalidOtpFormat_BadRequest() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest(
                "boa.bao@example.com",
                "12345A", // Contains letter 'A'
                "newpassword123"
        );

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testLogin_ValidRequest_Success() throws Exception {
        LoginRequest request = new LoginRequest(
                "boa.bao@example.com",
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
                "boa.bao@example.com"
        );

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
