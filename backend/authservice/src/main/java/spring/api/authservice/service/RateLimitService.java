package spring.api.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spring.api.authservice.domain.PasswordResetAttempt;
import spring.api.authservice.repository.PasswordResetAttemptRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final PasswordResetAttemptRepository attemptRepository;

    private static final int MAX_ATTEMPTS = 5; // Tối đa 5 lần thử
    private static final int BLOCK_DURATION_MINUTES = 60; // Block 60 phút
    private static final int RESET_PERIOD_MINUTES = 60; // Reset sau 60 phút

    /**
     * Kiểm tra xem email có bị block không
     */
    // [KCPM-39]: Sửa lỗi không lưu DB do cơ chế transaction self-invocation bằng cách đặt @Transactional trực tiếp trên phương thức gọi
    @Transactional
    public boolean isBlocked(String email) {
        return attemptRepository.findByEmail(email)
                .map(attempt -> {
                    // Nếu đã hết thời gian block, reset trực tiếp trong transaction
                    if (attempt.getBlockedUntil() != null && 
                        LocalDateTime.now(ZoneId.systemDefault()).isAfter(attempt.getBlockedUntil())) {
                        attempt.setAttemptCount(0);
                        attempt.setBlockedUntil(null);
                        attemptRepository.save(attempt);
                        log.info("Reset attempts for email: {}", email);
                        return false;
                    }
                    return attempt.isBlocked();
                })
                .orElse(false);
    }

    /**
     * Kiểm tra và tăng số lần thử
     * @return true nếu được phép thử, false nếu bị block
     */
    @Transactional
    public boolean checkAndIncrementAttempts(String email, String ipAddress) {
        PasswordResetAttempt attempt = attemptRepository.findByEmail(email)
                .orElseGet(() -> {
                    PasswordResetAttempt newAttempt = new PasswordResetAttempt();
                    newAttempt.setEmail(email);
                    newAttempt.setAttemptCount(0);
                    return newAttempt;
                });

        // Kiểm tra xem đã bị block chưa
        if (attempt.isBlocked()) {
            log.warn("Email {} is blocked until {}", email, attempt.getBlockedUntil());
            return false;
        }

        // Reset nếu đã qua thời gian reset
        if (attempt.getLastAttemptAt() != null && 
            attempt.getLastAttemptAt().plusMinutes(RESET_PERIOD_MINUTES).isBefore(LocalDateTime.now(ZoneId.systemDefault()))) {
            attempt.setAttemptCount(0);
        }

        // Tăng số lần thử
        attempt.setEmail(email);
        attempt.setIpAddress(ipAddress);
        attempt.setAttemptCount(attempt.getAttemptCount() + 1);
        attempt.setLastAttemptAt(LocalDateTime.now(ZoneId.systemDefault()));

        // Nếu vượt quá số lần cho phép, block
        if (attempt.getAttemptCount() >= MAX_ATTEMPTS) {
            attempt.setBlockedUntil(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(BLOCK_DURATION_MINUTES));
            log.warn("Email {} has been blocked due to too many attempts", email);
        }

        attemptRepository.save(attempt);

        return attempt.getAttemptCount() < MAX_ATTEMPTS;
    }

    /**
     * Reset số lần thử cho email
     */
    @Transactional
    public void resetAttempts(String email) {
        attemptRepository.findByEmail(email).ifPresent(attempt -> {
            attempt.setAttemptCount(0);
            attempt.setBlockedUntil(null);
            attemptRepository.save(attempt);
            log.info("Reset attempts for email: {}", email);
        });
    }

    /**
     * Lấy số lần thử còn lại
     */
    public int getRemainingAttempts(String email) {
        return attemptRepository.findByEmail(email)
                .map(attempt -> {
                    if (attempt.isBlocked()) {
                        return 0;
                    }
                    return Math.max(0, MAX_ATTEMPTS - attempt.getAttemptCount());
                })
                .orElse(MAX_ATTEMPTS);
    }

    /**
     * Lấy thời gian còn lại của block (timezone-aware)
     */
    public Long getBlockedMinutesRemaining(String email) {
        return attemptRepository.findByEmail(email)
                .filter(PasswordResetAttempt::isBlocked)
                .map(attempt -> {
                    long minutes = java.time.Duration.between(
                        ZonedDateTime.now(ZoneId.systemDefault()), 
                        attempt.getBlockedUntil().atZone(ZoneId.systemDefault())
                    ).toMinutes();
                    return Math.max(0, minutes);
                })
                .orElse(0L);
    }
}
