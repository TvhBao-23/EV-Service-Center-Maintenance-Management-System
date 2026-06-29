package spring.api.authservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import spring.api.authservice.domain.PasswordResetAttempt;
import spring.api.authservice.repository.PasswordResetAttemptRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RateLimitServiceTest {

    @Mock
    private PasswordResetAttemptRepository attemptRepository;

    @InjectMocks
    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testIsBlocked_NotBlocked() {
        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        assertFalse(rateLimitService.isBlocked("test@example.com"));
    }

    @Test
    void testIsBlocked_CurrentlyBlocked() {
        PasswordResetAttempt attempt = new PasswordResetAttempt();
        attempt.setEmail("test@example.com");
        attempt.setAttemptCount(5);
        attempt.setBlockedUntil(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(30));

        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.of(attempt));
        assertTrue(rateLimitService.isBlocked("test@example.com"));
    }

    @Test
    void testIsBlocked_BlockExpired_Resets() {
        PasswordResetAttempt attempt = new PasswordResetAttempt();
        attempt.setEmail("test@example.com");
        attempt.setAttemptCount(5);
        attempt.setBlockedUntil(LocalDateTime.now(ZoneId.systemDefault()).minusMinutes(1)); // Expired

        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.of(attempt));
        when(attemptRepository.save(any(PasswordResetAttempt.class))).thenReturn(attempt);

        assertFalse(rateLimitService.isBlocked("test@example.com"));
        assertEquals(0, attempt.getAttemptCount());
        assertNull(attempt.getBlockedUntil());
    }

    @Test
    void testCheckAndIncrementAttempts_NewUser() {
        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(attemptRepository.save(any(PasswordResetAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(rateLimitService.checkAndIncrementAttempts("test@example.com", "127.0.0.1"));
        verify(attemptRepository, times(1)).save(any(PasswordResetAttempt.class));
    }

    @Test
    void testCheckAndIncrementAttempts_BlockTriggered() {
        PasswordResetAttempt attempt = new PasswordResetAttempt();
        attempt.setEmail("test@example.com");
        attempt.setAttemptCount(4); // Next attempt will trigger block

        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.of(attempt));
        when(attemptRepository.save(any(PasswordResetAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertFalse(rateLimitService.checkAndIncrementAttempts("test@example.com", "127.0.0.1"));
        assertEquals(5, attempt.getAttemptCount());
        assertNotNull(attempt.getBlockedUntil());
    }

    @Test
    void testResetAttempts_ResetsSuccessfully() {
        PasswordResetAttempt attempt = new PasswordResetAttempt();
        attempt.setEmail("test@example.com");
        attempt.setAttemptCount(3);
        attempt.setBlockedUntil(LocalDateTime.now(ZoneId.systemDefault()).plusMinutes(10));

        when(attemptRepository.findByEmail("test@example.com")).thenReturn(Optional.of(attempt));
        when(attemptRepository.save(any(PasswordResetAttempt.class))).thenReturn(attempt);

        rateLimitService.resetAttempts("test@example.com");

        assertEquals(0, attempt.getAttemptCount());
        assertNull(attempt.getBlockedUntil());
        verify(attemptRepository, times(1)).save(attempt);
    }
}
