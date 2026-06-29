package spring.api.authservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import spring.api.authservice.domain.User;
import spring.api.authservice.domain.UserRole;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secretKey = "myverysecretkeythatisatleast32byteslongtomeetHS256requirements!!!";
    private final long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", expiration);
    }

    @Test
    void testGenerateAndExtractToken_Ok() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUserId(1L);
        user.setRole(UserRole.CUSTOMER);
        user.setFullName("Test User");
        user.setPhone("0987654321");

        String token = jwtService.generateToken(user);
        assertNotNull(token);

        assertEquals("test@example.com", jwtService.extractUsername(token));
        assertEquals(1L, jwtService.extractUserId(token));
        assertEquals("CUSTOMER", jwtService.extractRole(token));
    }

    @Test
    void testTokenValidation_Valid() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUserId(1L);
        user.setRole(UserRole.CUSTOMER);
        user.setFullName("Test User");
        user.setPhone("0987654321");

        String token = jwtService.generateToken(user);
        
        org.springframework.security.core.userdetails.User userDetails = 
            new org.springframework.security.core.userdetails.User("test@example.com", "password", Collections.emptyList());
            
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testTokenValidation_InvalidUsername() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setUserId(1L);
        user.setRole(UserRole.CUSTOMER);
        user.setFullName("Test User");
        user.setPhone("0987654321");

        String token = jwtService.generateToken(user);
        
        org.springframework.security.core.userdetails.User userDetails = 
            new org.springframework.security.core.userdetails.User("wrong@example.com", "password", Collections.emptyList());
            
        assertFalse(jwtService.isTokenValid(token, userDetails));
    }
}
