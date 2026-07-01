package spring.api.authservice.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import spring.api.authservice.api.dto.*;
import spring.api.authservice.service.AuthService;
import spring.api.authservice.service.PasswordResetService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // [KCPM-45]: Khử trùng lặp chuỗi ký tự trùng lặp trong AuthController bằng cách khai báo các hằng số dùng chung
    private static final String MESSAGE_KEY = "message";
    private static final String SUCCESS_KEY = "success";
    private static final String ERROR_KEY = "error";

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            // [KCPM-38]: Trả về mã 201 Created để FE điều hướng chính xác về trang /login
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                    .body(Map.of("status", SUCCESS_KEY, MESSAGE_KEY, "Đăng ký tài khoản thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            String message = e.getMessage();
            if (e.getCause() != null && e.getCause().getMessage() != null) {
                message = e.getCause().getMessage();
            }
            if ("Bad credentials".equals(message)) {
                message = "Email hoặc mật khẩu không đúng";
            }
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of(ERROR_KEY, message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ERROR_KEY, e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Object> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            authService.changePassword(email, request);
            return ResponseEntity.ok(Map.of(SUCCESS_KEY, true, MESSAGE_KEY, "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(SUCCESS_KEY, false, ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "authservice"));
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                        .body(Map.of(ERROR_KEY, "Người dùng chưa xác thực"));
            }
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String email = userDetails.getUsername();
            
            // Get user info from service
            return ResponseEntity.ok(authService.getUserInfo(email));
        } catch (Exception e) {
            String errMsg = e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống không xác định";
            return ResponseEntity.badRequest()
                    .body(Map.of(ERROR_KEY, errMsg));
        }
    }
    
    // Forgot password endpoints
    @PostMapping({"/forgot-password", "/forgot-password/request"})
    public ResponseEntity<Object> requestPasswordReset(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        try {
            String ipAddress = getClientIP(httpRequest);
            passwordResetService.requestPasswordReset(request.email(), ipAddress);
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(SUCCESS_KEY, false, ERROR_KEY, e.getMessage()));
        }
    }
    
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<Object> verifyResetToken(@Valid @RequestBody VerifyResetTokenRequest request) {
        try {
            boolean isValid = passwordResetService.verifyResetToken(request.email(), request.token());
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                    SUCCESS_KEY, true,
                    MESSAGE_KEY, "Mã xác nhận hợp lệ"
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of(SUCCESS_KEY, false, ERROR_KEY, "Mã xác nhận không hợp lệ hoặc đã hết hạn"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(SUCCESS_KEY, false, ERROR_KEY, e.getMessage()));
        }
    }
    
    @PostMapping({"/reset-password", "/forgot-password/reset"})
    public ResponseEntity<Object> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.email(), request.token(), request.newPassword());
            return ResponseEntity.ok(Map.of(
                SUCCESS_KEY, true,
                MESSAGE_KEY, "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(SUCCESS_KEY, false, ERROR_KEY, e.getMessage()));
        }
    }

    /**
     * Lấy IP address của client
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}