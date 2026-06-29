package spring.api.authservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import spring.api.authservice.domain.PasswordResetToken;
import spring.api.authservice.domain.User;
import spring.api.authservice.exception.AuthException;
import spring.api.authservice.repository.PasswordResetTokenRepository;
import spring.api.authservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PasswordResetServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private EmailService emailService;
    @Mock private RateLimitService rateLimitService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRequestPasswordReset_Success() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("user@example.com");
        user.setFullName("Test User");

        when(rateLimitService.isBlocked("user@example.com")).thenReturn(false);
        when(rateLimitService.checkAndIncrementAttempts("user@example.com", "127.0.0.1")).thenReturn(true);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(i -> i.getArgument(0));

        passwordResetService.requestPasswordReset("user@example.com", "127.0.0.1");

        verify(tokenRepository, times(1)).deleteByEmail("user@example.com");
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq("user@example.com"), anyString(), eq("Test User"));
    }

    @Test
    void testRequestPasswordReset_Blocked_ThrowsException() {
        when(rateLimitService.isBlocked("user@example.com")).thenReturn(true);
        when(rateLimitService.getBlockedMinutesRemaining("user@example.com")).thenReturn(10L);

        assertThrows(AuthException.class, () -> passwordResetService.requestPasswordReset("user@example.com", "127.0.0.1"));
    }

    @Test
    void testVerifyResetToken_Valid() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("123456");
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(15));

        when(tokenRepository.findByEmailAndTokenAndUsedFalse("user@example.com", "123456"))
                .thenReturn(Optional.of(token));

        assertTrue(passwordResetService.verifyResetToken("user@example.com", "123456"));
    }

    @Test
    void testResetPassword_Success() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("123456");
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(15));

        User user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");

        when(tokenRepository.findByEmailAndTokenAndUsedFalse("user@example.com", "123456"))
                .thenReturn(Optional.of(token));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        passwordResetService.resetPassword("user@example.com", "123456", "newPassword");

        assertTrue(token.getUsed());
        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).save(token);
        verify(rateLimitService, times(1)).resetAttempts("user@example.com");
    }
}
