package spring.api.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.authservice.domain.PasswordResetToken;
import spring.api.authservice.domain.User;
import spring.api.authservice.repository.PasswordResetTokenRepository;
import spring.api.authservice.repository.UserRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final PasswordEncoder passwordEncoder;

    private static final int TOKEN_EXPIRY_MINUTES = 15;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Tạo và gửi mã OTP reset password
     */
    @Transactional
    public void requestPasswordReset(String email, String ipAddress) {
        // Kiểm tra rate limit
        if (rateLimitService.isBlocked(email)) {
            long minutesRemaining = rateLimitService.getBlockedMinutesRemaining(email);
            throw new RuntimeException(
                String.format("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau %d phút.", minutesRemaining)
            );
        }

        // Kiểm tra rate limit và tăng số lần thử
        if (!rateLimitService.checkAndIncrementAttempts(email, ipAddress)) {
            throw new RuntimeException("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 60 phút.");
        }

        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        // Xóa các token cũ của user này
        tokenRepository.deleteByEmail(email);

        // Tạo mã OTP 6 số
        String token = generateOTP();

        // Lưu token vào database
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getUserId());
        resetToken.setEmail(email);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));
        resetToken.setUsed(false);
        resetToken.setIpAddress(ipAddress);

        tokenRepository.save(resetToken);

        // Gửi email
        emailService.sendPasswordResetEmail(email, token, user.getFullName());

        // Nếu đã thử nhiều lần, gửi cảnh báo
        int remainingAttempts = rateLimitService.getRemainingAttempts(email);
        if (remainingAttempts <= 2 && remainingAttempts > 0) {
            emailService.sendSecurityAlert(email, user.getFullName(), 5 - remainingAttempts);
        }

        log.info("Password reset token generated for email: {}", email);
    }

    /**
     * Xác thực mã OTP
     */
    public boolean verifyResetToken(String email, String token) {
        return tokenRepository.findByEmailAndTokenAndUsedFalse(email, token)
                .map(resetToken -> {
                    if (resetToken.isExpired()) {
                        log.warn("Reset token expired for email: {}", email);
                        return false;
                    }
                    return true;
                })
                .orElse(false);
    }

    /**
     * Reset password với token
     */
    @Transactional
    public void resetPassword(String email, String token, String newPassword) {
        // Tìm token
        PasswordResetToken resetToken = tokenRepository.findByEmailAndTokenAndUsedFalse(email, token)
                .orElseThrow(() -> new RuntimeException("Mã xác nhận không hợp lệ hoặc đã được sử dụng"));

        // Kiểm tra token còn hạn
        if (resetToken.isExpired()) {
            throw new RuntimeException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        // Reset rate limit attempts
        rateLimitService.resetAttempts(email);

        // Gửi email thông báo (nếu có cấu hình)
        try {
            emailService.sendPasswordChangedNotification(email, user.getFullName());
        } catch (Exception e) {
            log.warn("Không thể gửi email thông báo. Mật khẩu đã được đổi thành công.");
        }

        log.info("✅ Password reset successfully for: {}", email);
    }

    /**
     * Tạo mã OTP 6 số
     */
    private String generateOTP() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Dọn dẹp các token đã hết hạn (nên chạy định kỳ)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Expired password reset tokens cleaned up");
    }
}

