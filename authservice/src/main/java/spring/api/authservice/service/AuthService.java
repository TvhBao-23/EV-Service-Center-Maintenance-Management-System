package spring.api.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import spring.api.authservice.api.dto.AuthResponse;
import spring.api.authservice.api.dto.ChangePasswordRequest;
import spring.api.authservice.api.dto.LoginRequest;
import spring.api.authservice.api.dto.RegisterRequest;
import spring.api.authservice.domain.Customer;
import spring.api.authservice.domain.User;
import spring.api.authservice.domain.UserRole;
import spring.api.authservice.repository.CustomerRepository;
import spring.api.authservice.repository.UserRepository;
import spring.api.authservice.service.JwtService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    // In-memory OTP storage (in production, use Redis or database)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

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
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        // Get user from database
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        // Get user from database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    // Forgot password methods
    public String sendOTP(String email) {
        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", (int)(Math.random() * 1000000));
        
        // Store OTP (in production, set expiry time and use Redis)
        otpStorage.put(email, otp);
        
        // TODO: Send email with OTP (integrate with email service)
        System.out.println("OTP for " + email + ": " + otp);
        
        return otp; // Return for demo, remove in production
    }
    
    public boolean verifyOTP(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp == null) {
            throw new RuntimeException("OTP không tồn tại hoặc đã hết hạn");
        }
        // Don't remove OTP here - it will be removed after password reset
        return storedOtp.equals(otp);
    }
    
    public void resetPasswordWithOTP(String email, String otp, String newPassword) {
        // Verify OTP first
        if (!verifyOTP(email, otp)) {
            throw new RuntimeException("OTP không chính xác");
        }
        
        // Reset password
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Remove used OTP
        otpStorage.remove(email);
    }
}