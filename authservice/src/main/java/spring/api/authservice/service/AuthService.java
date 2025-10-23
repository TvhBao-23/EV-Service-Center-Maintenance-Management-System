package spring.api.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import spring.api.authservice.api.dto.AuthResponse;
import spring.api.authservice.api.dto.LoginRequest;
import spring.api.authservice.api.dto.RegisterRequest;
import spring.api.authservice.domain.Customer;
import spring.api.authservice.domain.User;
import spring.api.authservice.domain.UserRole;
import spring.api.authservice.repository.CustomerRepository;
import spring.api.authservice.repository.UserRepository;
import spring.api.authservice.service.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setRole(request.role() != null ? request.role() : UserRole.customer);

        User savedUser = userRepository.save(user);

        // Create customer if role is customer
        if (savedUser.getRole() == UserRole.customer) {
            Customer customer = new Customer();
            customer.setUserId(savedUser.getUserId());
            customer.setAddress("");
            customerRepository.save(customer);
        }

        // Generate JWT token
        String jwtToken = jwtService.generateToken(savedUser);
        return new AuthResponse(jwtToken);
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // Get user from database
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }
}