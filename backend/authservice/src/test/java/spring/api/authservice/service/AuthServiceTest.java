package spring.api.authservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import spring.api.authservice.api.dto.AuthResponse;
import spring.api.authservice.api.dto.ChangePasswordRequest;
import spring.api.authservice.api.dto.LoginRequest;
import spring.api.authservice.api.dto.RegisterRequest;
import spring.api.authservice.domain.Customer;
import spring.api.authservice.domain.User;
import spring.api.authservice.domain.UserRole;
import spring.api.authservice.exception.AuthException;
import spring.api.authservice.repository.CustomerRepository;
import spring.api.authservice.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest(
                "new@example.com",
                "password123",
                "New User",
                "0987654321",
                UserRole.CUSTOMER
        );

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        
        User savedUser = new User();
        savedUser.setUserId(10L);
        savedUser.setEmail("new@example.com");
        savedUser.setRole(UserRole.CUSTOMER);
        
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mockedToken");

        AuthResponse response = authService.register(request);
        assertNotNull(response);
        assertEquals("mockedToken", response.token());

        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void testRegister_EmailAlreadyExists_ThrowsAuthException() {
        RegisterRequest request = new RegisterRequest(
                "existing@example.com",
                "password123",
                "Existing User",
                null,
                UserRole.CUSTOMER
        );

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(AuthException.class, () -> authService.register(request));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        User user = new User();
        user.setEmail("test@example.com");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("mockedToken");

        AuthResponse response = authService.login(request);
        assertNotNull(response);
        assertEquals("mockedToken", response.token());
    }

    @Test
    void testLogin_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testChangePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest("oldPassword", "newPassword");
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("encodedOldPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        authService.changePassword("test@example.com", request);

        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }
}
